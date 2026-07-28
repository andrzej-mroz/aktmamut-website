import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

export const legacyPrefix = "/legacy";

export const textExtensions = new Set([".html", ".css", ".js", ".json"]);

const routeRoots = new Set([
  "expeditions",
  "challenges",
  "statistics",
  "manual",
  "app",
]);

const supportedRoots = [
  "assets",
  ...routeRoots,
  "index.html",
];

const precedingDelimiter = String.raw`[\s"'` + "`" + String.raw`(=,:>]`;
const followingDelimiter = String.raw`[?#"'` + "`" + String.raw`\s)<>,;]`;
const supportedRootPattern = new RegExp(
  String.raw`(^|${precedingDelimiter})\/(?!\/|legacy\/)(${supportedRoots
    .map((root) => root.replace(".", String.raw`\.`))
    .join("|")})(\/)?(?=\/|${followingDelimiter}|$)`,
  "gmu",
);
const localRootPattern = new RegExp(
  String.raw`(?<!\/)(^|${precedingDelimiter})\/(?!\/|legacy\/)([A-Za-z][A-Za-z0-9._-]*)(\/)?(?=\/|${followingDelimiter}|$)`,
  "gmu",
);

export function isTextFile(filePath) {
  return textExtensions.has(extname(filePath).toLowerCase());
}

export async function listFiles(rootDirectory) {
  const files = [];

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  await visit(rootDirectory);
  return files.sort();
}

export async function createFileManifest(rootDirectory) {
  const files = await listFiles(rootDirectory);
  const manifest = [];

  for (const filePath of files) {
    const contents = await readFile(filePath);
    manifest.push({
      path: toPortableRelativePath(rootDirectory, filePath),
      bytes: contents.byteLength,
      sha256: createHash("sha256").update(contents).digest("hex"),
    });
  }

  return manifest;
}

export function toPortableRelativePath(rootDirectory, filePath) {
  return relative(rootDirectory, filePath).replaceAll("\\", "/");
}

export function rewriteLegacyPaths(sourceText) {
  let referenceCount = 0;

  const text = sourceText.replace(
    supportedRootPattern,
    (match, prefix, root, trailingSlash, offset, originalText) => {
      referenceCount += 1;

      if (root === "index.html") {
        return `${prefix}${legacyPrefix}/index.html`;
      }

      const nextCharacter = originalText[offset + match.length] ?? "";
      const isExactRoute =
        routeRoots.has(root) && nextCharacter !== "/";

      if (isExactRoute) {
        return `${prefix}${legacyPrefix}/${root}/index.html`;
      }

      return `${prefix}${legacyPrefix}/${root}${trailingSlash ?? ""}`;
    },
  );

  return { text, referenceCount };
}

export function findUnresolvedRootRelativeReferences(sourceText) {
  const matches = [];

  for (const match of sourceText.matchAll(localRootPattern)) {
    matches.push({
      reference: match[0].trim(),
      root: match[2],
      reason: `local root-relative path "/${match[2]}" is not compatible with ${legacyPrefix}`,
    });
  }

  return matches;
}

export async function inspectGeneratedTextFiles(rootDirectory) {
  const issues = [];
  const files = await listFiles(rootDirectory);

  for (const filePath of files.filter(isTextFile)) {
    const text = await readFile(filePath, "utf8");
    const relativePath = toPortableRelativePath(rootDirectory, filePath);

    if (text.includes(`${legacyPrefix}${legacyPrefix}/`)) {
      issues.push({
        file: relativePath,
        reference: `${legacyPrefix}${legacyPrefix}/`,
        reason: "compatibility prefix was applied more than once",
      });
    }

    for (const issue of findUnresolvedRootRelativeReferences(text)) {
      issues.push({ file: relativePath, ...issue });
    }
  }

  return issues;
}

export function formatIssues(issues) {
  return issues
    .map(
      ({ file, reference, reason }) =>
        `- ${file}: ${JSON.stringify(reference)} — ${reason}`,
    )
    .join("\n");
}
