import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createFileManifest,
  formatIssues,
  inspectGeneratedTextFiles,
  isTextFile,
  listFiles,
  rewriteLegacyPaths,
} from "./lib/legacy-paths.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(repositoryRoot, "website", "old-site");
const destinationDirectory = resolve(repositoryRoot, "public", "legacy");
const manifestPath = resolve(
  repositoryRoot,
  ".astro",
  "legacy-source-manifest.json",
);

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

const sourceFiles = await listFiles(sourceDirectory);
const sourceManifestBefore = await createFileManifest(sourceDirectory);

const temporaryParent = resolve(repositoryRoot, ".astro");

await mkdir(temporaryParent, {
  recursive: true,
});

const temporaryRoot = await mkdtemp(join(temporaryParent, "legacy-sync-"));

const temporarySite = join(temporaryRoot, "legacy");

let rewrittenFiles = 0;
let rewrittenReferences = 0;

try {
  await rm(destinationDirectory, { recursive: true, force: true });
  await cp(sourceDirectory, temporarySite, { recursive: true });

  const copiedFiles = await listFiles(temporarySite);

  for (const filePath of copiedFiles.filter(isTextFile)) {
    const originalText = await readFile(filePath, "utf8");
    const result = rewriteLegacyPaths(originalText);

    if (result.referenceCount > 0) {
      await writeFile(filePath, result.text, "utf8");
      rewrittenFiles += 1;
      rewrittenReferences += result.referenceCount;
    }
  }

  const issues = await inspectGeneratedTextFiles(temporarySite);

  if (issues.length > 0) {
    throw new Error(
      `Legacy synchronization validation failed:\n${formatIssues(issues)}`,
    );
  }

  const sourceManifestAfter = await createFileManifest(sourceDirectory);

  if (
    JSON.stringify(sourceManifestAfter) !== JSON.stringify(sourceManifestBefore)
  ) {
    throw new Error(
      "Legacy synchronization failed: authoritative source changed during synchronization.",
    );
  }

  await mkdir(dirname(destinationDirectory), { recursive: true });
  await rename(temporarySite, destinationDirectory);
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `${JSON.stringify(sourceManifestBefore, null, 2)}\n`,
    "utf8",
  );

  console.log(`Legacy files copied: ${sourceFiles.length}`);
  console.log(`Legacy text files rewritten: ${rewrittenFiles}`);
  console.log(`Legacy path references rewritten: ${rewrittenReferences}`);
  console.log(`Legacy compatibility site generated at ${destinationDirectory}`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
