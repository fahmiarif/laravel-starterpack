import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Loader2 } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import { useSidebarMenus } from '@/hooks/admin/menu-hooks';

const footerNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { data: menuData, isLoading } = useSidebarMenus();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isLoading ? (
                    <SidebarMenu className="p-2 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SidebarMenuItem key={i}>
                                <SidebarMenuSkeleton showIcon />
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                ) : (
                    <NavMain items={menuData?.menus || []} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
