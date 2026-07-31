import { routes } from "./routes";

export interface NavigationItem {
  label: string;
  href: string;
  migrated: boolean;
}

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Home",
    href: routes.home,
    migrated: true,
  },
  {
    label: "Expeditions",
    href: routes.expeditions,
    migrated: true,
  },
  {
    label: "Challenges",
    href: routes.challenges,
    migrated: true,
  },
  {
    label: "Statistics",
    href: routes.statistics,
    migrated: true,
  },
];
