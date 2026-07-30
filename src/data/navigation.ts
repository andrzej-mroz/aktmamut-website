import { routes } from './routes';

export interface NavigationItem {
    label: string;
    href: string;
    migrated: boolean;
}

export const primaryNavigation: NavigationItem[] = [
    {
        label: 'Home',
        href: routes.home,
        migrated: true,
    },
    {
        label: 'Expeditions',
        href: routes.expeditions,
        migrated: false,
    },
    {
        label: 'Challenges',
        href: routes.challenges,
        migrated: false,
    },
    {
        label: 'Statistics',
        href: routes.statistics,
        migrated: false,
    },
];
