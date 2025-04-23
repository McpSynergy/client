import React, { Suspense, useState, useEffect } from "react";

import { ClientCore, SchemaObject } from "@mcp-synergy/client-core";

interface DynamicRenderProps {
  path: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: Record<string, any>;
  propsSchema?: SchemaObject;
}

const useErrorBoundary = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      setHasError(true);
      console.error("Component error:", error);
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  return {
    hasError,
    resetError: () => setHasError(false),
  };
};

const useDynamicComponent = (path: string) => {
  const DynamicComponent = React.lazy(() => import(path));
  return DynamicComponent;
};

const useDynamicRender = () => {
  const dynamicRender = ({
    path,
    props = {},
    propsSchema,
    fallback = <div>loading...</div>,
    errorFallback = <div>error</div>,
  }: DynamicRenderProps) => {
    const { hasError } = useErrorBoundary();
    const DynamicComponent = useDynamicComponent(path);
    const clientCore = new ClientCore();
    const valid = clientCore?.validateProps(props, propsSchema);

    if (hasError || (!!valid && !valid?.success)) {
      return errorFallback;
    }

    return (
      <Suspense fallback={fallback}>
        <DynamicComponent {...props} />
      </Suspense>
    );
  };
  return {
    dynamicRender,
  };
};

export default useDynamicRender;
