import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createFileManifest,
  formatIssues,
  inspectGeneratedTextFiles,
  isTextFile,
  listFiles,
  rewriteLegacyPaths,
  toPortableRelativePath,
} from "./lib/legacy-paths.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(repositoryRoot, "website", "old-site");
const generatedDirectory = resolve(repositoryRoot, "public", "legacy");
const manifestPath = resolve(
  repositoryRoot,
  ".astro",
  "legacy-source-manifest.json",
);

const requiredFiles = [
  "index.html",
  "expeditions/index.html",
  "challenges/list.html",
  "statistics/index.html",
  "manual/index.html",
  "assets/components/header.html",
  "assets/js/header.js",
  "assets/css/shared.css",
  "assets/img/M256.webp",
  "expeditions/expeditions.geojson",
  "expeditions/markers.json",
  "statistics/statistics.js",
  "challenges/data/challenges-index.json",
];

async function requireDirectory(directory) {
  let details;

  try {
    details = await stat(directory);
  } catch {
    throw new Error(`Legacy validation failed: directory not found at ${directory}`);
  }

  if (!details.isDirectory()) {
    throw new Error(`Legacy validation failed: path is not a directory: ${directory}`);
  }
}

await requireDirectory(sourceDirectory);
await requireDirectory(generatedDirectory);

const missingFiles = [];

for (const relativePath of requiredFiles) {
  try {
    const details = await stat(join(generatedDirectory, relativePath));

    if (!details.isFile()) {
      missingFiles.push(relativePath);
    }
  } catch {
    missingFiles.push(relativePath);
  }
}

if (missingFiles.length > 0) {
  throw new Error(
    `Legacy validation failed: required files are missing:\n${missingFiles
      .map((file) => `- ${file}`)
      .join("\n")}`,
  );
}

const sourceFiles = await listFiles(sourceDirectory);
const generatedFiles = await listFiles(generatedDirectory);
const sourcePaths = sourceFiles.map((file) =>
  toPortableRelativePath(sourceDirectory, file),
);
const generatedPaths = generatedFiles.map((file) =>
  toPortableRelativePath(generatedDirectory, file),
);

const missingGeneratedPaths = sourcePaths.filter(
  (relativePath) => !generatedPaths.includes(relativePath),
);
const unexpectedGeneratedPaths = generatedPaths.filter(
  (relativePath) => !sourcePaths.includes(relativePath),
);

if (missingGeneratedPaths.length > 0 || unexpectedGeneratedPaths.length > 0) {
  throw new Error(
    [
      "Legacy validation failed: generated file structure differs from source.",
      ...missingGeneratedPaths.map((file) => `- missing: ${file}`),
      ...unexpectedGeneratedPaths.map((file) => `- unexpected: ${file}`),
    ].join("\n"),
  );
}

const compatibilityIssues = await inspectGeneratedTextFiles(generatedDirectory);

if (compatibilityIssues.length > 0) {
  throw new Error(
    `Legacy validation failed:\n${formatIssues(compatibilityIssues)}`,
  );
}

let verifiedTextFiles = 0;
let verifiedBinaryFiles = 0;

for (const sourceFile of sourceFiles) {
  const relativePath = toPortableRelativePath(sourceDirectory, sourceFile);
  const generatedFile = join(generatedDirectory, relativePath);

  if (isTextFile(sourceFile)) {
    const sourceText = await readFile(sourceFile, "utf8");
    const generatedText = await readFile(generatedFile, "utf8");
    const expectedText = rewriteLegacyPaths(sourceText).text;

    if (generatedText !== expectedText) {
      throw new Error(
        `Legacy validation failed: generated text differs beyond path rewriting: ${relativePath}`,
      );
    }

    verifiedTextFiles += 1;
  } else {
    const [sourceHash, generatedHash] = await Promise.all(
      [sourceFile, generatedFile].map(async (filePath) => {
        const contents = await readFile(filePath);
        return createHash("sha256").update(contents).digest("hex");
      }),
    );

    if (sourceHash !== generatedHash) {
      throw new Error(
        `Legacy validation failed: binary file changed: ${relativePath}`,
      );
    }

    verifiedBinaryFiles += 1;
  }
}

let recordedSourceManifest;

try {
  recordedSourceManifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch (error) {
  throw new Error(
    `Legacy validation failed: source manifest is unavailable. Run sync:legacy first. ${error.message}`,
  );
}

const currentSourceManifest = await createFileManifest(sourceDirectory);

if (
  JSON.stringify(currentSourceManifest) !==
  JSON.stringify(recordedSourceManifest)
) {
  throw new Error(
    "Legacy validation failed: authoritative source differs from the synchronization manifest.",
  );
}

console.log(`Legacy validation passed: ${generatedFiles.length} generated files`);
console.log(`Generated text files verified: ${verifiedTextFiles}`);
console.log(`Byte-identical non-text files verified: ${verifiedBinaryFiles}`);
console.log("Unresolved root-relative references: 0");
console.log("Duplicate /legacy/legacy/ paths: 0");
console.log("Authoritative legacy source changes: 0");
