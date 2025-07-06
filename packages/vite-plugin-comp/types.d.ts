declare module 'virtual:mcp-comp/imports' {
  import type { ComponentType } from 'react';

  // Export components with safe names (name_serverName format)
  const components: Record<string, ComponentType>;
  export default components;

  // Named exports use safe export names
  export const [safeExportNames]: ComponentType[];
}

declare module 'virtual:mcp-comp/data' {
  interface ComponentData {
    name: string;
    serverName?: string;
    propSchema: Record<string, any>;
    [key: string]: any;
  }

  const data: ComponentData[];
  export default data;
}
