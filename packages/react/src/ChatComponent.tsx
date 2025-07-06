import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { clientCore, ComponentSchema } from "@mcp-synergy/client-core";
import MCPComponentImports from "virtual:mcp-comp/imports";
import MCPComponentData from "virtual:mcp-comp/data";

export const MCPComponentContext = createContext<{
  isMCPComponent: boolean;
}>({
  isMCPComponent: false,
});

export const useMCPComponent = () => useContext(MCPComponentContext);

interface ChatComponentProps {
  name: string;
  serverName?: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: Record<string, any>;
}

export const ChatComponent = ({
  name,
  serverName,
  props = {},
  fallback = <div>Validating component...</div>,
  errorFallback = <div>Failed to validate component</div>,
}: ChatComponentProps) => {
  const safeExportName = clientCore.getSafeExportName(name, serverName);
  const DynamicComponent = useState(() =>
    lazy(() => MCPComponentImports[safeExportName]()),
  )[0];
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setIsValidating(true);
    setValidationError(null);

    if (!name) {
      setIsValidating(true);
      return;
    }

    const validationResult = clientCore.validateMCPComponent(
      name,
      serverName,
      props,
      MCPComponentData as ComponentSchema[],
    );

    if (!validationResult.success) {
      setValidationError(
        validationResult.error || "Failed to validate component",
      );
      console.error(validationResult.error);
    }

    setIsValidating(false);
  }, [name, serverName, props]);

  if (isValidating) {
    return fallback;
  }

  if (validationError) {
    return errorFallback;
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <MCPComponentContext.Provider
          value={{
            isMCPComponent: true,
          }}
        >
          <DynamicComponent _mcp_comp_name={name} {...props} />
        </MCPComponentContext.Provider>
      </Suspense>
    </ErrorBoundary>
  );
};
