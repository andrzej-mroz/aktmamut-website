import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const datasetPath = resolve(
  process.cwd(),
  "public/expeditions/expeditions.geojson",
);

function isValidIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateFeature(feature, index) {
  const errors = [];

  if (!feature || feature.type !== "Feature") {
    return {
      index,
      id: null,
      errors: ["Expected a GeoJSON Feature."],
      normalized: null,
    };
  }

  const properties =
    feature.properties && typeof feature.properties === "object"
      ? feature.properties
      : null;

  if (!properties) {
    return {
      index,
      id: null,
      errors: ["Expected a properties object."],
      normalized: null,
    };
  }

  const id =
    typeof properties.nr === "string" && properties.nr.trim()
      ? properties.nr.trim()
      : null;
  const date = properties.date;
  const name =
    typeof properties.name === "string" && properties.name.trim()
      ? properties.name.trim()
      : null;
  const gotPoints = properties.got;

  if (!id) errors.push("nr must be a non-empty string.");
  if (!isValidIsoDate(date)) errors.push("date must be a valid YYYY-MM-DD.");
  if (!name) errors.push("name must be a non-empty string.");
  if (
    typeof gotPoints !== "number" ||
    !Number.isFinite(gotPoints) ||
    gotPoints < 0
  ) {
    errors.push("got must be a finite, non-negative number.");
  }

  return {
    index,
    id,
    errors,
    normalized:
      errors.length === 0
        ? {
            id,
            date,
            name,
            gotPoints,
          }
        : null,
  };
}

try {
  const source = readFileSync(datasetPath, "utf8");
  const data = JSON.parse(source);

  if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error(
      "Expected a GeoJSON FeatureCollection with a features array.",
    );
  }

  const results = data.features.map(validateFeature);
  const validRecords = results
    .filter((result) => result.normalized !== null)
    .map((result) => result.normalized);
  const invalidRecords = results
    .filter((result) => result.errors.length > 0)
    .map(({ index, id, errors }) => ({ index, id, errors }));

  const identifierPositions = new Map();
  for (const result of results) {
    if (!result.id) continue;
    const positions = identifierPositions.get(result.id) ?? [];
    positions.push(result.index);
    identifierPositions.set(result.id, positions);
  }

  const duplicateIdentifiers = [...identifierPositions.entries()]
    .filter(([, positions]) => positions.length > 1)
    .map(([identifier, positions]) => ({ identifier, positions }));

  const dates = validRecords.map((record) => record.date).sort();
  const totalGotPoints = validRecords.reduce(
    (sum, record) => sum + record.gotPoints,
    0,
  );

  const report = {
    source: "public/expeditions/expeditions.geojson",
    sourceFeatureCount: data.features.length,
    validRecordCount: validRecords.length,
    invalidRecordCount: invalidRecords.length,
    invalidRecords,
    duplicateIdentifierCount: duplicateIdentifiers.length,
    duplicateIdentifiers,
    normalizationPreview: {
      firstRecord: validRecords[0] ?? null,
      lastRecord: validRecords.at(-1) ?? null,
    },
    summaryPreview: {
      recordCount: validRecords.length,
      totalGotPoints: Number(totalGotPoints.toFixed(2)),
      firstDate: dates[0] ?? null,
      lastDate: dates.at(-1) ?? null,
      yearCount: new Set(
        validRecords.map((record) => Number(record.date.slice(0, 4))),
      ).size,
    },
  };

  console.log(JSON.stringify(report, null, 2));

  if (invalidRecords.length > 0 || duplicateIdentifiers.length > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(
    `Statistics contract validation failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
}
