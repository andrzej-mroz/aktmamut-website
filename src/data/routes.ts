export const legacyBasePath = "/legacy";

export const legacyRoutes = {
  manual: `${legacyBasePath}/manual/index.html`,
} as const;

export const routes = {
  home: "/",
  expeditions: `${legacyBasePath}/expeditions/index.html`,
  challenges: `${legacyBasePath}/challenges/list.html`,
  statistics: `${legacyBasePath}/statistics/index.html`,
  manual: "/manual/",
} as const;

export const futureRoutes = {
  home: "/",
  expeditions: "/expeditions/",
  challenges: "/challenges/",
  statistics: "/statistics/",
  manual: "/manual/",
} as const;
