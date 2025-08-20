import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, TrendingUp, ShoppingCart, UtensilsCrossed, Users, Shield, UserCog, Activity } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/usePermissions';
import { useMemo } from 'react';

// Define navigation items with their required permissions
const navigationConfig: Array<NavItem & { permission?: string; roles?: string[] }> = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: 'view dashboard',
    },
    {
        title: 'Pulse',
        href: '/pulse',
        icon: Activity,
        permission: 'view dashboard', // Reusing dashboard permission for simplicity, or you can create a specific pulse permission
    },
    {
        title: 'Deposits',
        href: '/deposits',
        icon: TrendingUp,
        permission: 'view deposits',
    },
    {
        title: 'Shopping Expenses',
        href: '/shopping-expenses',
        icon: ShoppingCart,
        permission: 'view shopping expenses',
    },
    {
        title: 'Meals',
        href: '/meals',
        icon: UtensilsCrossed,
        permission: 'view meals',
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
        permission: 'view users',
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: UserCog,
        permission: 'view roles',
    },
    {
        title: 'Permissions',
        href: '/roles/permissions',
        icon: Shield,
        permission: 'view roles', // Same as roles since permissions are part of role management
    },
];

export function AppSidebar() {
    const { hasPermission, hasRole } = usePermissions();
    
    // Filter navigation items based on user permissions
    const mainNavItems: NavItem[] = useMemo(() => {
        return navigationConfig.filter(item => {
            // If no permission is required, show the item
            if (!item.permission && !item.roles) {
                return true;
            }
            
            // Check permission
            if (item.permission && hasPermission(item.permission)) {
                return true;
            }
            
            // Check roles
            if (item.roles && item.roles.some(role => hasRole(role))) {
                return true;
            }
            
            return false;
        }).map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { permission, roles, ...navItem } = item;
            return navItem;
        });
    }, [hasPermission, hasRole]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
