import fastGlob from 'fast-glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parse } from '@vue/compiler-sfc';
import type { ModuleNode, Plugin } from 'vite';
import { ConfigPushService } from './server';

// 使用 @babel/parser 进行更可靠的 JavaScript 解析
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

// 兼容 CommonJS 导入
const _traverse = (traverse as any).default || traverse;

const { glob } = fastGlob;

export interface MCPCompVueOptions {
  /** Vue 组件文件匹配模式 */
  include?: string;
  /** 忽略的文件模式 */
  exclude?: string[];
  /** 是否使用懒加载导入 */
  lazyImport?: boolean;
  /** 组件属性 schema 输出路径 */
  componentPropSchemaOutputPath?: string;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 是否推送配置到服务器 */
  pushConfig?: {
    serverUrl: string;
    projectId: string;
    env?: string;
    headers?: Record<string, string>;
    [key: string]: any;
  };
}

export interface MCPCompVueData {
  name: string;
  filePath: string;
  propertySchema: Record<string, any>;
  inputSchema?: {
    type: string;
    properties: Record<string, SchemaProperty>;
    required?: string[];
  };
  [key: string]: any;
}

interface SchemaProperty {
  type: string | string[];
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  items?: SchemaProperty;
}

// defineMCPComponent 宏的配置类型
interface MCPComponentConfig {
  name: string;
  description?: string;
  version?: string;
  serverName?: string;
  pickProps?: string[];  // 指定需要解析的属性名称
  inputSchema?: {
    required?: string[];
    properties?: Record<string, Partial<SchemaProperty>>;
  };
  [key: string]: any;
}

