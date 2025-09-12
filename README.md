# extendr

A lightweight, TypeScript-first extension system for Node.js applications. `extendr` provides a robust framework for loading, managing, and organizing extensions with event-driven architecture and flexible configuration.

## Features

-   🔌 **Dynamic Extension Loading**: Automatically discover and load extensions from specified directories
-   📦 **Package.json Support**: Extensions can define entry points via `package.json` or use default `index.js`
-   🎯 **Event System**: Priority-based event system with support for one-time listeners
-   🔄 **Load Order Management**: Configure and persist extension loading order
-   🛡️ **Type Safety**: Built with TypeScript for enhanced developer experience
-   📝 **Configurable Logging**: Optional logging for debugging and monitoring

## Installation

```bash
npm install extendr
```

## Quick Start

```typescript
import { Loadr, EventManagr, LoadOrdr, Config } from 'extendr';

// Configure the extension system
Config.extensionsPath = './extensions';
Config.loadOrderPath = './load-order.json';
Config.log = true; // Enable logging

// Find and load extensions
await Loadr.findExtensions();

// Load extension order configuration
await LoadOrdr.load();

// Load all enabled extensions
Loadr.extensions
  .filter(ext => /* check if enabled */)
  .forEach(ext => ext.load());
```

## Core Components

### Loadr

The main extension loader that discovers and manages extensions.

```typescript
// Find all extensions in the configured directory
await Loadr.findExtensions();

// Access loaded extensions
console.log(`Found ${Loadr.extensionCount} extensions`);
Loadr.extensions.forEach((ext) => {
    console.log(`Extension: ${ext.config.name} at ${ext.config.path}`);
});
```

### Extension

Represents a single extension with its configuration and state.

```typescript
// Extensions are automatically created by Loadr
// Each extension has:
extension.config.name; // Extension name (from package.json)
extension.config.path; // Full path to extension directory
extension.config.main; // Main function to execute
extension.config.valid; // Whether the extension is valid
extension.load(); // Load and execute the extension
```

### EventManagr

A priority-based event system for inter-extension communication.

```typescript
// Listen to events (lower priority numbers execute first)
EventManagr.on(
    "user:login",
    async (args, returnValue) => {
        console.log("User logged in:", args[0]);
        return { processed: true };
    },
    10
);

// One-time listeners
EventManagr.once(
    "app:startup",
    async (args) => {
        console.log("App started");
    },
    0
);

// Fire events
const result = await EventManagr.fire("user:login", { userId: 123 });

// Remove listeners
EventManagr.remove("user:login", callbackFunction);
```

### LoadOrdr

Manages the loading order and enabled state of extensions.

```typescript
// Load order configuration from file
await LoadOrdr.load();

// Access load order items
LoadOrdr.items.forEach((item) => {
    console.log(
        `${item.name}: ${item.config.enabled ? "enabled" : "disabled"}`
    );
});

// Save current order to file
await LoadOrdr.save();
```

### Config

Global configuration for the extension system.

```typescript
Config.extensionsPath = "./my-extensions"; // Directory containing extensions
Config.loadOrderPath = "./order.json"; // Load order configuration file
Config.log = true; // Enable debug logging
```

## Creating Extensions

### Basic Extension Structure

```
my-extension/
├── package.json
└── index.js
```

**package.json:**

```json
{
    "name": "my-awesome-extension",
    "main": "index.js"
}
```

**index.js:**

```javascript
exports.main = function ({ events }) {
    console.log("Extension loaded!");

    // Listen to events
    events.on("user:action", async (args) => {
        console.log("User performed action:", args[0]);
    });

    // Extension initialization logic here
};
```

### TypeScript Extension

```typescript
// types.ts
export interface ExtensionContext {
    events: typeof EventManagr;
}

// index.ts
import { ExtensionContext } from "./types";

export function main({ events }: ExtensionContext) {
    events.on(
        "app:ready",
        async () => {
            console.log("My extension is ready!");
        },
        0
    );
}
```

## Event System Details

The event system supports:

-   **Priority-based execution**: Lower numbers execute first
-   **Async/await support**: All event handlers can be async
-   **Return value chaining**: Each handler receives the previous handler's return value
-   **One-time listeners**: Automatically removed after execution
-   **Dynamic listener management**: Add/remove listeners at runtime

```typescript
// Example: Authentication flow
EventManagr.on(
    "auth:validate",
    async (args, previous) => {
        const [token] = args;
        const isValid = await validateToken(token);
        return { ...previous, tokenValid: isValid };
    },
    10
);

EventManagr.on(
    "auth:validate",
    async (args, previous) => {
        if (previous?.tokenValid) {
            const [token] = args;
            const user = await getUser(token);
            return { ...previous, user };
        }
        return previous;
    },
    20
);
```

## Load Order Configuration

The load order file (`load-order.json`) structure:

```json
[
    {
        "name": "core-extension:core",
        "enabled": true
    },
    {
        "name": "auth-extension:authentication",
        "enabled": true
    },
    {
        "name": "feature-extension:features",
        "enabled": false
    }
]
```

## API Reference

### Loadr

-   `static async findExtensions()`: Discover extensions in configured directory
-   `static get extensions`: Array of loaded Extension instances
-   `static get extensionCount`: Number of loaded extensions

### Extension

-   `constructor(config: ExtensionType)`: Create extension instance
-   `load()`: Load and execute the extension
-   `config`: Extension configuration object

### EventManagr

-   `static on(eventName, callback, priority?)`: Add persistent listener
-   `static once(eventName, callback, priority?)`: Add one-time listener
-   `static async fire(eventName, ...args)`: Fire event with arguments
-   `static remove(eventName, callback)`: Remove specific listener

### LoadOrdr

-   `static async load()`: Load order configuration from file
-   `static async save()`: Save current order to file
-   `static items`: Array of LoadOrdrItem instances
-   `static get writable`: Serializable order configuration

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Repository

-   **GitHub**: [https://github.com/Talisik/extendr](https://github.com/Talisik/extendr)
-   **Issues**: [https://github.com/Talisik/extendr/issues](https://github.com/Talisik/extendr/issues)
