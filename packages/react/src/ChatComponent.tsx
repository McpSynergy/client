import React, { lazy, Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
// @ts-ignore
import MCPComponentImports from "virtual:mcp-comp/imports";
// @ts-ignore
import MCPComponentData from "virtual:mcp-comp/data.json";

interface PropertySchema {
  required?: boolean;
  type?: string;
  [key: string]: any;
}

interface ComponentSchema {
  name: string;
  propertySchema: Record<string, PropertySchema>;
  [key: string]: any;
}

interface ChatComponentProps {
  name: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: Record<string, any>;
}

const validateComponent = (name: string, props: Record<string, any>) => {
  const componentData = (MCPComponentData as ComponentSchema[]).find(
    (comp) => comp.name === name,
  );

  if (!componentData) {
    throw new Error(`No schema found for component: ${name}`);
  }

  const componentSchema = componentData.propertySchema;
  if (!componentSchema) {
    throw new Error(`No property schema found for component: ${name}`);
  }

  const requiredProps = Object.entries(componentSchema)
    .filter(([_, schema]) => (schema as PropertySchema).required)
    .map(([prop]) => prop);

  const missingProps = requiredProps.filter((prop) => !(prop in props));
  if (missingProps.length > 0) {
    throw new Error(`Missing required props: ${missingProps.join(", ")}`);
  }
};

export const ChatComponent = ({
  name,
  props = {},
  fallback = <div>Validating component...</div>,
  errorFallback = <div>Failed to validate component</div>,
}: ChatComponentProps) => {
  const DynamicComponent = useState(() =>
    lazy(() => MCPComponentImports[name]()),
  )[0];
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setIsValidating(true);
    setValidationError(null);
    try {
      validateComponent(name, props);
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Failed to validate component",
      );
    } finally {
      setIsValidating(false);
    }
  }, [name, props]);

  if (isValidating) {
    return fallback;
  }

  if (validationError) {
    return errorFallback;
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <DynamicComponent name={name} props={props} />
      </Suspense>
    </ErrorBoundary>
  );
};
