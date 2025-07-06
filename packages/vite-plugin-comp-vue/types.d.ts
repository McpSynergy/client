declare module 'virtual:mcp-comp-vue/data' {
  interface ComponentData {
    name: string;
    serverName?: string;
    [key: string]: any;
  }

  const data: ComponentData[];
  export default data;
}

declare module 'virtual:mcp-comp-vue/imports' {
  import type { Component } from 'vue';

  // Export components with safe names (name_serverName format)
  const imports: Record<string, () => Promise<Component>>;
  export default imports;
}

declare module '@vue/compiler-sfc' {
  export function parse(
    source: string,
    options?: { filename?: string }
  ): {
    descriptor: {
      script?: { content: string };
      scriptSetup?: { content: string };
      template?: { content: string };
      styles?: { content: string }[];
    };
  };
}

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
   * 定义 MCP 组件的配置
   */
  function defineMCPComponent(config: MCPComponentConfig): void;
} 