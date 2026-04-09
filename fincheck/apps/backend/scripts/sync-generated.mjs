import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const sourceDir = resolve(projectRoot, 'generated/prisma');
const targetDir = resolve(projectRoot, 'dist/generated/prisma');

if (!existsSync(sourceDir)) {
  throw new Error(`Prisma generated client not found at ${sourceDir}`);
}

mkdirSync(dirname(targetDir), { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });
