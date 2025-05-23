// 1. 创建一个配置推送服务类
export class ConfigPushService {
  private static instance: ConfigPushService;
  private configCache: Map<string, any> = new Map();

  private constructor() { }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ConfigPushService();
    }
    return this.instance;
  }

  // 推送配置到后端
  async pushConfig(config: any, options: {
    serverUrl: string;
    projectId: string;
    env?: string;
    headers?: Record<string, string>;
    [key: string]: any;
  }) {

    console.log({
      options
    });

    const { serverUrl, projectId, env, headers, ...rest } = options;
    try {

      await fetch(options.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          projectId: options.projectId,
          env: options.env || 'development',
          config: config.map((c: any) => {
            // 剔除 filePath
            const { filePath, ...rest } = c;
            return rest;
          }),
          timestamp: Date.now(),
          ...rest,
        })
      });

      // 更新缓存
      this.configCache.set(options.projectId, config);
      return true;
    } catch (error) {
      console.error('配置推送错误:', error);
      return false;
    }
  }

  // 获取缓存的配置
  getCachedConfig(projectId: string) {
    return this.configCache.get(projectId);
  }
}
