export interface NavigationItem {
  label: string;
  href: string;
  migrated: boolean;
}

export const legacyBasePath = "/legacy";

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    migrated: true,
  },
  {
    label: "Expeditions",
    href: `${legacyBasePath}/expeditions/index.html`,
    migrated: false,
  },
  {
    label: "Challenges",
    href: `${legacyBasePath}/challenges/list.html`,
    migrated: false,
  },
  {
    label: "Statistics",
    href: `${legacyBasePath}/statistics/index.html`,
    migrated: false,
  },
];
