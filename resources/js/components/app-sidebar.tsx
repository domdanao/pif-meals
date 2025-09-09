import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Shield, Users, Settings, Ticket, ScanLine, ChefHat } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';
    const isStaff = auth.user.role === 'staff';
    const isAdminOrStaff = ['admin', 'staff'].includes(auth.user.role);
    
    // Use admin dashboard for admin/staff users, regular dashboard for others
    const dashboardUrl = isAdminOrStaff ? '/admin/dashboard' : dashboard();
    
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    // Admin and Staff can access voucher management
    const staffNavItems: NavItem[] = isAdminOrStaff ? [
        {
            title: 'QR Scanner',
            href: '/admin/vouchers/scan',
            icon: ScanLine,
        },
        {
            title: 'Voucher Management',
            href: '/admin/vouchers',
            icon: Ticket,
        },
    ] : [];

    // Only Admins can access user management, meal management and system settings
    const adminOnlyNavItems: NavItem[] = isAdmin ? [
        {
            title: 'Meal Management',
            href: '/admin/meals',
            icon: ChefHat,
        },
        {
            title: 'User Management',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'System Settings',
            href: '/admin/settings',
            icon: Settings,
        },
    ] : [];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} groupLabel="Platform" />
                {staffNavItems.length > 0 && (
                    <NavMain items={staffNavItems} groupLabel="Management" />
                )}
                {adminOnlyNavItems.length > 0 && (
                    <div className="border-t border-sidebar-border">
                        <NavMain items={adminOnlyNavItems} groupLabel="Administration" />
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
