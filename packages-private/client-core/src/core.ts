import { z } from '@zod/mini';


export type SchemaObject = {
  [key: string]: z.ZodMiniType;
};

export {
  z
}
export class ClientCore<Props = any> {
  // zod 校验 props 属性是否合法
  public validateProps(props: Props, schema?: SchemaObject) {
    if (!schema) {
      return {
        success: true,
        data: props
      };
    }
    // 使用自定义的schema验证
    const userSchema = z.object(schema);
    try {
      const validatedData = userSchema.parse(props);
      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation error:', error);
      }
      throw error;
    }
  }
}