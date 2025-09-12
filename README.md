# Extendr

A powerful and flexible Node.js extension system that enables dynamic loading and management of plugins with priority-based event handling.

## Features

-   🔌 **Dynamic Extension Loading**: Automatically discover and load extensions from a directory
-   🎯 **Priority-Based Events**: Event system with configurable priority ordering
-   📦 **Package.json Support**: Full support for npm package structure in extensions
-   🔄 **Load Order Management**: Control the loading sequence of extensions
-   🖥️ **Terminal Integration**: Built-in process management for extension builds
-   ⚙️ **Configurable**: Flexible configuration system for paths and logging

## Installation

```bash
npm install extendr
```

## Quick Start

```javascript
import { Config, Loader, EventManager } from "extendr";

// Configure paths
Config.extensionsPath = "./extensions";
Config.resourcesPath = "./resources";
Config.loadOrderPath = "./load-order.json";
Config.log = true; // Enable logging

// Load extensions
await Loader.findExtensions();

// Listen for events
EventManager.on(
    "my-event",
    (args, returnValue) => {
        console.log("Event received:", args);
        return "processed";
    },
    10
); // Priority 10

// Fire events
const result = await EventManager.fire("my-event", "data1", "data2");
```

## Extension Structure

Extensions should follow this structure:

```
my-extension/
├── package.json
├── index.js (or main file specified in package.json)
└── ... other files
```

### Extension Entry Point

Your extension's main file should export a `main` function:

```javascript
// index.js
export function main({ events }) {
    // Register event listeners
    events.on(
        "app-start",
        (args) => {
            console.log("Extension loaded!");
        },
        5
    ); // Priority 5 (lower numbers run first)

    // Add your extension logic here
}
```

### Extension package.json

```json
{
    "name": "my-extension",
    "version": "1.0.0",
    "main": "dist/index.js",
    "scripts": {
        "build": "npm install && tsc"
    }
}
```

## API Reference

### Config

Static configuration class for setting up Extendr:

```javascript
import { Config } from "extendr";

Config.log = true; // Enable debug logging
Config.extensionsPath = "./extensions"; // Path to extensions directory
Config.resourcesPath = "./resources"; // Path to resources
Config.loadOrderPath = "./load-order.json"; // Path to load order file
```

### Loader

Manages extension discovery and loading:

```javascript
import { Loader } from "extendr";

// Get all loaded extensions
const extensions = Loader.extensions;

// Get extension count
const count = Loader.extensionCount;
```

### EventManager

Priority-based event system:

```javascript
import { EventManager } from "extendr";

// Add persistent listener
EventManager.on(
    "event-name",
    (args, returnValue) => {
        // Handle event
        return modifiedValue;
    },
    priority
); // Lower priority numbers execute first

// Add one-time listener
EventManager.once(
    "event-name",
    (args, returnValue) => {
        // Handle event once
    },
    priority
);

// Remove listener
EventManager.remove("event-name", callbackFunction);

// Fire event
const result = await EventManager.fire("event-name", arg1, arg2, ...args);
```

### Extension Class

Represents a loaded extension:

```javascript
// Extension properties
extension.config.name; // Extension name
extension.config.path; // Extension path
extension.config.valid; // Whether extension is valid
extension.config.reason; // Reason if invalid
extension.config.packageJson; // Parsed package.json

// Load the extension
extension.load();
```

### LoadOrder

Manages extension loading order and installation:

```javascript
import { LoadOrder } from "extendr";

// Load order from file
await LoadOrder.load();

// Save current order
await LoadOrder.save();

// Get writable format
const orderData = LoadOrder.asWritable;
```

### Terminal

Process management for extension builds:

```javascript
import { Terminal } from "extendr";

// Spawn a new terminal process
const terminal = await Terminal.new({
    command: "npm",
    args: ["run", "build"],
    spawnConfig: {
        cwd: "./my-extension",
        stdio: "inherit",
    },
});

if (terminal) {
    // Listen to output
    for await (const output of terminal.listen()) {
        console.log(output);
    }

    // Wait for completion
    await terminal.wait();

    // Kill if needed
    terminal.kill("SIGTERM");
}
```

## Event System

The event system is the core of Extendr's inter-extension communication:

### Priority System

-   **Lower numbers = Higher priority** (execute first)
-   Events are processed in priority order
-   Same priority events execute in registration order

### Event Flow

1. Extensions register listeners with priorities
2. Events are fired with arguments
3. Listeners execute in priority order
4. Each listener can modify the return value
5. Final return value is returned to the caller

### Example Event Chain

```javascript
// Extension A (Priority 1)
events.on(
    "process-data",
    (args, returnValue) => {
        const [data] = args;
        return { ...data, processedBy: "A" };
    },
    1
);

// Extension B (Priority 5)
events.on(
    "process-data",
    (args, returnValue) => {
        return { ...returnValue, processedBy: returnValue.processedBy + ",B" };
    },
    5
);

// Fire event
const result = await EventManager.fire("process-data", { value: 42 });
// Result: { value: 42, processedBy: 'A,B' }
```

## Directory Structure

```
your-project/
├── extensions/           # Extensions directory
│   ├── extension-1/
│   │   ├── package.json
│   │   └── index.js
│   └── extension-2/
│       ├── package.json
│       └── index.js
├── resources/           # Resources directory
├── load-order.json     # Load order configuration
└── main.js            # Your main application
```

## TypeScript Support

Extendr is built with TypeScript and includes full type definitions:

```typescript
import { EventManager, ListenerCallbackType } from "extendr";

const callback: ListenerCallbackType = (args, returnValue) => {
    // Fully typed callback
    return processedValue;
};

EventManager.on("typed-event", callback, 0);
```

## Error Handling

Extensions that fail to load are marked as invalid:

```javascript
const extensions = Loader.extensions;

extensions.forEach((ext) => {
    if (!ext.config.valid) {
        console.error(`Extension failed: ${ext.config.reason}`);
    }
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### 1.0.0

-   Initial release
-   Dynamic extension loading
-   Priority-based event system
-   Load order management
-   Terminal integration
-   TypeScript support
