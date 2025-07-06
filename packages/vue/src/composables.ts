import { inject } from 'vue';

// MCP Component Context Symbol
export const MCPComponentSymbol = Symbol('MCPComponent');

// Composable to check if current component is an MCP component
export const useIsMCPComponent = () => {
  const context = inject(MCPComponentSymbol, null) as { isMCPComponent: boolean } | null;
  return context ? context.isMCPComponent : false;
};

// Composable to get MCP component context
export const useMCPComponent = () => {
  const context = inject(MCPComponentSymbol, null);
  return context || { isMCPComponent: false };
}; 