declare module 'virtual:mcp-comp/imports' {
  import type { ComponentType } from 'react';
  // Export all components as named exports
  export const components: Record<string, ComponentType>;

  // Export each component individually
  export const [componentNames]: ComponentType[];
}

declare module 'virtual:mcp-comp/data.json' {
  interface ComponentData {
    name: string;
    propSchema: Record<string, any>;
    [key: string]: any;
  }

  const data: ComponentData[];
  export default data;
}
