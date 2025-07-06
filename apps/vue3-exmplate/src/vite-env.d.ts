/// <reference types="vite/client" />

// MCP Vue 组件宏的类型定义
declare global {
  interface MCPComponentConfig {
    /** 组件名称 */
    name: string;
    /** 组件描述 */
    description?: string;
    /** 组件版本 */
    version?: string;
    /** 服务器名称 */
    serverName?: string;
    /** 输入 Schema 配置 */
    inputSchema?: {
      /** 必需的属性列表 */
      required?: string[];
      /** 可选的属性列表 */
      optional?: string[];
      /** 自定义属性配置 */
      properties?: Record<string, {
        description?: string;
        default?: any;
        enum?: any[];
        minimum?: number;
        maximum?: number;
        pattern?: string;
        format?: string;
      }>;
    };
    [key: string]: any;
  }

  /**
   * 定义 MCP 组件的宏函数
   * @param config MCP 组件配置
   * @returns 配置对象
   */
  function defineMCPComponent(config: MCPComponentConfig): MCPComponentConfig;
}

export { };
