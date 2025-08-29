# Plugins

A collection of build tools and VS Code extensions for conditional code removal and development workflow optimization.

### Build Tools

#### [esbuild-plugin-remove-code](./esbuild/esbuild-plugin-remove-code/)

An esbuild plugin that removes code blocks marked with special comments during the build process. Perfect for stripping debug code, development-only features, or test utilities from production builds.

**Key Features:**

- Environment-aware code removal (production, development, test)
- Multiple comment patterns (multi-line, single-line, inline)
- TypeScript support with zero runtime dependencies
- Fast processing with minimal performance impact

#### [vite-plugin-remove-code](./vite/vite-plugin-remove-code/)

A Vite plugin that removes code blocks marked with special comments during the build process. Ideal for removing debug code and development utilities from production builds in Vite projects.

**Key Features:**

- Selective code removal based on comment markers
- Environment-specific behavior
- Full TypeScript support
- Efficient regex-based processing

### VS Code Extensions

#### [code-removal-comments](./vscode/code-removal-comments/)

A comprehensive VS Code extension that makes it easy to add removal comments for conditional code compilation. Works seamlessly with the build plugins above.

**Key Features:**

- Multiple comment styles (multi-line, single-line, inline)
- Environment-specific wrapping (production, development, test, debug)
- Keyboard shortcuts and context menu integration
- Fully configurable comment patterns
- Cleanup utilities for removing existing markers

## 🚀 Quick Start

1. **Install a build plugin** (esbuild or Vite version)
2. **Install the VS Code extension** for easy comment management
3. **Mark code for removal** using the extension's commands
4. **Build your project** - debug code is automatically removed in production

## 🔗 Integration

These tools are designed to work together:

- Use the **VS Code extension** to quickly mark code for removal
- Use the **build plugins** to actually remove the marked code during compilation
- Support for custom comment patterns across all tools for consistency

## 📄 License

MIT
