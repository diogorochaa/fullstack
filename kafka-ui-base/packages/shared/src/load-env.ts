import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

const candidatePaths = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../.env"),
  resolve(process.cwd(), "../../.env"),
  resolve(currentDir, "../../../.env")
];

const envPath = candidatePaths.find((path) => existsSync(path));

config(envPath ? { path: envPath } : undefined);
