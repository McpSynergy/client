
// 导入 client-core 中的全局类型声明
import '@mcp-synergy/client-core';

interface MCPComponentConfig {
  /** 组件名称 */
  name: string;
  /** 组件描述 */
  description?: string;
  /** 组件版本 */
  version?: string;
  /** 服务器名称 */
  serverName: string;
  pickProps?: string[];
  /** 输入 Schema 配置 */
  inputSchema?: {
    /** 必需的属性列表 */
    required?: string[];
    /** 自定义属性配置 */
    properties?: Record<string, {
      type?: string | string[];
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
 * 定义 MCP 组件的配置函数
 * 这个函数在运行时只是返回配置对象，但在构建时会被 Vite 插件解析
 * @param config MCP 组件配置
 * @returns 配置对象
 */
export function defineMCPComponent(config: MCPComponentConfig): MCPComponentConfig {
  return config;
}

export type { MCPComponentConfig };
export { default as ChatComponent } from './ChatComponent.vue';
export * from './composables'; 