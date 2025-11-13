#!/usr/bin/env node

/**
 * 代码库索引的 MCP 服务器
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { initConfig, getConfig } from './config.js';
import { setupLogging, logger } from './logger.js';
import { searchContextTool } from './tools/searchContext.js';
import { createApp } from './web/app.js';

/**
 * 解析命令行参数
 */
function parseArgs(): {
  baseUrl?: string;
  token?: string;
  webPort?: number;
  autoIndexOnSearch?: boolean;
} {
  const args = process.argv.slice(2);
  const result: {
    baseUrl?: string;
    token?: string;
    webPort?: number;
    autoIndexOnSearch?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--base-url' && i + 1 < args.length) {
      result.baseUrl = args[i + 1];
      i++;
    } else if (arg === '--token' && i + 1 < args.length) {
      result.token = args[i + 1];
      i++;
    } else if (arg === '--web-port' && i + 1 < args.length) {
      result.webPort = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--no-auto-index-on-search') {
      // 通过命令行参数显式关闭搜索前自动索引，提高大项目中的搜索性能
      result.autoIndexOnSearch = false;
      i++;
    }
  }

  return result;
}

/**
 * 创建 MCP 服务器
 */
const server = new Server(
  {
    name: 'acemcp',
    version: '0.1.4',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 列出可用工具
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: 'search_context',
      description:
        'Search for relevant code context based on a query within a specific project. This tool automatically performs incremental indexing before searching, ensuring results are always up-to-date. Returns formatted text snippets from the codebase that are semantically related to your query. Supports cross-platform paths including Windows WSL.',
      inputSchema: {
        type: 'object',
        properties: {
          project_root_path: {
            type: 'string',
            description:
              'Absolute path to the project root directory. Supports cross-platform paths: Windows (C:/Users/...), WSL UNC (\\\\wsl$\\Ubuntu\\home\\...), Unix (/home/...), WSL-to-Windows (/mnt/c/...). Paths are automatically normalized.',
          },
          query: {
            type: 'string',
            description:
              "Natural language search query to find relevant code context. This tool performs semantic search and returns code snippets that match your query. Examples: 'logging configuration setup initialization logger' (finds logging setup code), 'user authentication login' (finds auth-related code), 'database connection pool' (finds DB connection code), 'error handling exception' (finds error handling patterns), 'API endpoint routes' (finds API route definitions). The tool returns formatted text snippets with file paths and line numbers showing where the relevant code is located.",
          },
        },
        required: ['project_root_path', 'query'],
      },
    },
  ];

  return { tools };
});

/**
 * 处理工具调用
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info(`Tool called: ${name} with arguments: ${JSON.stringify(args)}`);

  if (name === 'search_context') {
    const result = await searchContextTool(args as any);
    return {
      content: [
        {
          type: 'text',
          text: result.text,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: `Unknown tool: ${name}`,
      },
    ],
  };
});

/**
 * 启动 Web 服务器
 */
async function startWebServer(port: number): Promise<void> {
  const http = await import('http');
  const { setupWebSocket } = await import('./web/app.js');
  
  const app = createApp();
  
  // 创建 HTTP 服务器
  const httpServer = http.createServer(app);
  
  // 启动服务器，添加错误处理
  return new Promise((resolve) => {
    // 必须在 listen() 之前注册错误处理器
    httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.warning(`Port ${port} is already in use. Web interface will not start.`);
        logger.warning(`If another instance is running, you can access the web interface at http://localhost:${port}`);
        resolve(); // 优雅降级，不阻止 MCP 服务器启动
      } else {
        logger.error(`Failed to start web server: ${error.message}`);
        resolve(); // 即使其他错误也不阻止 MCP 服务器
      }
    });
    
    // 启动服务器
    httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`Web management interface running on http://localhost:${port}`);
      
      // 只在 HTTP 服务器成功启动后才设置 WebSocket
      try {
        setupWebSocket(httpServer);
      } catch (error: any) {
        logger.error(`Failed to setup WebSocket: ${error.message}`);
      }
      
      resolve();
    });
  });
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const { baseUrl, token, webPort, autoIndexOnSearch } = parseArgs();

    // 如果启用了 Web 界面，先设置日志广播支持
    if (webPort) {
      // 初始化日志广播器
      const { getLogBroadcaster } = await import('./web/logBroadcaster.js');
      getLogBroadcaster();
    }

    // 设置日志
    setupLogging();

    // 初始化配置
    const config = initConfig(baseUrl, token);
    if (autoIndexOnSearch === false) {
      // 当通过命令行显式关闭自动索引时，记录提示日志，方便在日志中排查性能相关行为
      config.autoIndexOnSearch = false;
    }
    config.validate();

    logger.info('正在启动 acemcp MCP 服务器...');
    logger.info(
      `配置: index_storage_path=${config.indexStoragePath}, batch_size=${config.batchSize}`
    );
    logger.info(`API: base_url=${config.baseUrl}`);
    logger.info(
      `搜索前自动索引: ${config.autoIndexOnSearch ? '已启用（保证最新索引）' : '已关闭（仅使用已有索引，性能更佳）'}`
    );

    // 如果请求，启动 Web 服务器
    if (webPort) {
      logger.info(`正在启动 Web 管理界面，端口 ${webPort}`);
      await startWebServer(webPort);
    }

    // 在 stdio 上启动 MCP 服务器
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('MCP 服务器已通过 stdio 连接');
  } catch (error: any) {
    logger.exception('Server error', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  console.error('致命错误:', error);
  process.exit(1);
});
