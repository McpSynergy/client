import React, { Suspense } from "react";
import { ClientCore, SchemaObject } from "@mcp-synergy/client-core";
import { ErrorBoundary } from "react-error-boundary";

interface DynamicRenderProps {
  path: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: Record<string, any>;
  propsSchema?: SchemaObject;
}

const useDynamicComponent = (path: string) => {
  const DynamicComponent = React.lazy(() => import(path));
  return DynamicComponent;
};

export const DynamicRender = ({
  path,
  props = {},
  propsSchema,
  fallback = <div>loading...</div>,
  errorFallback = <div>error</div>,
}: DynamicRenderProps) => {
  const DynamicComponent = useDynamicComponent(path);
  const clientCore = new ClientCore();
  const valid = clientCore?.validateProps(props, propsSchema);

  if (!!valid && !valid?.success) {
    return errorFallback;
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <DynamicComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};
