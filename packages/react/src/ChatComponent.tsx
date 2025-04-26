import React, { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
// @ts-ignore
import MCPComponentImports from 'virtual:mcp-comp/imports';

interface ChatComponentProps {
  name: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: Record<string, any>;
}

export const ChatComponent = ({
  name,
  props = {},
  fallback = <div>loading...</div>,
  errorFallback = <div>error</div>,
}: ChatComponentProps) => {
  const DynamicComponent = useState(() =>
    lazy(() => MCPComponentImports[name]()),
  )[0];

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <DynamicComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};
