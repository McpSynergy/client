import fastGlob from 'fast-glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import ts from 'typescript';
import type { ModuleNode, Plugin } from 'vite';
import { ConfigPushService } from './server';

const { glob } = fastGlob;

export interface MCPCompOptions {
  /** Component file pattern */
  include?: string;
  /** Ignore file patterns */
  exclude?: string[];
  /** Custom component tags */
  componentTags?: Map<string, CommentComponentTag>;
  /** Custom property tags */
  propertyTags?: Map<string, CommentPropertyTag>;
  /** Whether to use lazy imports */
  lazyImport?: boolean;
  /** Path to output the component properties schema */
  componentPropSchemaOutputPath?: string;
  /** Whether to enable debug mode */
  debug?: boolean;

  /** Whether to push config to server */
  pushConfig?: {
    serverUrl: string;
    projectId: string;
    env?: string;
    headers?: Record<string, string>;
    [key: string]: any;
  };
}

export interface MCPCompData {
  name: string;
  filePath: string;
  propertySchema: Record<string, any>;
  inputSchema?: {
    type: string;
    properties: Record<string, SchemaProperty>;
    required?: string[];
  };
  [key: string]: any; // Allow additional properties
}

/**
 * Component comment tag
 *
 * example:
 *  @mcp-comp -> name
 */
export interface CommentComponentTag {
  /** Component name */
  to: string;
  /** Component description */
  description?: string;
}

/**
 * Property comment tag
 *
 * example:
 *  @mcp-prop -> name
 */
export interface CommentPropertyTag {
  /** Property name */
  to: string;
  /** Property description */
  description?: string;
}

export const MCPCompTags = new Map<string, CommentComponentTag>([
  [
    'mcp-comp',
    {
      to: 'name',
      description: 'Component name',
    },
  ],
  [
    'mcp-server-name',
    {
      to: 'serverName',
      description: 'Server name',
    },
  ],
  [
    'mcp-description',
    {
      to: 'description',
      description: 'Component description',
    },
  ],
  [
    'mcp-title',
    {
      to: 'title',
      description: 'Component title',
    },
  ],
  [
    'mcp-version',
    {
      to: 'version',
      description: 'Component version',
    },
  ],
]);

export const MCPPropTags = new Map<string, CommentPropertyTag>([
  [
    'mcp-prop',
    {
      to: 'name',
      description: 'Property name',
    },
  ],
  [
    'mcp-prop-path',
    {
      to: 'path',
      description: 'Nested property path',
    },
  ],
  [
    'mcp-prop-description',
    {
      to: 'description',
      description: 'Property description',
    },
  ],
  [
    'mcp-prop-title',
    {
      to: 'title',
      description: 'Property title',
    },
  ],
  [
    'mcp-prop-default',
    {
      to: 'default',
      description: 'Default value',
    },
  ],
  [
    'mcp-prop-enum',
    {
      to: 'enum',
      description: 'Allowed values',
    },
  ],
  [
    'mcp-prop-minimum',
    {
      to: 'minimum',
      description: 'Minimum value (for numbers)',
    },
  ],
  [
    'mcp-prop-maximum',
    {
      to: 'maximum',
      description: 'Maximum value (for numbers)',
    },
  ],
  [
    'mcp-prop-pattern',
    {
      to: 'pattern',
      description: 'Regular expression pattern',
    },
  ],
  [
    'mcp-prop-format',
    {
      to: 'format',
      description: 'Data format (e.g., date, email, etc.)',
    },
  ],
  [
    'mcp-prop-minLength',
    {
      to: 'minLength',
      description: 'Minimum length (for strings)',
    },
  ],
  [
    'mcp-prop-maxLength',
    {
      to: 'maxLength',
      description: 'Maximum length (for strings)',
    },
  ],
  [
    'mcp-prop-minItems',
    {
      to: 'minItems',
      description: 'Minimum items (for arrays)',
    },
  ],
  [
    'mcp-prop-maxItems',
    {
      to: 'maxItems',
      description: 'Maximum items (for arrays)',
    },
  ],
  [
    'mcp-prop-uniqueItems',
    {
      to: 'uniqueItems',
      description: 'Whether array items must be unique',
    },
  ],
  [
    'mcp-prop-multipleOf',
    {
      to: 'multipleOf',
      description: 'Number must be a multiple of this value',
    },
  ],
  [
    'mcp-prop-exclusiveMinimum',
    {
      to: 'exclusiveMinimum',
      description: 'Exclusive minimum value',
    },
  ],
  [
    'mcp-prop-exclusiveMaximum',
    {
      to: 'exclusiveMaximum',
      description: 'Exclusive maximum value',
    },
  ],
]);

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

