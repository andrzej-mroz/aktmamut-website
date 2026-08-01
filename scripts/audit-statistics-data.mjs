import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const datasetPath = resolve(
  process.cwd(),
  "public/expeditions/expeditions.geojson",
);
const requiredStatisticsFields = ["nr", "date", "name", "got"];

function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number";
  }
  return typeof value;
}

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

function summarizeProperty(features, propertyName) {
  const values = [];
  let occurrenceCount = 0;
  let missingCount = 0;
  let nullCount = 0;
  let emptyStringCount = 0;
  const types = new Map();

  for (const feature of features) {
    const properties =
      feature && typeof feature.properties === "object"
        ? feature.properties
        : null;

    if (!properties || !Object.hasOwn(properties, propertyName)) {
      missingCount += 1;
      continue;
    }

    occurrenceCount += 1;
    const value = properties[propertyName];

    if (value === null) {
      nullCount += 1;
      types.set("null", (types.get("null") ?? 0) + 1);
      continue;
    }

    values.push(value);
    if (typeof value === "string" && value.trim() === "") {
      emptyStringCount += 1;
    }
    const type = valueType(value);
    types.set(type, (types.get(type) ?? 0) + 1);
  }

  const uniqueValues = new Map();
  for (const value of values) {
    const key = JSON.stringify(value);
    if (!uniqueValues.has(key)) uniqueValues.set(key, value);
  }

  const numericValues = values.filter(
    (value) => typeof value === "number" && Number.isFinite(value),
  );

  return {
    occurrenceCount,
    missingCount,
    nullCount,
    emptyStringCount,
    inferredTypes: Object.fromEntries(
      [...types.entries()].sort(([left], [right]) => left.localeCompare(right)),
    ),
    uniqueValueCount: uniqueValues.size,
    sampleValues: [...uniqueValues.values()].slice(0, 3),
    numericRange:
      numericValues.length > 0
        ? {
            minimum: Math.min(...numericValues),
            maximum: Math.max(...numericValues),
          }
        : null,
  };
}

function loadDataset() {
  const source = readFileSync(datasetPath, "utf8");
  const data = JSON.parse(source);

  if (!data || typeof data !== "object") {
    throw new Error("GeoJSON root must be an object.");
  }

  if (!Array.isArray(data.features)) {
    throw new Error("GeoJSON features must be an array.");
  }

  return data;
}

try {
  const data = loadDataset();
  const features = data.features;
  const propertyNames = [
    ...new Set(
      features.flatMap((feature) =>
        feature && typeof feature.properties === "object"
          ? Object.keys(feature.properties)
          : [],
      ),
    ),
  ].sort();

  const geometryTypes = new Map();
  const invalidFeatures = [];
  const missingPropertiesObjects = [];
  const requiredFieldProblems = [];
  const unexpectedValues = [];
  const identifiers = new Map();

  features.forEach((feature, index) => {
    if (!feature || feature.type !== "Feature") {
      invalidFeatures.push({ index, reason: "Expected GeoJSON Feature." });
      return;
    }

    const geometryType = feature.geometry?.type ?? "missing";
    geometryTypes.set(geometryType, (geometryTypes.get(geometryType) ?? 0) + 1);

    const properties =
      feature.properties && typeof feature.properties === "object"
        ? feature.properties
        : null;

    if (!properties) {
      missingPropertiesObjects.push(index);
      return;
    }

    const recordId =
      typeof properties.nr === "string" && properties.nr.trim()
        ? properties.nr
        : `feature-index-${index}`;

    for (const field of requiredStatisticsFields) {
      if (
        !Object.hasOwn(properties, field) ||
        properties[field] === null ||
        properties[field] === ""
      ) {
        requiredFieldProblems.push({
          index,
          id: recordId,
          field,
          reason: "Missing required Statistics field.",
        });
      }
    }

    if (!isValidIsoDate(properties.date)) {
      unexpectedValues.push({
        index,
        id: recordId,
        field: "date",
        value: properties.date,
        reason: "Expected a valid YYYY-MM-DD calendar date.",
      });
    }

    if (
      typeof properties.got !== "number" ||
      !Number.isFinite(properties.got) ||
      properties.got < 0
    ) {
      unexpectedValues.push({
        index,
        id: recordId,
        field: "got",
        value: properties.got,
        reason: "Expected a finite, non-negative number.",
      });
    }

    if (typeof properties.nr === "string" && properties.nr.trim()) {
      const positions = identifiers.get(properties.nr) ?? [];
      positions.push(index);
      identifiers.set(properties.nr, positions);
    }
  });

  const duplicateIdentifiers = [...identifiers.entries()]
    .filter(([, positions]) => positions.length > 1)
    .map(([identifier, positions]) => ({ identifier, positions }));

  const report = {
    dataset: {
      path: "public/expeditions/expeditions.geojson",
      bytes: statSync(datasetPath).size,
      topLevelType: data.type ?? null,
      featureCount: features.length,
      geometryTypes: Object.fromEntries(
        [...geometryTypes.entries()].sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    },
    propertyNames,
    properties: Object.fromEntries(
      propertyNames.map((propertyName) => [
        propertyName,
        summarizeProperty(features, propertyName),
      ]),
    ),
    statisticsRequirements: {
      requiredFields: requiredStatisticsFields,
      recordsMissingRequiredFields: requiredFieldProblems,
    },
    identifiers: {
      field: "nr",
      populatedCount: identifiers.size,
      duplicateCount: duplicateIdentifiers.length,
      duplicates: duplicateIdentifiers,
    },
    anomalies: {
      invalidFeatureCount: invalidFeatures.length,
      invalidFeatures,
      missingPropertiesObjectCount: missingPropertiesObjects.length,
      missingPropertiesObjects,
      unexpectedValueCount: unexpectedValues.length,
      unexpectedValues,
    },
  };

  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(
    `Statistics data audit failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
}
