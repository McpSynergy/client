import { z } from '@zod/mini';

export type SchemaObject = {
  [key: string]: z.ZodMiniType;
};

export { z };

// MCP 组件相关类型定义
export interface PropertySchema {
  required?: boolean;
  type?: string;
  [key: string]: any;
}

export interface ComponentSchema {
  name: string;
  serverName?: string;
  propertySchema:
  | Record<string, PropertySchema>  // React 格式
  | {                               // Vue 格式
    properties: Record<string, PropertySchema>;
    required?: string[];
  };
  [key: string]: any;
}

export interface MCPValidationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class ClientCore<Props = any> {
  // zod 校验 props 属性是否合法
  public validateProps(props: Props, schema?: SchemaObject): MCPValidationResult {
    if (!schema) {
      return {
        success: true,
        data: props,
      };
    }

    try {
      const userSchema = z.object(schema);
      const validatedData = userSchema.parse(props);
      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation error:', error);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // MCP 组件校验逻辑
  public validateMCPComponent(
    name: string,
    serverName: string | undefined,
    props: Record<string, any>,
    componentData: ComponentSchema[]
  ): MCPValidationResult {
    try {
      // 查找组件数据
      const component = componentData.find(
        (comp) => comp.name === name && comp.serverName === serverName
      );

      if (!component) {
        throw new Error(
          `No schema found for component: ${name}${serverName ? ` (server: ${serverName})` : ""}`
        );
      }

      const propertySchema = component.propertySchema;
      if (!propertySchema) {
        throw new Error(
          `No property schema found for component: ${name}${serverName ? ` (server: ${serverName})` : ""}`
        );
      }

      // 获取必需属性列表（支持两种格式）
      const requiredProps = this.getRequiredProps(propertySchema);

      // 检查缺失的必需属性
      const missingProps = requiredProps.filter((prop) => !(prop in props));
      if (missingProps.length > 0) {
        throw new Error(`Missing required props: ${missingProps.join(", ")}`);
      }

      // 执行类型校验（可选）
      const typeValidationResult = this.validatePropTypes(props, propertySchema);
      if (!typeValidationResult.success) {
        throw new Error(typeValidationResult.error);
      }

      return {
        success: true,
        data: props,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      if (process.env.NODE_ENV === 'development') {
        console.error('MCP Component validation error:', error);
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // 获取必需属性列表（支持两种格式）
  private getRequiredProps(
    propertySchema:
      | Record<string, PropertySchema>
      | { properties: Record<string, PropertySchema>; required?: string[] }
  ): string[] {
    // Vue 格式：{ properties: {...}, required: [...] }
    if (this.isVuePropertySchema(propertySchema)) {
      return propertySchema.required || [];
    }

    // React 格式：Record<string, PropertySchema>
    return Object.entries(propertySchema)
      .filter(([_, schema]) => schema.required)
      .map(([prop]) => prop);
  }

  // 类型守卫：检查是否为 Vue 格式的 property schema
  private isVuePropertySchema(
    propertySchema:
      | Record<string, PropertySchema>
      | { properties: Record<string, PropertySchema>; required?: string[] }
  ): propertySchema is { properties: Record<string, PropertySchema>; required?: string[] } {
    return 'properties' in propertySchema && typeof propertySchema.properties === 'object';
  }

  // 属性类型校验
  private validatePropTypes(
    props: Record<string, any>,
    propertySchema:
      | Record<string, PropertySchema>
      | { properties: Record<string, PropertySchema>; required?: string[] }
  ): MCPValidationResult {
    try {
      const properties = this.isVuePropertySchema(propertySchema)
        ? propertySchema.properties
        : propertySchema;

      for (const [propName, propValue] of Object.entries(props)) {
        const schema = properties[propName];
        if (!schema) {
          // 如果属性不在 schema 中，跳过（允许额外属性）
          continue;
        }

        if (schema.type && propValue !== undefined) {
          const isValidType = this.validatePropType(propValue, schema.type);
          if (!isValidType) {
            throw new Error(
              `Invalid type for prop "${propName}": expected ${schema.type}, got ${typeof propValue}`
            );
          }
        }
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Type validation failed';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // 基础类型校验
  private validatePropType(value: any, expectedType: string): boolean {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      case 'function':
        return typeof value === 'function';
      default:
        // 对于未知类型，返回 true（不严格校验）
        return true;
    }
  }

  // 工具方法：生成组件键
  public getComponentKey(name: string, serverName?: string): string {
    return `${name}:${serverName || ""}`;
  }

  // 工具方法：生成安全的导出名称
  public getSafeExportName(name: string, serverName?: string): string {
    const key = this.getComponentKey(name, serverName);
    return key.replace(/[^a-zA-Z0-9_$]/g, "_");
  }
}

// 导出单例实例
export const clientCore = new ClientCore();
