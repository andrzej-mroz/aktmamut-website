/**
 * Proposed normalized input record for the future Statistics page.
 * Geometry and map-only Expedition properties are intentionally excluded.
 */
export interface StatisticsRecord {
  /** Stable Expedition identifier sourced from `properties.nr`. */
  id: string;
  /** Gregorian calendar date in `YYYY-MM-DD` format. */
  date: string;
  /** Expedition name displayed in period details. */
  name: string;
  /** GOT points for this Expedition. */
  gotPoints: number;
}

export interface StatisticsPeriod {
  /** Calendar month in the inclusive range 1–12. */
  month: number;
  /** Ten-day segment: 1 = days 1–10, 2 = 11–20, 3 = 21–month end. */
  segment: 1 | 2 | 3;
  /** Cumulative GOT total within the year, or null for a future period. */
  cumulativeGotPoints: number | null;
  /** IDs of records whose dates fall within this period. */
  recordIds: string[];
}

export interface StatisticsYearSeries {
  year: number;
  /** Exactly 36 periods in month/segment order. */
  periods: StatisticsPeriod[];
}

export interface StatisticsYearSummary {
  year: number;
  recordCount: number;
  /** Sum of GOT points for the calendar year. */
  totalGotPoints: number;
}

export interface StatisticsSummary {
  recordCount: number;
  /** Sum of GOT points across every normalized record. */
  totalGotPoints: number;
  firstDate: string;
  lastDate: string;
  years: StatisticsYearSummary[];
}

export interface StatisticsDataset {
  schemaVersion: 1;
  /** UTC generation timestamp in RFC 3339 format. */
  generatedAt: string;
  records: StatisticsRecord[];
  series: StatisticsYearSeries[];
  summary: StatisticsSummary;
}
