export const legacyBasePath = "/legacy";

export const routes = {
  home: "/",
  expeditions: `${legacyBasePath}/expeditions/index.html`,
  challenges: `${legacyBasePath}/challenges/list.html`,
  statistics: `${legacyBasePath}/statistics/index.html`,
  manual: `${legacyBasePath}/manual/index.html`,
} as const;

export const futureRoutes = {
  home: "/",
  expeditions: "/expeditions/",
  challenges: "/challenges/",
  statistics: "/statistics/",
  manual: "/manual/",
} as const;
