#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Ensure the dist directory exists
const distDir = path.join(__dirname, "..", "dist");
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy global.d.ts from src to dist
const srcPath = path.join(__dirname, "..", "src", "global.d.ts");
const destPath = path.join(__dirname, "..", "dist", "global.d.ts");

try {
    fs.copyFileSync(srcPath, destPath);
    console.log("Successfully copied global.d.ts to dist directory");
} catch (error) {
    console.error("Error copying global.d.ts:", error.message);
    process.exit(1);
}
