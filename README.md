# Extendr

An Electron extension management system that provides a robust framework for loading, managing, and orchestrating extensions in Electron applications.

## Features

-   **Dynamic Extension Loading**: Automatically discover and load extensions from specified directories
-   **Event Management**: Comprehensive event system for inter-extension communication
-   **IPC Channel Management**: Streamlined communication between main and renderer processes
-   **Load Order Management**: Control the order in which extensions are loaded
-   **Extension Deployment**: Easy installation and copying of extensions
-   **Download Throttling**: Built-in download management with balanced throttling
-   **TypeScript Support**: Full TypeScript support with type definitions

## Installation

```bash
npm install git+https://github.com/Talisik/extendr.git
```

## Quick Start

### Main Process Setup

```typescript
import { app } from "electron";
import * as extendr from "extendr";
import path from "path";

// Configure extension system
extendr.Config.log = true;
extendr.Config.listenerPrefix = "extendr";
extendr.Config.extensionsPaths = [
    {
        name: "local",
        directory: path.join(app.getPath("userData"), "extensions"),
    },
    {
        name: "portable",
        directory: path.join(app.getPath("exe"), "../extensions"),
    },
];
extendr.Config.loadOrderPath = path.join(
    app.getPath("userData"),
    "load-order.json"
);

async function main() {
    // Find extensions first. Load order relies on the extensions being found.
    await extendr.Loadr.findExtensions();
    // Load the load order.
    await extendr.LoadOrdr.load();
    // Setup the main process.
    await extendr.Deployr.setupMain();
}

main();
```

### Preload Script Setup

```typescript
import { Deployr } from "extendr";

// Setup preload handlers
await Deployr.setupPreload();
```

### Renderer Process Usage

```typescript
// Access the extension API
declare global {
    interface Window {
        extendr: {
            addExtensions(directories: string[]): Promise<any>;
            findExtensions(): Promise<any>;
            getExtensions(): Promise<any>;
            download(payload: any, callback: (data: any) => void): Promise<any>;
            getInfo(videoUrl: string): Promise<any>;
            extensions: { [extensionName: string]: any };
        };
    }
}

// Use the API
const extensions = await window.extendr.getExtensions();
console.log("Available extensions:", extensions);
```

## API Reference

### Core Classes

#### `Extension`

Represents a single extension with loading and management capabilities.

```typescript
class Extension {
    readonly config: ExtensionType;
    get extendedName(): string;
    async loadMain(): Promise<any>;
    static async new(
        previousExtensions: Extension[],
        extensionsPath: ExtensionPathType,
        extensionSubPath: string
    ): Promise<Extension>;
}
```

#### `Loadr`

Static class for discovering and managing extensions.

```typescript
abstract class Loadr {
    static get extensions(): Extension[];
    static get extensionCount(): number;
    static async findExtensions(): Promise<void>;
    static async copyExtension(
        directory: string,
        extensionsPath: ExtensionPathType
    ): Promise<any>;
}
```

#### `EventManagr`

Event management system for extension communication.

```typescript
abstract class EventManagr {
    static async fire(
        event: { eventName: string; invokeEvent?: any },
        ...args: any[]
    ): Promise<any>;
    static on(
        eventName: string,
        callback: ListenrCallbackType,
        priority?: number
    ): void;
    static listen(
        eventName: string,
        callback: ListenrCallbackType,
        options?: { priority?: number; once?: boolean }
    ): void;
}
```

#### `Deployr`

Main deployment and IPC setup class.

```typescript
abstract class Deployr {
    static async setupMain(): Promise<void>;
    static async setupPreload(): Promise<void>;
}
```

#### `Config`

Configuration management for the extension system.

```typescript
abstract class Config {
    static log: boolean;
    static extensionsPaths: ExtensionPathType[];
    static loadOrderPath: string;
    static extensionsPathOf(name: string): ExtensionPathType | null;
}
```

### Types

```typescript
type ExtensionType = {
    name?: string;
    fullpath: string;
    directory: ExtensionPathType;
    main?: Function;
    packageJson?: any;
    valid: boolean;
    reason?: string;
};

type ExtensionPathType = {
    directory: string;
    name: string;
};

type ListenrCallbackType = (event: Event, ...args: any[]) => any;
```

## Creating Extensions

Extensions should follow this structure:

### Directory Structure

```
my-extension/
├── package.json
├── index.js (or main file specified in package.json)
└── ... other files
```

### Extension Entry Point

```javascript
// index.js
export function main({ events }) {
    // Listen to extension events with priority
    events.on("extendr:getInfo", getInfo, -10);
    events.on("extendr:download", download, -10);
}

// Example event handlers
function getInfo(event, videoUrl) {
    // Handle getting video information
    console.log("Getting info for:", videoUrl);
    // Return video metadata
    return {
        title: "Video Title",
        duration: "00:05:30",
        formats: ["mp4", "webm"],
    };
}

function download(event, downloadId, payload) {
    // Handle download requests
    console.log("Starting download:", downloadId, payload);
    // Implement download logic
    // Send progress updates via event system
}
```

### Package.json Example

```json
{
    "name": "my-extension",
    "version": "1.0.0",
    "main": "index.js",
    "description": "My awesome extension"
}
```

## Configuration

Configure Extendr by setting properties on the `Config` class:

```typescript
import { Config } from "extendr";

Config.log = true; // Enable debug logging
Config.extensionsPaths = [
    { name: "local", directory: "./extensions" },
    { name: "user", directory: "~/.myapp/extensions" },
];
Config.loadOrderPath = "./config/load-order.json";
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
