/**
 * acemcp MCP 服务器的配置管理
 * 从 ~/.acemcp/settings.toml 读取配置
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import * as toml from '@iarna/toml';

/**
 * 默认配置值
 */
const DEFAULT_CONFIG = {
  BATCH_SIZE: 10,
  MAX_LINES_PER_BLOB: 800,
  BASE_URL: 'https://api.example.com',
  TOKEN: 'your-token-here',
  // 是否在搜索前自动执行项目增量索引，默认开启保证结果最新
  AUTO_INDEX_ON_SEARCH: true,
  TEXT_EXTENSIONS: [
    '.py',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.java',
    '.go',
    '.rs',
    '.cpp',
    '.c',
    '.h',
    '.hpp',
    '.cs',
    '.rb',
    '.php',
    '.md',
    '.txt',
    '.json',
    '.yaml',
    '.yml',
    '.toml',
    '.xml',
    '.html',
    '.css',
    '.scss',
    '.sql',
    '.sh',
    '.bash',
  ],
  EXCLUDE_PATTERNS: [
    '.venv',
    'venv',
    '.env',
    'env',
    'node_modules',
    '.git',
    '.svn',
    '.hg',
    '__pycache__',
    '.pytest_cache',
    '.mypy_cache',
    '.tox',
    '.eggs',
    '*.egg-info',
    'dist',
    'build',
    '.idea',
    '.vscode',
    '.DS_Store',
    '*.pyc',
    '*.pyo',
    '*.pyd',
    '.Python',
    'pip-log.txt',
    'pip-delete-this-directory.txt',
    '.coverage',
    'htmlcov',
    '.gradle',
    'target',
    'bin',
    'obj',
  ],
};

/**
 * 用户配置和数据路径
 */
export const USER_CONFIG_DIR = path.join(os.homedir(), '.acemcp');
export const USER_CONFIG_FILE = path.join(USER_CONFIG_DIR, 'settings.toml');
export const USER_DATA_DIR = path.join(USER_CONFIG_DIR, 'data');

/**
 * 确保用户配置文件存在
 */
function ensureUserConfig(): string {
  // 创建配置目录
  if (!fs.existsSync(USER_CONFIG_DIR)) {
    fs.mkdirSync(USER_CONFIG_DIR, { recursive: true });
  }

  // 创建数据目录
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  // 如果不存在则创建配置文件
  if (!fs.existsSync(USER_CONFIG_FILE)) {
    const configContent = toml.stringify(DEFAULT_CONFIG as any);
    fs.writeFileSync(USER_CONFIG_FILE, configContent, 'utf-8');
  }

  return USER_CONFIG_FILE;
}

/**
 * MCP 服务器配置类
 */
export class Config {
  private cliBaseUrl?: string;
  private cliToken?: string;

  indexStoragePath: string;
  batchSize: number;
  maxLinesPerBlob: number;
  // 是否在搜索前自动执行增量索引
  autoIndexOnSearch: boolean;
  baseUrl: string;
  token: string;
  textExtensions: Set<string>;
  excludePatterns: string[];

  constructor(baseUrl?: string, token?: string) {
    this.cliBaseUrl = baseUrl;
    this.cliToken = token;

    // 确保配置文件存在
    ensureUserConfig();

    // 加载配置
    this.indexStoragePath = USER_DATA_DIR;
    const settings = this.loadSettings();

    this.batchSize = settings.BATCH_SIZE ?? DEFAULT_CONFIG.BATCH_SIZE;
    this.maxLinesPerBlob = settings.MAX_LINES_PER_BLOB ?? DEFAULT_CONFIG.MAX_LINES_PER_BLOB;
    // TOML 中使用 AUTO_INDEX_ON_SEARCH 控制搜索前是否自动索引，未配置时使用默认值 true
    this.autoIndexOnSearch =
      settings.AUTO_INDEX_ON_SEARCH ?? DEFAULT_CONFIG.AUTO_INDEX_ON_SEARCH;
    this.baseUrl = baseUrl || settings.BASE_URL || DEFAULT_CONFIG.BASE_URL;
    this.token = token || settings.TOKEN || DEFAULT_CONFIG.TOKEN;
    this.textExtensions = new Set(settings.TEXT_EXTENSIONS ?? DEFAULT_CONFIG.TEXT_EXTENSIONS);
    this.excludePatterns = settings.EXCLUDE_PATTERNS ?? DEFAULT_CONFIG.EXCLUDE_PATTERNS;
  }

  /**
   * 从 TOML 文件加载设置
   */
  private loadSettings(): any {
    try {
      const content = fs.readFileSync(USER_CONFIG_FILE, 'utf-8');
      return toml.parse(content);
    } catch (error) {
      // 加载失败时使用默认值
      return {};
    }
  }

  /**
   * 从文件重新加载配置
   */
  reload(): void {
    const settings = this.loadSettings();

    this.indexStoragePath = USER_DATA_DIR;
    this.batchSize = settings.BATCH_SIZE ?? DEFAULT_CONFIG.BATCH_SIZE;
    this.maxLinesPerBlob = settings.MAX_LINES_PER_BLOB ?? DEFAULT_CONFIG.MAX_LINES_PER_BLOB;
     // 重新加载时同步刷新 autoIndexOnSearch，确保 Web 配置修改后立即生效
    this.autoIndexOnSearch =
      settings.AUTO_INDEX_ON_SEARCH ?? DEFAULT_CONFIG.AUTO_INDEX_ON_SEARCH;
    this.baseUrl = this.cliBaseUrl || settings.BASE_URL || DEFAULT_CONFIG.BASE_URL;
    this.token = this.cliToken || settings.TOKEN || DEFAULT_CONFIG.TOKEN;
    this.textExtensions = new Set(settings.TEXT_EXTENSIONS ?? DEFAULT_CONFIG.TEXT_EXTENSIONS);
    this.excludePatterns = settings.EXCLUDE_PATTERNS ?? DEFAULT_CONFIG.EXCLUDE_PATTERNS;
  }

  /**
   * 验证配置
   */
  validate(): void {
    if (this.batchSize <= 0) {
      throw new Error('BATCH_SIZE must be positive');
    }
    if (this.maxLinesPerBlob <= 0) {
      throw new Error('MAX_LINES_PER_BLOB must be positive');
    }
    if (!this.baseUrl) {
      throw new Error('BASE_URL must be configured');
    }
    if (!this.token) {
      throw new Error('TOKEN must be configured');
    }
  }
}

/**
 * 全局配置实例
 */
let configInstance: Config | undefined;

/**
 * 获取全局配置实例
 */
export function getConfig(): Config {
  if (!configInstance) {
    configInstance = new Config();
  }
  return configInstance;
}

/**
 * 使用命令行参数初始化配置
 */
export function initConfig(baseUrl?: string, token?: string): Config {
  configInstance = new Config(baseUrl, token);
  return configInstance;
}
