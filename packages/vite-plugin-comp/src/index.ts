import fastGlob from 'fast-glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import ts from 'typescript';
import type { ModuleNode, Plugin } from 'vite';

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
  /** Endpoint to notify when hot updates occur */
  hotUpdateEndpoint?: string;
}

export interface MCPCompData {
  name: string;
  filePath: string;
  inputSchema: Record<string, any>;
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

export function MCPComp(options: MCPCompOptions = {}): Plugin {
  const {
    include = 'src/**/*.tsx',
    exclude = ['**/node_modules/**', '**/dist/**'],
    componentTags = MCPCompTags,
    propertyTags = MCPPropTags,
    lazyImport = true,
    hotUpdateEndpoint,
  } = options;

  let componentDataMap: Map<string, MCPCompData> = new Map();
  let tsProgram: ts.Program | null = null;

  // Helper to send messages to the endpoint
  async function sendMessage(data: any) {
    if (!hotUpdateEndpoint) return;

    try {
      const response = await fetch(hotUpdateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(`Failed to send message: ${response.statusText}`);
      } else {
        console.log('sent message to ', hotUpdateEndpoint);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // Helper to get base filename without extension
  function getComponentNameFromFile(filePath: string) {
    return path.basename(filePath, path.extname(filePath));
  }

  // Helper to parse a single file and extract MCP data
  async function parseFile(
    filePath: string,
    checker: ts.TypeChecker,
  ): Promise<MCPCompData[]> {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true,
    );
    const componentInfos: MCPCompData[] = [];

    function visitNode(node: ts.Node) {
      if (!ts.isInterfaceDeclaration(node)) {
        ts.forEachChild(node, visitNode);
        return;
      }

      const tags = ts.getJSDocTags(node);
      const mcpCompTag = tags.find((tag) => tag.tagName.text === 'mcp-comp');
      if (!mcpCompTag) {
        ts.forEachChild(node, visitNode);
        return;
      }

      let componentName = (mcpCompTag.comment || '').toString().trim();

      // If no component name is provided and this is the first component in the file,
      // use the filename as the component name
      if (!componentName && componentInfos.length === 0) {
        componentName = getComponentNameFromFile(filePath);
      } else if (!componentName) {
        throw new Error(
          `@mcp-comp tag must have a value in file ${filePath}. ` +
            `When multiple components are defined in one file, each component must have a unique name.`,
        );
      }

      if (componentInfos.some((info) => info.name === componentName)) {
        throw new Error(
          `Duplicate component name "${componentName}" found in file ${filePath}. ` +
            `Each component in a file must have a unique name.`,
        );
      }

      const componentInfo: MCPCompData = {
        name: componentName,
        filePath: filePath,
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      };

      // Process additional component tags
      for (const tag of tags) {
        const tagConfig = componentTags.get(tag.tagName.text);
        if (!tagConfig || tagConfig.to === 'name') continue;

        const value = (tag.comment || '').toString().trim();
        if (!value) continue;

        componentInfo[tagConfig.to] = value;
      }

      // Process properties
      for (const member of node.members) {
        if (!ts.isPropertySignature(member)) continue;

        const propTags = ts.getJSDocTags(member);
        const mcpPropTag = propTags.find(
          (tag) => tag.tagName.text === 'mcp-prop',
        );
        if (!mcpPropTag || !member.name || !ts.isIdentifier(member.name))
          continue;

        const propName = member.name.getText(sourceFile);
        const description = (mcpPropTag.comment || '').toString().trim();

        // Get type and optionality
        const symbol = checker.getSymbolAtLocation(member.name);
        let typeString = 'any';
        let isOptional = !!member.questionToken;

        if (symbol) {
          const type = checker.getTypeOfSymbolAtLocation(symbol, member);
          typeString = checker.typeToString(type, member);
          if (typeString.includes('| undefined')) {
            typeString = typeString.replace(' | undefined', '').trim();
          }
          if (symbol.flags & ts.SymbolFlags.Optional) {
            isOptional = true;
          }
        }

        // Map TypeScript types to JSON Schema types
        let jsonSchemaType: string | string[] = 'any';
        if (typeString === 'string') jsonSchemaType = 'string';
        else if (typeString === 'number') jsonSchemaType = 'number';
        else if (typeString === 'boolean') jsonSchemaType = 'boolean';
        else if (typeString.endsWith('[]')) jsonSchemaType = 'array';
        else if (typeString.includes('=>')) jsonSchemaType = 'function';
        else if (
          typeString === 'React.ReactNode' ||
          typeString === 'JSX.Element'
        )
          jsonSchemaType = 'any';
        else jsonSchemaType = 'object';

        // Initialize prop schema
        componentInfo.inputSchema.properties[propName] = {
          type: jsonSchemaType,
          description: description,
        };
        if (!isOptional) {
          componentInfo.inputSchema.required.push(propName);
        }

        // Process additional property tags
        for (const tag of propTags) {
          const tagConfig = propertyTags.get(tag.tagName.text);
          if (!tagConfig || tagConfig.to === 'name') continue;

          const value = (tag.comment || '').toString().trim();
          if (!value) continue;

          // Handle special JSON Schema properties
          if (tagConfig.to === 'default') {
            componentInfo.inputSchema[propName].properties[propName].default =
              value;
          } else if (tagConfig.to === 'enum') {
            componentInfo.inputSchema[propName].properties[propName].enum =
              value.split(',').map((v) => v.trim());
          } else if (tagConfig.to === 'minimum' || tagConfig.to === 'maximum') {
            componentInfo.inputSchema[propName].properties[propName][
              tagConfig.to
            ] = Number(value);
          } else if (tagConfig.to === 'pattern') {
            componentInfo.inputSchema[propName].properties[propName].pattern =
              value;
          } else if (tagConfig.to === 'format') {
            componentInfo.inputSchema[propName].properties[propName].format =
              value;
          } else {
            componentInfo.inputSchema[propName].properties[propName][
              tagConfig.to
            ] = value;
          }
        }
      }

      componentInfos.push(componentInfo);
      ts.forEachChild(node, visitNode);
    }

    visitNode(sourceFile);
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
      componentDataMap.set(data.name, data);
    }
  }

  // Helper to remove data for a file (e.g., if @mcp-comp removed)
  function removeComponentData(filePath: string) {
    if (!componentDataMap) return;
    for (const [key, value] of componentDataMap.entries()) {
      if (value.filePath === filePath) {
        componentDataMap.delete(key);
      }
    }
  }

  return {
    name: 'vite-plugin-mcp-comp',

    // Scan files at the start of the build
    async buildStart() {
      const files = await glob(include, { ignore: exclude });
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
          const componentInfos = await parseFile(file, checker);
          if (componentInfos.length > 0) {
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

      await sendMessage({
        type: 'build-start',
        data: Array.from(componentDataMap.values()).map(
          ({ filePath, ...rest }) => rest,
        ),
        timestamp: Date.now(),
      });
    },

    resolveId(id) {
      if (
        id === 'virtual:mcp-comp/data.json' ||
        id === 'virtual:mcp-comp/imports'
      ) {
        return '\0' + id;
      }
      return null;
    },

    load(id) {
      if (id === '\0virtual:mcp-comp/data.json') {
        // Filter out filePath before stringifying for the client
        const exportList = Array.from(componentDataMap.values()).map(
          ({ filePath, ...rest }) => rest,
        );
        return JSON.stringify(exportList, null, 2);
      }

      if (id === '\0virtual:mcp-comp/imports') {
        if (!lazyImport) {
          // Generate direct imports
          const imports = Array.from(componentDataMap.values())
            .map((comp) => {
              // Get the directory of the virtual module
              const virtualModuleDir = path.dirname(id);
              // Get the relative path from the virtual module to the component
              const relativePath = path.relative(
                virtualModuleDir,
                comp.filePath,
              );
              return `import ${comp.name} from '${relativePath}';`;
            })
            .join('\n');
          const exports = `export { ${Array.from(componentDataMap.keys()).join(
            ', ',
          )} };`;
          return `${imports}\n${exports}`;
        } else {
          // Generate lazy imports
          const lazyImports = Array.from(componentDataMap.values())
            .map((comp) => {
              // Get the directory of the virtual module
              const virtualModuleDir = path.dirname(id);
              // Get the relative path from the virtual module to the component
              const relativePath = path.relative(
                virtualModuleDir,
                comp.filePath,
              );
              return `const ${comp.name} = () => import('${relativePath}');`;
            })
            .join('\n');
          const exports = `export default { ${Array.from(
            componentDataMap.keys(),
          ).join(', ')} };`;
          return `${lazyImports}\n${exports}`;
        }
      }

      return null;
    },

    // Handle HMR updates during development
    async handleHotUpdate({
      file,
      server,
      read,
    }): Promise<ModuleNode[] | void> {
      // Convert file path to relative path
      const relativeFilePath = path.relative(process.cwd(), file);
      const isIncluded = (await glob(include, { ignore: exclude })).includes(
        relativeFilePath,
      );

      if (isIncluded && file.endsWith('.tsx')) {
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
        const existingData = Array.from(componentDataMap.values()).filter(
          (item) => item.filePath === file,
        );

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

          // Send hot update message
          await sendMessage({
            type: 'hot-update',
            file,
            data: componentInfos.length > 0 ? componentInfos : null,
            timestamp: Date.now(),
          });

          const modules = [dataModule, importsModule].filter(
            (m): m is ModuleNode => m !== undefined,
          );
          return modules;
        }
      }
    },

    // Handle build completion
    async buildEnd() {
      await sendMessage({
        type: 'build-complete',
        data: Array.from(componentDataMap.values()).map(
          ({ filePath, ...rest }) => rest,
        ),
        timestamp: Date.now(),
      });
    },
  };
}