export function MCPComp(options: MCPCompOptions = {}): Plugin {
  const {
    include = 'src/**/*.tsx',
    exclude = ['**/node_modules/**', '**/dist/**'],
    componentTags = MCPCompTags,
    propertyTags = MCPPropTags,
    lazyImport = true,
    componentPropSchemaOutputPath = 'mcp-comp-schema.json',
    debug = false,
  } = options;

  const configService = ConfigPushService.getInstance();

  // 使用 Map 存储组件数据，键为组件名和服务器名的组合
  let componentDataMap = new Map<string, MCPCompData>();
  let tsProgram: ts.Program | null = null;

  // Helper to log debug information
  function debugLog(message: string, data?: any) {
    if (debug) {
      console.log(`[MCP Comp Debug] ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  // Helper to map TypeScript types to JSON Schema types
  function mapTypeToJsonSchema(typeString: string): string | string[] {
    if (typeString === 'string') return 'string';
    if (typeString === 'number') return 'number';
    if (typeString === 'boolean') return 'boolean';
    if (typeString.endsWith('[]')) return 'array';
    if (typeString.includes('=>')) return 'function';
    if (typeString === 'React.ReactNode' || typeString === 'JSX.Element')
      return 'any';
    return 'object';
  }

  // Helper to get component unique key
  function getComponentKey(name: string, serverName?: string): string {
    return `${name}:${serverName || ''}`;
  }

  // Helper to save schema output to a file
  async function saveSchemaOuputJson() {
    if (!componentPropSchemaOutputPath) return;

    try {
      const data = Array.from(componentDataMap.values()).map(
        (rest) => rest,
      );
      await fs.writeFile(
        componentPropSchemaOutputPath,
        JSON.stringify(data, null, 2),
      );
      console.log('Schema output saved to:', componentPropSchemaOutputPath);
    } catch (error) {
      console.error('Error saving schema output:', error);
    }
  }

  // Helper to get base filename without extension
  function getComponentNameFromFile(filePath: string) {
    return path.basename(filePath, path.extname(filePath));
  }

  // Helper to process a type node recursively
  function processTypeNode(
    typeNode: ts.TypeNode,
    componentName: string,
    sourceFile: ts.SourceFile,
    storedInterfaces: Map<string, StoredInterface>,
    currentPath?: string,
  ): SchemaProperty {
    debugLog('Processing type node:', {
      type: typeNode.getText(sourceFile),
      currentPath,
    });

    if (ts.isTypeReferenceNode(typeNode)) {
      const typeName = typeNode.getText(sourceFile);
      debugLog('Found type reference:', typeName);

      // Look for a matching interface using the current path
      const key = getInterfaceKey(componentName, currentPath);
      const matchingInterface = storedInterfaces.get(key);

      if (matchingInterface) {
        debugLog('Found matching interface for path:', currentPath);
        const properties: Record<string, SchemaProperty> = {};
        const required: string[] = [];

        for (const nestedMember of matchingInterface.interface.members) {
          if (
            !ts.isPropertySignature(nestedMember) ||
            !nestedMember.name ||
            !ts.isIdentifier(nestedMember.name)
          )
            continue;

          const nestedPropName = nestedMember.name.getText(sourceFile);
          const nestedPropPath = currentPath
            ? `${currentPath}.${nestedPropName}`
            : nestedPropName;

          debugLog('Processing nested property:', {
            name: nestedPropName,
            path: nestedPropPath,
            type: nestedMember.type?.getText(sourceFile),
          });

          if (nestedMember.type) {
            const nestedSchema = processTypeNode(
              nestedMember.type,
              componentName,
              sourceFile,
              storedInterfaces,
              nestedPropPath,
            );
            properties[nestedPropName] = nestedSchema;

            if (!nestedMember.questionToken) {
              required.push(nestedPropName);
            }
          }
        }

        return {
          type: 'object',
          properties,
          required: required.length > 0 ? required : undefined,
        };
      }
    }

    // Handle array types
    if (ts.isArrayTypeNode(typeNode)) {
      const elementType = processTypeNode(
        typeNode.elementType,
        componentName,
        sourceFile,
        storedInterfaces,
        currentPath,
      );
      return {
        type: 'array',
        items: elementType,
      };
    }

    // Handle union types
    if (ts.isUnionTypeNode(typeNode)) {
      const types = typeNode.types.map((t) =>
        processTypeNode(
          t,
          componentName,
          sourceFile,
          storedInterfaces,
          currentPath,
        ),
      );
      return {
        type: types.map((t) => t.type).flat(),
        description: 'Union type',
      };
    }

    // Handle literal types
    if (ts.isLiteralTypeNode(typeNode)) {
      const literal = typeNode.literal;
      if (ts.isStringLiteral(literal)) {
        return { type: 'string', enum: [literal.text] };
      } else if (ts.isNumericLiteral(literal)) {
        return { type: 'number', enum: [Number(literal.text)] };
      } else if (
        literal.kind === ts.SyntaxKind.TrueKeyword ||
        literal.kind === ts.SyntaxKind.FalseKeyword
      ) {
        return {
          type: 'boolean',
          enum: [literal.kind === ts.SyntaxKind.TrueKeyword],
        };
      }
    }

    // Default case: map the type to JSON schema
    const typeString = typeNode.getText(sourceFile);
    return {
      type: mapTypeToJsonSchema(typeString),
    };
  }

  // New data structure to store interfaces by their mcp-comp and mcp-prop-path
  interface StoredInterface {
    interface: ts.InterfaceDeclaration;
    componentName: string;
    propPath?: string;
    filePath: string;
  }

  // Helper to get the key for the Map
  function getInterfaceKey(componentName: string, propPath?: string): string {
    return propPath ? `${componentName}:${propPath}` : componentName;
  }

  // Helper to parse a single file and extract MCP data
  async function parseFile(
    filePath: string,
    _checker: ts.TypeChecker,
  ): Promise<MCPCompData[]> {
    debugLog('--------------------------------');
    debugLog('Parsing file: ' + filePath);
    debugLog('--------------------------------');

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true,
    );

    // 检查文件是否包含 @mcp-comp 标识
    if (!fileContent.includes('@mcp-comp')) {
      debugLog('File does not contain @mcp-comp tag, skipping...');
      return [];
    }

    const componentInfos: MCPCompData[] = [];
    const storedInterfaces = new Map<string, StoredInterface>();

    // First pass: collect all interfaces
    function collectInterfaces(node: ts.Node) {
      if (!ts.isInterfaceDeclaration(node)) {
        ts.forEachChild(node, collectInterfaces);
        return;
      }

      const tags = ts.getJSDocTags(node);
      const mcpCompTag = tags.find((tag) => tag.tagName.text === 'mcp-comp');
      const mcpPropPathTag = tags.find(
        (tag) => tag.tagName.text === 'mcp-prop-path',
      );

      if (mcpCompTag) {
        let componentName = (mcpCompTag.comment || '').toString().trim();
        const propPath = mcpPropPathTag
          ? (mcpPropPathTag.comment || '').toString().trim()
          : undefined;

        const nodeSourceFile = node.getSourceFile();
        const actualFilePath = path.resolve(nodeSourceFile.fileName);

        debugLog(
          `Found interface with mcp-comp: ${componentName}${propPath ? ` and mcp-prop-path: ${propPath}` : ''}`,
          {
            interfaceName: node.name?.getText(sourceFile),
            actualFilePath,
          },
        );

        const key = getInterfaceKey(componentName, propPath);
        storedInterfaces.set(key, {
          interface: node,
          componentName,
          propPath,
          filePath: actualFilePath,
        });
      }
    }

    // Second pass: process the component interface and its properties
    function processComponent(
      node: ts.Node,
      componentName: string,
    ): MCPCompData {
      if (!ts.isInterfaceDeclaration(node)) {
        throw new Error('Expected an interface declaration');
      }

      debugLog(
        `Processing component interface: ${node.name?.getText(sourceFile)}`,
      );

      const nodeSourceFile = node.getSourceFile();
      const actualFilePath = path.resolve(nodeSourceFile.fileName);

      const componentInfo: MCPCompData = {
        name: componentName,
        filePath: actualFilePath,
        propertySchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      };

      // Helper function to recursively collect input schema properties
      function collectInputSchemaProperties(
        interfaceNode: ts.InterfaceDeclaration,
        _currentPath: string = '',
        inputProperties: Record<string, SchemaProperty> = {},
        inputRequired: string[] = []
      ): { properties: Record<string, SchemaProperty>; required: string[] } {
        // First, collect input properties from the current interface
        for (const member of interfaceNode.members) {
          if (
            !ts.isPropertySignature(member) ||
            !member.name ||
            !ts.isIdentifier(member.name)
          )
            continue;

          const propName = member.name.getText(sourceFile);
          const propTags = ts.getJSDocTags(member);
          const hasInputRequired = propTags.some(tag => tag.tagName.text === 'mcp-input-required');
          const hasInputOptional = propTags.some(tag => tag.tagName.text === 'mcp-input-optional');

          if (hasInputRequired || hasInputOptional) {
            // Get description from JSDoc comment
            const description = propTags
              .find(tag => tag.tagName.text === 'mcp-input-required' || tag.tagName.text === 'mcp-input-optional')
              ?.comment?.toString().trim() || propName;

            // Get the property type
            let propType: string | string[] = 'any';
            if (member.type) {
              const typeText = member.type.getText(sourceFile).replace(/\?/g, '');
              propType = mapTypeToJsonSchema(typeText);
            }

            debugLog(`Adding property ${propName} to inputSchema`, {
              required: hasInputRequired,
              optional: hasInputOptional,
              description,
              type: propType,
            });

            inputProperties[propName] = {
              type: propType,
              description,
            };

            if (hasInputRequired && !inputRequired.includes(propName)) {
              inputRequired.push(propName);
            }
          }
        }

        return { properties: inputProperties, required: inputRequired };
      }

      // Process component tags
      const tags = ts.getJSDocTags(node);
      for (const tag of tags) {
        const tagConfig = componentTags.get(tag.tagName.text);
        if (!tagConfig) continue;

        const value = (tag.comment || '').toString().trim();
        if (!value) continue;

        if (tagConfig.to === 'name') {
          componentInfo.name = value;
        } else {
          componentInfo[tagConfig.to] = value;
        }
        debugLog(`Set component ${tagConfig.to}: ${value}`);
      }

      // Process properties
      for (const member of node.members) {
        if (
          !ts.isPropertySignature(member) ||
          !member.name ||
          !ts.isIdentifier(member.name)
        )
          continue;

        const propName = member.name.getText(sourceFile);
        const propTags = ts.getJSDocTags(member);
        const mcpPropTag = propTags.find(
          (tag) => tag.tagName.text === 'mcp-prop',
        );

        const description = (mcpPropTag?.comment || '').toString().trim();
        const isOptional = !!member.questionToken;

        debugLog(`Processing property: ${propName}`, {
          description,
          type: member.type?.getText(sourceFile),
          isOptional,
          memberText: member.getText(sourceFile),
        });

        let propSchema: SchemaProperty;

        if (member.type) {
          const typeText = member.type.getText(sourceFile).replace(/\?/g, '');
          const typeNode = ts.createSourceFile(
            'temp.ts',
            `type T = ${typeText}`,
            ts.ScriptTarget.Latest,
            true,
          ).statements[0];

          if (ts.isTypeAliasDeclaration(typeNode) && typeNode.type) {
            propSchema = processTypeNode(
              typeNode.type,
              componentName,
              sourceFile,
              storedInterfaces,
              propName,
            );
          } else {
            propSchema = {
              type: mapTypeToJsonSchema(typeText),
              description,
            };
          }
        } else {
          propSchema = {
            type: 'any',
            description,
          };
        }

        if (propName && propName.trim()) {
          componentInfo.propertySchema.properties[propName] = propSchema;
          if (!isOptional) {
            componentInfo.propertySchema.required.push(propName);
          }
        } else {
          console.warn(`Invalid property name found in ${filePath}, skipping...`);
        }

        debugLog(`Final schema for ${propName}:`, propSchema);

        // Process property tags
        for (const tag of propTags) {
          const tagConfig = propertyTags.get(tag.tagName.text);
          if (!tagConfig || tagConfig.to === 'name') continue;

          const value = (tag.comment || '').toString().trim();
          if (!value) continue;

          if (tagConfig.to === 'default') {
            componentInfo.propertySchema.properties[propName].default = value;
          } else if (tagConfig.to === 'enum') {
            componentInfo.propertySchema.properties[propName].enum = value
              .split(',')
              .map((v) => v.trim());
          } else if (tagConfig.to === 'minimum' || tagConfig.to === 'maximum') {
            componentInfo.propertySchema.properties[propName][tagConfig.to] =
              Number(value);
          } else if (tagConfig.to === 'pattern') {
            componentInfo.propertySchema.properties[propName].pattern = value;
          } else if (tagConfig.to === 'format') {
            componentInfo.propertySchema.properties[propName].format = value;
          } else {
            componentInfo.propertySchema.properties[propName][tagConfig.to] =
              value;
          }

          debugLog(`Set property ${tagConfig.to} for ${propName}: ${value}`);
        }
      }

      // Collect input schema properties from all interfaces
      const inputSchemaResult = collectInputSchemaProperties(node);

      // Also collect from all nested interfaces for this component
      for (const [key, stored] of storedInterfaces.entries()) {
        if (stored.componentName === componentName && stored.propPath) {
          debugLog(`Checking nested interface: ${key}`);
          const nestedResult = collectInputSchemaProperties(
            stored.interface,
            stored.propPath,
            inputSchemaResult.properties,
            inputSchemaResult.required
          );
          Object.assign(inputSchemaResult.properties, nestedResult.properties);
          inputSchemaResult.required.push(...nestedResult.required.filter(req => !inputSchemaResult.required.includes(req)));
        }
      }

      // Always add inputSchema, even if empty
      componentInfo.inputSchema = {
        type: 'object',
        properties: inputSchemaResult.properties,
        required: inputSchemaResult.required,
      };
      debugLog(`Added inputSchema to ${componentName}:`, componentInfo.inputSchema);

      debugLog(
        `Completed processing component: ${componentName}`,
        componentInfo,
      );
      return componentInfo;
    }

    // First pass: collect all interfaces
    collectInterfaces(sourceFile);
    debugLog(
      'Collected all interfaces:',
      Array.from(storedInterfaces.entries()).map(([key, value]) => ({
        key,
        componentName: value.componentName,
        propPath: value.propPath,
        interfaceName: value.interface.name?.getText(sourceFile),
      })),
    );

    // Second pass: process all top-level component interfaces
    const topLevelInterfaces = Array.from(storedInterfaces.values()).filter(
      (stored) => !stored.propPath,
    );
    debugLog(
      'Found top-level interfaces:',
      topLevelInterfaces.map((s) => ({
        componentName: s.componentName,
        interfaceName: s.interface.name?.getText(sourceFile),
      })),
    );

    if (topLevelInterfaces.length === 0) {
      debugLog('No interfaces with @mcp-comp tag found, returning empty array');
      return [];
    }

    // Handle default component name if there's only one component with no name
    if (
      topLevelInterfaces.length === 1 &&
      !topLevelInterfaces[0].componentName
    ) {
      const defaultName = getComponentNameFromFile(filePath);
      debugLog(`Using default component name: ${defaultName}`);
      topLevelInterfaces[0].componentName = defaultName;
      const oldKey = getInterfaceKey('', undefined);
      const newKey = getInterfaceKey(defaultName, undefined);
      const value = storedInterfaces.get(oldKey);
      if (value) {
        storedInterfaces.delete(oldKey);
        storedInterfaces.set(newKey, { ...value, componentName: defaultName });
      }
    }

    // Validate component names
    const componentNames = new Set<string>();
    for (const stored of topLevelInterfaces) {
      if (!stored.componentName) {
        throw new Error(
          `@mcp-comp tag must have a value in file ${filePath}. ` +
          `When multiple components are defined in one file, each component must have a unique name.`,
        );
      }
      if (componentNames.has(stored.componentName)) {
        throw new Error(
          `Duplicate component name "${stored.componentName}" found in file ${filePath}. ` +
          `Each component in a file must have a unique name.`,
        );
      }
      componentNames.add(stored.componentName);
    }

    // Process each top-level component
    for (const topLevelInterface of topLevelInterfaces) {
      debugLog(
        'Processing top level interface with component name',
        topLevelInterface.componentName,
      );
      const componentInfo = processComponent(
        topLevelInterface.interface,
        topLevelInterface.componentName,
      );
      componentInfos.push(componentInfo);
    }

    debugLog('Final component infos:', componentInfos);
    return componentInfos;
  }

  // Helper to update the component data list
  function updateComponentData(newData: MCPCompData[]) {
    if (!componentDataMap) {
      componentDataMap = new Map();
    }

    // Remove existing entries for the same file
    for (const [key, value] of componentDataMap.entries()) {
      if (value.filePath === newData[0]?.filePath) {
        componentDataMap.delete(key);
      }
    }

    // Add new entries
    for (const data of newData) {
      if (!data.name) {
        console.warn(`Component in ${data.filePath} has no name, skipping...`);
        continue;
      }

      const uniqueKey = getComponentKey(data.name, data.serverName);
      componentDataMap.set(uniqueKey, data);
      debugLog(`Updated component data for ${data.name} from ${data.filePath}`);
    }
  }

  // Helper to remove data for a file
  function removeComponentData(filePath: string) {
    if (!componentDataMap) return;
    for (const [key, value] of componentDataMap.entries()) {
      if (value.filePath === filePath) {
        componentDataMap.delete(key);
        debugLog(`Removed component data for ${key} from ${filePath}`);
      }
    }
  }

  return {
    name: 'vite-plugin-mcp-comp',

    // Scan files at the start of the build
    async buildStart() {
      const files = await glob(include, { ignore: exclude });
      debugLog('Starting build with files:', files);

      // 获取所有已存在的组件文件路径
      const existingComponentFiles = new Set(
        Array.from(componentDataMap.values()).map(data => data.filePath)
      );

      // Create program once
      tsProgram = ts.createProgram(files, {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
      });
      const checker = tsProgram.getTypeChecker();
      componentDataMap = new Map(); // Reset

      for (const file of files) {
        try {
          // 检查文件是否包含 @mcp-comp 标识
          const fileContent = await fs.readFile(file, 'utf-8');
          const hasMcpCompTag = fileContent.includes('@mcp-comp');

          // 如果文件之前存在组件数据，但现在没有 @mcp-comp 标识，则视为删除
          if (existingComponentFiles.has(file) && !hasMcpCompTag) {
            console.log(`MCP Synergy Comp Plugin: File ${file} no longer contains @mcp-comp tag, removing components...`);
            removeComponentData(file);
            continue;
          }

          // 如果文件不包含 @mcp-comp 标识，跳过处理
          if (!hasMcpCompTag) {
            debugLog(`File ${file} does not contain @mcp-comp tag, skipping...`);
            continue;
          }

          const componentInfos = await parseFile(file, checker);
          if (componentInfos.length > 0) {
            debugLog(`Found ${componentInfos.length} components in ${file}:`, componentInfos);
            updateComponentData(componentInfos);
          }
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
          throw error;
        }
      }

      console.log(
        `MCP Synergy Comp Plugin: Found ${componentDataMap.size} components.`,
      );
      debugLog(
        'Final component data map:',
        Array.from(componentDataMap.entries()),
      );

      await saveSchemaOuputJson();

      if (options.pushConfig) {
        await configService.pushConfig(
          Array.from(componentDataMap.values()),
          options.pushConfig
        );
      }
    },

    resolveId(id) {
      console.log('Resolving ID:', id);

      if (
        id === 'virtual:mcp-comp/data.json' ||
        id === 'virtual:mcp-comp/imports'
      ) {
        return '\0' + id;
      }
      return null;
    },

    load(id) {
      debugLog('Loading module:', id);
      if (id === '\0virtual:mcp-comp/data.json') {
        const data = Array.from(componentDataMap.values()).map(
          ({ filePath, ...rest }) => rest,
        );
        debugLog('Generated data.json content:', data);
        return JSON.stringify(data, null, 2);
      }

      if (id === '\0virtual:mcp-comp/imports') {
        debugLog('Generating imports for components:', Array.from(componentDataMap.entries()));

        if (componentDataMap.size === 0) {
          console.warn('No components found in componentDataMap');
          return 'export default {};';
        }

        if (!lazyImport) {
          // Generate direct imports
          const imports = Array.from(componentDataMap.values())
            .map((comp) => {
              if (!comp.name) {
                console.warn(`Component in ${comp.filePath} has no name, skipping...`);
                return '';
              }
              const virtualModuleDir = path.dirname(id);
              const relativePath = path.relative(
                virtualModuleDir,
                comp.filePath,
              );
              const importStatement = `import ${comp.name} from '${relativePath}';`;
              debugLog('Generated import statement:', importStatement);
              return importStatement;
            })
            .filter(Boolean)
            .join('\n');

          const componentNames = Array.from(componentDataMap.keys())
            .filter(key => key.split(':')[0])
            .join(', ');
          const exports = `export { ${componentNames} };`;

          const finalContent = `${imports}\n${exports}`;
          debugLog('Generated imports content:', finalContent);
          return finalContent;
        } else {
          // Generate lazy imports
          const lazyImports = Array.from(componentDataMap.values())
            .map((comp) => {
              if (!comp.name) {
                console.warn(`Component in ${comp.filePath} has no name, skipping...`);
                return '';
              }
              const virtualModuleDir = path.dirname(id);
              const relativePath = path.relative(
                virtualModuleDir,
                comp.filePath,
              );
              const lazyImportStatement = `const ${comp.name} = () => import('${relativePath}');`;
              debugLog('Generated lazy import statement:', lazyImportStatement);
              return lazyImportStatement;
            })
            .filter(Boolean)
            .join('\n');

          const componentNames = Array.from(componentDataMap.keys())
            .filter(key => key.split(':')[0])
            .map(key => key.split(':')[0])
            .join(', ');
          const exports = `export default { ${componentNames} };`;

          const finalContent = `${lazyImports}\n${exports}`;
          debugLog('Generated lazy imports content:', finalContent);
          return finalContent;
        }
      }

      return null;
    },

    // Handle HMR updates during development
    async handleHotUpdate({
      file,
      server,
      read: _read,
    }): Promise<ModuleNode[] | void> {
      // Convert file path to relative path
      const relativeFilePath = path.relative(process.cwd(), file);
      const isIncluded = (await glob(include, { ignore: exclude })).includes(
        relativeFilePath,
      );

      if (isIncluded && file.endsWith('.tsx')) {
        // 预检查文件是否包含 @mcp-comp 标识
        const fileContent = await fs.readFile(file, 'utf-8');
        const existingData = Array.from(componentDataMap.values()).filter(
          (item) => item.filePath === file,
        );

        // 如果文件之前存在组件数据，但现在没有 @mcp-comp 标识，则视为删除
        if (existingData.length > 0 && !fileContent.includes('@mcp-comp')) {
          console.log(`MCP Synergy Comp Plugin: File ${file} no longer contains @mcp-comp tag, removing components...`);
          removeComponentData(file);

          // Invalidate both virtual modules
          const dataModule = server.moduleGraph.getModuleById(
            '\0virtual:mcp-comp/data.json',
          );
          const importsModule = server.moduleGraph.getModuleById(
            '\0virtual:mcp-comp/imports',
          );

          if (dataModule) server.moduleGraph.invalidateModule(dataModule);
          if (importsModule) server.moduleGraph.invalidateModule(importsModule);

          // Notify client
          server.ws.send({
            type: 'update',
            updates: [
              {
                type: 'js-update',
                path: dataModule?.url || '',
                acceptedPath: dataModule?.url || '',
                timestamp: Date.now(),
              },
              {
                type: 'js-update',
                path: importsModule?.url || '',
                acceptedPath: importsModule?.url || '',
                timestamp: Date.now(),
              },
            ],
          });

          await saveSchemaOuputJson();

          if (options.pushConfig) {
            await configService.pushConfig(
              Array.from(componentDataMap.values()),
              options.pushConfig
            );
          }

          const modules = [dataModule, importsModule].filter(
            (m): m is ModuleNode => m !== undefined,
          );
          return modules;
        }

        if (!fileContent.includes('@mcp-comp')) {
          console.log(`MCP Synergy Comp Plugin: File ${file} does not contain @mcp-comp tag, skipping...`);
          return;
        }

        console.log(`MCP Synergy Comp Plugin: HMR update detected for ${file}`);
        if (!tsProgram) {
          const files = await glob(include, { ignore: exclude });
          tsProgram = ts.createProgram(files, {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
          });
        }
        const checker = tsProgram.getTypeChecker();
        const componentInfos = await parseFile(file, checker);

        let changed = false;

        if (componentInfos.length > 0) {
          if (JSON.stringify(existingData) !== JSON.stringify(componentInfos)) {
            updateComponentData(componentInfos);
            changed = true;
            console.log(
              `MCP Synergy Comp Plugin: Updated data for ${componentInfos[0].name}`,
            );
          }
        } else if (existingData.length > 0) {
          removeComponentData(file);
          changed = true;
          console.log(`MCP Synergy Comp Plugin: Removed data for ${file}`);
        }

        if (changed) {
          // Invalidate both virtual modules
          const dataModule = server.moduleGraph.getModuleById(
            '\0virtual:mcp-comp/data.json',
          );
          const importsModule = server.moduleGraph.getModuleById(
            '\0virtual:mcp-comp/imports',
          );

          if (dataModule) server.moduleGraph.invalidateModule(dataModule);
          if (importsModule) server.moduleGraph.invalidateModule(importsModule);

          if (componentInfos.length > 0) {
            // Notify client
            server.ws.send({
              type: 'update',
              updates: [
                {
                  type: 'js-update',
                  path: dataModule?.url || '',
                  acceptedPath: dataModule?.url || '',
                  timestamp: Date.now(),
                },
                {
                  type: 'js-update',
                  path: importsModule?.url || '',
                  acceptedPath: importsModule?.url || '',
                  timestamp: Date.now(),
                },
              ],
            });

            await saveSchemaOuputJson();

            if (options.pushConfig) {
              await configService.pushConfig(
                Array.from(componentDataMap.values()),
                options.pushConfig
              );
            }
          }

          const modules = [dataModule, importsModule].filter(
            (m): m is ModuleNode => m !== undefined,
          );
          return modules;
        }
      }
    },

    // Handle build completion
    async buildEnd() {
      await saveSchemaOuputJson();
      // 发送配置
      if (options.pushConfig) {
        await configService.pushConfig(
          Array.from(componentDataMap.values()),
          options.pushConfig
        );
      }
    },
  };
}