export function MCPCompVue(options: MCPCompVueOptions = {}): Plugin {
  const {
    include = 'src/**/*.vue',
    exclude = ['**/node_modules/**', '**/dist/**'],
    lazyImport = true,
    componentPropSchemaOutputPath = 'mcp-comp-vue-schema.json',
    debug = true,
  } = options;

  const configService = ConfigPushService.getInstance();
  let componentDataMap = new Map<string, MCPCompVueData>();

  function debugLog(message: string, data?: any) {
    if (debug) {
      console.log(`[MCP Comp Vue Debug] ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  function mapVueTypeToJsonSchema(typeString: string): string | string[] | null {
    // 清理类型字符串，移除空格但保留大小写敏感信息
    let cleanType = typeString.trim();

    debugLog(`解析类型: "${typeString}" -> "${cleanType}"`);

    // 跳过函数类型
    if (cleanType.includes('=>') ||
      cleanType.includes('Function') ||
      cleanType.includes('() =>') ||
      /\(\s*.*\s*\)\s*=>/i.test(cleanType)) {
      debugLog(`跳过函数类型: ${cleanType}`);
      return null; // 返回 null 表示跳过此属性
    }

    // 处理 Vue Ref 类型：Ref<T> -> T
    const refTypeMatch = cleanType.match(/(?:Ref|ComputedRef|MaybeRef|ShallowRef)<(.+)>/);
    if (refTypeMatch) {
      const innerType = refTypeMatch[1].trim();
      debugLog(`检测到 Ref 类型，提取内部类型: ${innerType}`);
      cleanType = innerType;
    }

    // 处理联合类型 (Union Types)，如 string | number
    if (cleanType.includes('|')) {
      const unionTypes = cleanType.split('|').map(t => t.trim());
      const mappedTypes = unionTypes
        .map(t => mapVueTypeToJsonSchemaBasic(t))
        .filter(t => t !== null && t !== 'any')
        .filter((value, index, self) => self.indexOf(value) === index); // 去重

      if (mappedTypes.length > 0) {
        debugLog(`联合类型解析结果: ${mappedTypes}`);
        return mappedTypes.length === 1 ? mappedTypes[0] : mappedTypes;
      }
    }

    // 处理数组类型
    if (cleanType.endsWith('[]')) {
      debugLog(`检测到数组类型: ${cleanType}`);
      return 'array';
    }

    // 处理泛型数组 Array<T>
    const arrayTypeMatch = cleanType.match(/Array<(.+)>/);
    if (arrayTypeMatch) {
      debugLog(`检测到泛型数组类型: ${cleanType}`);
      return 'array';
    }

    // 基本类型解析
    const basicType = mapVueTypeToJsonSchemaBasic(cleanType);
    debugLog(`基本类型解析结果: ${basicType}`);
    return basicType;
  }

  function mapVueTypeToJsonSchemaBasic(typeString: string): string {
    const cleanType = typeString.toLowerCase().trim();

    // 字符串类型
    if (cleanType === 'string' || cleanType === 'String') {
      return 'string';
    }

    // 数字类型
    if (cleanType === 'number' || cleanType === 'Number' ||
      cleanType === 'bigint' || cleanType === 'BigInt') {
      return 'number';
    }

    // 布尔类型
    if (cleanType === 'boolean' || cleanType === 'Boolean') {
      return 'boolean';
    }

    // 数组类型
    if (cleanType === 'array' || cleanType.endsWith('[]') ||
      cleanType.includes('array<') || cleanType.includes('Array<')) {
      return 'array';
    }

    // 对象类型
    if (cleanType === 'object' || cleanType === 'Object' ||
      cleanType === 'record' || cleanType.startsWith('{') ||
      cleanType.includes('Record<')) {
      return 'object';
    }

    // null 和 undefined
    if (cleanType === 'null' || cleanType === 'undefined' || cleanType === 'void') {
      return 'null';
    }

    // Date 类型
    if (cleanType === 'date' || cleanType === 'Date') {
      return 'string'; // JSON Schema 中日期通常表示为字符串
    }

    // 字面量类型 (如 'success' | 'error')
    if (cleanType.startsWith("'") && cleanType.endsWith("'") ||
      cleanType.startsWith('"') && cleanType.endsWith('"')) {
      return 'string';
    }

    // 数字字面量
    if (/^\d+$/.test(cleanType)) {
      return 'number';
    }

    // 其他复杂类型或未知类型
    return 'any';
  }

  function getComponentKey(name: string, serverName?: string): string {
    return `${name}:${serverName || ''}`;
  }

  async function saveSchemaOutputJson() {
    if (!componentPropSchemaOutputPath) return;

    try {
      const data = Array.from(componentDataMap.values());
      await fs.writeFile(
        componentPropSchemaOutputPath,
        JSON.stringify(data, null, 2),
      );
      console.log('Vue Schema 输出已保存到:', componentPropSchemaOutputPath);
      debugLog('保存的数据:', data);
    } catch (error) {
      console.error('保存 Vue Schema 输出时出错:', error);
    }
  }

  function getComponentNameFromFile(filePath: string) {
    return path.basename(filePath, path.extname(filePath));
  }

  // 解析 defineMCPComponent 宏调用 - 使用 @babel/parser
  function parseMCPComponentMacro(scriptContent: string): MCPComponentConfig | null {
    debugLog('开始解析 defineMCPComponent 宏 (使用 @babel/parser)');

    try {
      // 使用 @babel/parser 解析代码为 AST
      const ast = babelParse(scriptContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      let mcpConfig: MCPComponentConfig | null = null;

      // 遍历 AST 查找 defineMCPComponent 调用
      _traverse(ast, {
        CallExpression(path: any) {
          if (
            t.isIdentifier(path.node.callee, { name: 'defineMCPComponent' }) &&
            path.node.arguments.length > 0 &&
            t.isObjectExpression(path.node.arguments[0])
          ) {
            debugLog('找到 defineMCPComponent 调用');
            const configObj = path.node.arguments[0];
            mcpConfig = extractConfigFromObjectExpression(configObj);
          }
        }
      });

      if (mcpConfig) {
        debugLog('解析成功，MCP 配置:', JSON.stringify(mcpConfig, null, 2));
      } else {
        debugLog('未找到 defineMCPComponent 宏调用');
      }

      return mcpConfig;
    } catch (error) {
      console.error('Babel 解析失败:', error);
      debugLog('脚本内容:', scriptContent);
      return null;
    }
  }

  // 从对象表达式中提取配置
  function extractConfigFromObjectExpression(objExpr: t.ObjectExpression): MCPComponentConfig {
    const config: MCPComponentConfig = { name: '' };

    objExpr.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const key = prop.key.name;

        switch (key) {
          case 'name':
            if (t.isStringLiteral(prop.value)) {
              config.name = prop.value.value;
              debugLog('解析到组件名称:', config.name);
            }
            break;
          case 'description':
            if (t.isStringLiteral(prop.value)) {
              config.description = prop.value.value;
              debugLog('解析到组件描述:', config.description);
            }
            break;
          case 'version':
            if (t.isStringLiteral(prop.value)) {
              config.version = prop.value.value;
              debugLog('解析到组件版本:', config.version);
            }
            break;
          case 'serverName':
            if (t.isStringLiteral(prop.value)) {
              config.serverName = prop.value.value;
              debugLog('解析到服务器名称:', config.serverName);
            }
            break;
          case 'pickProps':
            if (t.isArrayExpression(prop.value)) {
              config.pickProps = prop.value.elements
                .filter((el): el is t.StringLiteral => t.isStringLiteral(el))
                .map(el => el.value);
              debugLog('解析到 pickProps:', config.pickProps);
            }
            break;
          case 'inputSchema':
            if (t.isObjectExpression(prop.value)) {
              config.inputSchema = extractInputSchemaFromObjectExpression(prop.value);
              debugLog('解析到 inputSchema:', config.inputSchema);
            }
            break;
        }
      }
    });

    return config;
  }

  // 从 inputSchema 对象表达式中提取配置
  function extractInputSchemaFromObjectExpression(objExpr: t.ObjectExpression) {
    const inputSchema: any = {};

    objExpr.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const key = prop.key.name;

        switch (key) {
          case 'required':
            if (t.isArrayExpression(prop.value)) {
              inputSchema.required = prop.value.elements
                .filter((el): el is t.StringLiteral => t.isStringLiteral(el))
                .map(el => el.value);
              debugLog('解析到必需属性:', inputSchema.required);
            }
            break;
          case 'properties':
            if (t.isObjectExpression(prop.value)) {
              inputSchema.properties = {};
              prop.value.properties.forEach(propProp => {
                if (t.isObjectProperty(propProp) && t.isIdentifier(propProp.key) && t.isObjectExpression(propProp.value)) {
                  const propName = propProp.key.name;
                  const propConfig: any = {};

                  propProp.value.properties.forEach(configProp => {
                    if (t.isObjectProperty(configProp) && t.isIdentifier(configProp.key)) {
                      const configKey = configProp.key.name;
                      if (t.isStringLiteral(configProp.value)) {
                        propConfig[configKey] = configProp.value.value;
                      } else if (t.isNumericLiteral(configProp.value)) {
                        propConfig[configKey] = configProp.value.value;
                      } else if (t.isBooleanLiteral(configProp.value)) {
                        propConfig[configKey] = configProp.value.value;
                      }
                    }
                  });

                  inputSchema.properties[propName] = propConfig;
                  debugLog(`解析到属性 ${propName} 的配置:`, propConfig);
                }
              });
              debugLog('最终解析的自定义属性配置:', inputSchema.properties);
            }
            break;
        }
      }
    });

    return inputSchema;
  }



  // 解析 Vue Props 接口
  function parseVuePropsInterface(scriptContent: string, pickProps: string[] = []): {
    properties: Record<string, SchemaProperty>;
    required: string[];
  } {
    const properties: Record<string, SchemaProperty> = {};
    const required: string[] = [];

    debugLog('开始解析 Vue Props 接口');
    debugLog('pickProps 配置:', pickProps);
    debugLog('Script 内容 (Props 解析):', scriptContent);

    // 如果没有指定 pickProps，返回空的 properties
    if (pickProps.length === 0) {
      debugLog('pickProps 为空，不解析任何属性');
      return { properties, required };
    }

    // 匹配 defineProps 调用
    const definePropsMatch = scriptContent.match(/defineProps<\s*([^>]+)\s*>\s*\(\)/);
    if (!definePropsMatch) {
      debugLog('未找到 defineProps 调用');
      return { properties, required };
    }

    const propsType = definePropsMatch[1].trim();
    debugLog('找到 Props 类型:', propsType);

    // 更灵活的接口匹配，支持多种格式
    const interfaceRegexes = [
      new RegExp(`interface\\s+${propsType}\\s*\\{([^}]+)\\}`, 's'),
      new RegExp(`interface\\s+${propsType}\\s*\\{([\\s\\S]*?)\\}`, 'g'),
      // 如果 propsType 就是 "Props"，直接匹配
      /interface\s+Props\s*\{([^}]+)\}/s,
      /interface\s+Props\s*\{([\s\S]*?)\}/g
    ];

    let interfaceMatch = null;
    let matchedPattern = '';

    for (let i = 0; i < interfaceRegexes.length; i++) {
      interfaceMatch = scriptContent.match(interfaceRegexes[i]);
      if (interfaceMatch) {
        matchedPattern = `Interface Pattern ${i + 1}`;
        break;
      }
    }

    if (!interfaceMatch) {
      debugLog('未找到对应的接口定义');
      debugLog(`尝试匹配的接口名称: ${propsType}`);
      return { properties, required };
    }

    const interfaceBody = interfaceMatch[1];
    debugLog(`找到接口定义 (${matchedPattern}):`, interfaceBody);

    // 解析接口属性
    const propMatches = [...interfaceBody.matchAll(/(\w+)(\?)?:\s*([^;,\n}]+)/g)];

    for (const propMatch of propMatches) {
      const [, propName, optional, propType] = propMatch;

      // 过滤：只处理 pickProps 中指定的属性
      if (!pickProps.includes(propName)) {
        debugLog(`跳过属性: ${propName} (不在 pickProps 中)`);
        continue;
      }

      const cleanPropType = propType.trim();
      const isOptional = !!optional;

      const mappedType = mapVueTypeToJsonSchema(cleanPropType);

      // 如果返回 null，跳过该属性（通常是函数类型）
      if (mappedType === null) {
        debugLog(`跳过属性: ${propName} (函数类型)`);
        continue;
      }

      properties[propName] = {
        type: mappedType,
      };

      // 如果不是可选的，就是必需的
      if (!isOptional) {
        required.push(propName);
      }

      debugLog(`解析属性: ${propName}`, {
        type: cleanPropType,
        optional: isOptional,
        required: !isOptional,
        mappedType: mappedType,
      });
    }

    debugLog('最终解析的属性:', properties);
    debugLog('必需的属性:', required);
    return { properties, required };
  }

  // 解析单个 Vue 文件
  async function parseVueFile(filePath: string): Promise<MCPCompVueData[]> {
    debugLog('================================');
    debugLog('解析 Vue 文件:', filePath);
    debugLog('================================');

    const fileContent = await fs.readFile(filePath, 'utf-8');

    // 检查是否包含 defineMCPComponent 宏
    if (!fileContent.includes('defineMCPComponent')) {
      debugLog('文件不包含 defineMCPComponent 宏，跳过...');
      return [];
    }

    try {
      // 解析 Vue SFC
      const { descriptor } = parse(fileContent, { filename: filePath });

      if (!descriptor.script && !descriptor.scriptSetup) {
        debugLog('未找到 script 块，跳过...');
        return [];
      }

      // 合并所有 script 块的内容
      const allScriptContent = [
        descriptor.script?.content || '',
        descriptor.scriptSetup?.content || ''
      ].filter(Boolean).join('\n');

      debugLog('Script 内容长度:', allScriptContent.length);
      debugLog('Script 块数量:', [descriptor.script, descriptor.scriptSetup].filter(Boolean).length);

      // 解析 MCP 配置
      const mcpConfig = parseMCPComponentMacro(allScriptContent);
      if (!mcpConfig || !mcpConfig.name) {
        debugLog('未找到有效的 MCP 配置，跳过...');
        return [];
      }

      debugLog('解析到的 MCP 配置:', mcpConfig);

      // 解析 Props 接口
      const { properties, required: propsRequired } = parseVuePropsInterface(allScriptContent, mcpConfig.pickProps || []);

      const componentInfo: MCPCompVueData = {
        name: mcpConfig.name,
        // 紧跟在 name 后面添加 description 和 version
        ...(mcpConfig.description && { description: mcpConfig.description }),
        ...(mcpConfig.version && { version: mcpConfig.version }),
        ...(mcpConfig.serverName && { serverName: mcpConfig.serverName }),
        filePath: path.resolve(filePath),
        propertySchema: {
          type: 'object',
          properties,
          required: propsRequired,
        },
      };

      // 构建 inputSchema - 完全独立于 Props
      const inputProperties: Record<string, SchemaProperty> = {};
      const inputRequired: string[] = [];

      debugLog('开始构建独立的 inputSchema');
      debugLog('MCP inputSchema 配置:', mcpConfig.inputSchema);

      if (mcpConfig.inputSchema) {
        // 处理必需属性列表
        if (mcpConfig.inputSchema.required && Array.isArray(mcpConfig.inputSchema.required)) {
          inputRequired.push(...mcpConfig.inputSchema.required);
          debugLog('添加必需属性:', mcpConfig.inputSchema.required);
        }

        // 处理属性定义（完全独立，不依赖 Props）
        if (mcpConfig.inputSchema.properties) {
          for (const [propName, customConfig] of Object.entries(mcpConfig.inputSchema.properties)) {
            if (customConfig) {
              // 创建独立的属性定义，设置默认类型为 string
              inputProperties[propName] = {
                type: 'string', // 默认类型
                ...customConfig, // 应用自定义配置
              };
              debugLog(`添加独立属性: ${propName}`, inputProperties[propName]);
            }
          }
        }
      }

      // 确保 inputSchema 始终符合正确结构
      componentInfo.inputSchema = {
        type: 'object',
        properties: inputProperties,
        required: inputRequired.length > 0 ? inputRequired : []
      };

      debugLog('最终 inputSchema 结构:', {
        type: componentInfo.inputSchema.type,
        propertiesCount: Object.keys(componentInfo.inputSchema.properties).length,
        propertiesKeys: Object.keys(componentInfo.inputSchema.properties),
        required: componentInfo.inputSchema.required,
        fullSchema: componentInfo.inputSchema
      });

      debugLog('最终组件信息:', componentInfo);
      return [componentInfo];

    } catch (error) {
      console.error(`解析 Vue 文件 ${filePath} 时出错:`, error);
      return [];
    }
  }

  function updateComponentData(newData: MCPCompVueData[]) {
    if (!componentDataMap) {
      componentDataMap = new Map();
    }

    // 移除同一文件的现有条目
    for (const [key, value] of componentDataMap.entries()) {
      if (value.filePath === newData[0]?.filePath) {
        componentDataMap.delete(key);
      }
    }

    // 添加新条目
    for (const data of newData) {
      if (!data.name) {
        console.warn(`${data.filePath} 中的组件没有名称，跳过...`);
        continue;
      }

      const uniqueKey = getComponentKey(data.name, data.serverName);
      componentDataMap.set(uniqueKey, data);
      debugLog(`更新组件数据: ${data.name}，来自 ${data.filePath}`);
    }
  }

  function removeComponentData(filePath: string) {
    if (!componentDataMap) return;
    for (const [key, value] of componentDataMap.entries()) {
      if (value.filePath === filePath) {
        componentDataMap.delete(key);
        debugLog(`移除组件数据: ${key}，来自 ${filePath}`);
      }
    }
  }

  return {
    name: 'vite-plugin-mcp-comp-vue',

    async buildStart() {
      console.log('MCP Vue 插件开始构建...');
      const files = await glob(include, { ignore: exclude });
      debugLog('开始构建，包含文件:', files);

      componentDataMap = new Map();

      for (const file of files) {
        try {
          debugLog(`处理文件: ${file}`);
          const componentInfos = await parseVueFile(file);
          if (componentInfos.length > 0) {
            console.log(`在 ${file} 中找到 ${componentInfos.length} 个组件:`, componentInfos.map(c => c.name));
            updateComponentData(componentInfos);
          }
        } catch (error) {
          console.error(`处理文件 ${file} 时出错:`, error);
          throw error;
        }
      }

      console.log(`MCP Vue 组件插件: 找到 ${componentDataMap.size} 个组件。`);
      console.log('组件列表:', Array.from(componentDataMap.keys()));

      await saveSchemaOutputJson();

      if (options.pushConfig) {
        await configService.pushConfig(
          Array.from(componentDataMap.values()),
          options.pushConfig
        );
      }
    },

    resolveId(id) {
      if (
        id === 'virtual:mcp-comp-vue/data.json' ||
        id === 'virtual:mcp-comp-vue/imports'
      ) {
        return '\0' + id;
      }
      return null;
    },

    load(id) {
      debugLog('加载模块:', id);

      if (id === '\0virtual:mcp-comp-vue/data.json') {
        const data = Array.from(componentDataMap.values()).map(
          ({ filePath, ...rest }) => rest,
        );
        debugLog('生成 data.json 内容:', data);
        return JSON.stringify(data, null, 2);
      }

      if (id === '\0virtual:mcp-comp-vue/imports') {
        debugLog('为组件生成导入:', Array.from(componentDataMap.entries()));

        if (componentDataMap.size === 0) {
          console.warn('在 componentDataMap 中未找到组件');
          return 'export default {};';
        }

        if (!lazyImport) {
          const imports = Array.from(componentDataMap.values())
            .map((comp) => {
              if (!comp.name) {
                console.warn(`${comp.filePath} 中的组件没有名称，跳过...`);
                return '';
              }
              const virtualModuleDir = path.dirname(id);
              const relativePath = path.relative(virtualModuleDir, comp.filePath);
              return `import ${comp.name} from '${relativePath}';`;
            })
            .filter(Boolean)
            .join('\n');

          const componentNames = Array.from(componentDataMap.keys())
            .filter(key => key.split(':')[0])
            .join(', ');
          const exports = `export { ${componentNames} };`;

          return `${imports}\n${exports}`;
        } else {
          const lazyImports = Array.from(componentDataMap.values())
            .map((comp) => {
              if (!comp.name) {
                console.warn(`${comp.filePath} 中的组件没有名称，跳过...`);
                return '';
              }
              const virtualModuleDir = path.dirname(id);
              const relativePath = path.relative(virtualModuleDir, comp.filePath);
              return `const ${comp.name} = () => import('${relativePath}');`;
            })
            .filter(Boolean)
            .join('\n');

          const componentNames = Array.from(componentDataMap.keys())
            .filter(key => key.split(':')[0])
            .map(key => key.split(':')[0])
            .join(', ');
          const exports = `export default { ${componentNames} };`;

          return `${lazyImports}\n${exports}`;
        }
      }

      return null;
    },

    async handleHotUpdate({ file, server }) {
      const relativeFilePath = path.relative(process.cwd(), file);
      const isIncluded = (await glob(include, { ignore: exclude })).includes(relativeFilePath);

      if (isIncluded && file.endsWith('.vue')) {
        const fileContent = await fs.readFile(file, 'utf-8');
        const existingData = Array.from(componentDataMap.values()).filter(
          (item) => item.filePath === file,
        );

        if (existingData.length > 0 && !fileContent.includes('defineMCPComponent')) {
          console.log(`MCP Vue 插件: 文件 ${file} 不再包含 defineMCPComponent 宏，移除组件...`);
          removeComponentData(file);
        } else if (fileContent.includes('defineMCPComponent')) {
          console.log(`MCP Vue 插件: 检测到 ${file} 的 HMR 更新`);

          const componentInfos = await parseVueFile(file);
          let changed = false;

          if (componentInfos.length > 0) {
            if (JSON.stringify(existingData) !== JSON.stringify(componentInfos)) {
              updateComponentData(componentInfos);
              changed = true;
              console.log(`MCP Vue 插件: 更新了 ${componentInfos[0].name} 的数据`);
            }
          } else if (existingData.length > 0) {
            removeComponentData(file);
            changed = true;
            console.log(`MCP Vue 插件: 移除了 ${file} 的数据`);
          }

          if (changed) {
            const dataModule = server.moduleGraph.getModuleById('\0virtual:mcp-comp-vue/data.json');
            const importsModule = server.moduleGraph.getModuleById('\0virtual:mcp-comp-vue/imports');

            if (dataModule) server.moduleGraph.invalidateModule(dataModule);
            if (importsModule) server.moduleGraph.invalidateModule(importsModule);

            await saveSchemaOutputJson();

            if (options.pushConfig) {
              await configService.pushConfig(
                Array.from(componentDataMap.values()),
                options.pushConfig
              );
            }

            return [dataModule, importsModule].filter(Boolean) as ModuleNode[];
          }
        }
      }
    },

    async buildEnd() {
      await saveSchemaOutputJson();

      if (options.pushConfig) {
        await configService.pushConfig(
          Array.from(componentDataMap.values()),
          options.pushConfig
        );
      }
    },
  };
} 