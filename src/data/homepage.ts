import { futureRoutes, routes } from "./routes";

export interface HomepageDestination {
  href: string;
  futureHref: string;
  migrated: boolean;
}

export interface HomepageLink extends HomepageDestination {
  label: string;
}

export type HomepageModuleStatus = "live" | "planned";

export interface HomepageModule {
  title: string;
  description: string;
  symbol: string;
  meta: string;
  status: HomepageModuleStatus;
  destination?: HomepageDestination;
}

export interface HomepageFeature {
  eyebrow: string;
  title: string;
  description: string;
  destination: HomepageDestination;
}

export interface HomepageMetric {
  value: string;
  label: string;
}

const expeditionsDestination: HomepageDestination = {
  href: routes.expeditions,
  futureHref: futureRoutes.expeditions,
  migrated: false,
};

const challengesDestination: HomepageDestination = {
  href: routes.challenges,
  futureHref: futureRoutes.challenges,
  migrated: false,
};

const statisticsDestination: HomepageDestination = {
  href: routes.statistics,
  futureHref: futureRoutes.statistics,
  migrated: false,
};

export const homepageHeroVideo = {
  src: "/assets/home/hero.mp4",
  type: "video/mp4",
  width: 1920,
  height: 1080,
  durationSeconds: 14.3143,
} as const;

export const homepageModules: HomepageModule[] = [
  {
    title: "Expeditions",
    description:
      "Recorded routes, mountain trips and locations on the main interactive map.",
    symbol: "🌍",
    meta: "Open map →",
    status: "live",
    destination: expeditionsDestination,
  },
  {
    title: "Challenges",
    description: "Peak collections, regional challenges and progress tracking.",
    symbol: "🏔",
    meta: "Open challenges →",
    status: "live",
    destination: challengesDestination,
  },
  {
    title: "Statistics",
    description:
      "Numbers behind the mountain activity: totals, regions, years and more.",
    symbol: "📊",
    meta: "Open statistics →",
    status: "live",
    destination: statisticsDestination,
  },
  {
    title: "Carpathian Flowers",
    description: "A future atlas of mountain plants and field observations.",
    symbol: "🌸",
    meta: "Planned module",
    status: "planned",
  },
  {
    title: "Regionalization",
    description:
      "A future module for mountain region classification and comparison.",
    symbol: "🗺️",
    meta: "Planned module",
    status: "planned",
  },
  {
    title: "More to come",
    description:
      "The structure is ready for new modules built from routes, images and datasets.",
    symbol: "🦣",
    meta: "Scalable homepage",
    status: "planned",
  },
];

export const homepageFeatures: HomepageFeature[] = [
  {
    eyebrow: "Maps",
    title: "Recorded expeditions and route archive",
    description:
      "The strongest core of the project: routes, places, mountain ranges and expedition details.",
    destination: expeditionsDestination,
  },
  {
    eyebrow: "Challenges",
    title: "Regional peak collections with progress",
    description:
      "A cleaner and more modern entry point into mountain challenge tracking.",
    destination: challengesDestination,
  },
  {
    eyebrow: "Data",
    title: "Numbers behind the activity",
    description:
      "Distance, elevation, years and the measurable side of the archive.",
    destination: statisticsDestination,
  },
];

export const homepageMetrics: HomepageMetric[] = [
  {
    value: "2015–2026",
    label: "Expeditions timeline",
  },
  {
    value: "3",
    label: "Live modules today",
  },
  {
    value: "2+",
    label: "Future modules planned",
  },
  {
    value: "1",
    label: "Growing mountain hub",
  },
];
