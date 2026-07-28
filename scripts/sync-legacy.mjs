import { cp, mkdir, rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(repositoryRoot, "website", "old-site");
const destinationDirectory = resolve(repositoryRoot, "public", "legacy");

let source;

try {
  source = await stat(sourceDirectory);
} catch {
  throw new Error(
    `Legacy synchronization failed: source directory not found at ${sourceDirectory}`,
  );
}

if (!source.isDirectory()) {
  throw new Error(
    `Legacy synchronization failed: source path is not a directory: ${sourceDirectory}`,
  );
}

await rm(destinationDirectory, { recursive: true, force: true });
await mkdir(dirname(destinationDirectory), { recursive: true });
await cp(sourceDirectory, destinationDirectory, { recursive: true });

console.log(
  `Legacy website synchronized from ${sourceDirectory} to ${destinationDirectory}`,
);
