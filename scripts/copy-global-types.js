#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync } from "fs";
import { join } from "path";

// Ensure the dist directory exists
const distDir = join(__dirname, "..", "dist");

if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
}

// Copy global.d.ts from src to dist
const srcPath = join(__dirname, "..", "src", "global.d.ts");
const destPath = join(__dirname, "..", "dist", "global.d.ts");

try {
    copyFileSync(srcPath, destPath);
    console.log("Successfully copied global.d.ts to dist directory");
} catch (error) {
    console.error("Error copying global.d.ts:", error.message);
    process.exit(1);
}
