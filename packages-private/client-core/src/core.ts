import { z } from 'zod';


export type SchemaObject = {
  [key: string]: z.ZodType;
};
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
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors
        };
      }
      throw error;
    }
  }
}