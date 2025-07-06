// 虚拟模块类型声明
declare module "virtual:mcp-comp/imports" {
  const imports: Record<string, () => Promise<any>>;
  export default imports;
}

declare module "virtual:mcp-comp-vue/imports" {
  const imports: Record<string, () => Promise<any>>;
  export default imports;
}

declare module "virtual:mcp-comp/data" {
  import { ComponentSchema } from "./core";
  const data: ComponentSchema[];
  export default data;
}

declare module "virtual:mcp-comp-vue/data" {
  import { ComponentSchema } from "./core";
  const data: ComponentSchema[];
  export default data;
} 