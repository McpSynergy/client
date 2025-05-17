# McpSynergy Client &middot; [![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE) [![npm version](https://img.shields.io/npm/v/mcps-client.svg?style=flat)](https://www.npmjs.com/package/mcps-client) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/McpSynergy/client)

English | [简体中文](README.ZH.md)

McpSynergy Client is a modern frontend project based on React, built with TypeScript and Vite, using pnpm as the package manager, and implementing monorepo architecture through Turborepo.

* **Rapid Development:** Fast development experience based on Vite 6, supporting hot updates and instant builds.
* **Type Safety:** Complete type support with TypeScript, making development more reliable.
* **Modularity:** Monorepo architecture implemented with Turborepo, supporting multi-package management and code sharing.
* **Unified Standards:** Code formatting with Prettier ensures consistent code style.

## Installation

McpSynergy Client supports multiple installation methods:

* Use [Quick Start](#quick-start) to quickly experience the project.
* [Add to Existing Project](#add-to-existing-project) for gradual adoption.
* [Create New Project](#create-new-project) if you need a complete development environment.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/mcps-client.git

# Enter the project directory
cd mcps-client

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Documentation

You can find McpSynergy Client documentation at:

* [Quick Start](#quick-start)
* [Project Structure](#project-structure)
* [Development Guide](#development-guide)
* [API Reference](#api-reference)
* [Contributing Guide](#contributing-guide)

## Examples

Here's a simple example:

```tsx
import { createRoot } from 'react-dom/client';

function HelloMessage({ name }: { name: string }) {
  return <div>Hello {name}</div>;
}

const root = createRoot(document.getElementById('container')!);
root.render(<HelloMessage name="McpSynergy" />);
```

This example will render "Hello McpSynergy" on the page.

## Project Structure

```
.
├── apps/                # Applications directory
│   └── antd-example/   # Ant Design example application
├── packages/           # Shared packages directory
├── packages-private/   # Private packages directory
└── ...
```

## Tech Stack

* **Framework**: React 19
* **Build Tool**: Vite 6
* **Language**: TypeScript
* **Package Manager**: pnpm 7.8.0
* **Monorepo**: Turborepo
* **Code Style**: Prettier
* **Dependency Management**: syncpack

## Contributing

We welcome contributions of any kind, including but not limited to:

* Submitting bug reports
* Proposing new features
* Improving documentation
* Submitting code fixes

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand our expected behavior standards.

### Contributing Guide

Please read our [Contributing Guide](CONTRIBUTING.md) to learn how to participate in project development.

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

McpSynergy Client is [ISC licensed](LICENSE).

## Related Links

* [React Documentation](https://react.dev/)
* [Vite Documentation](https://vitejs.dev/)
* [TypeScript Documentation](https://www.typescriptlang.org/)
* [Turborepo Documentation](https://turbo.build/repo) 