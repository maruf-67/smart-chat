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
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ListTodo,
    MessageSquare,
    Settings,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage();
    const auth = page.props.auth as
        | { user: { user_type?: 'admin' | 'agent' | 'user' } }
        | undefined;
    const userType = auth?.user?.user_type;

    const mainNavItems = useMemo((): NavItem[] => {
        if (userType === 'admin') {
            return [
                {
                    title: 'Dashboard',
                    href: '/admin',
                    icon: LayoutDashboard,
                },
                {
                    title: 'Chats',
                    href: '/admin/chats',
                    icon: MessageSquare,
                },
                {
                    title: 'Rules',
                    href: '/admin/rules',
                    icon: ListTodo,
                },
                {
                    title: 'Users',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'Settings',
                    href: '/settings/profile',
                    icon: Settings,
                },
            ];
        }

        if (userType === 'agent') {
            return [
                {
                    title: 'Dashboard',
                    href: '/agent',
                    icon: LayoutDashboard,
                },
                {
                    title: 'My Chats',
                    href: '/agent/chats',
                    icon: MessageSquare,
                },
                {
                    title: 'Settings',
                    href: '/settings/profile',
                    icon: Settings,
                },
            ];
        }

        // Default/fallback for regular users
        return [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            },
            {
                title: 'Settings',
                href: '/settings/profile',
                icon: Settings,
            },
        ];
    }, [userType]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    userType === 'admin'
                                        ? '/admin'
                                        : userType === 'agent'
                                          ? '/agent'
                                          : '/dashboard'
                                }
                                prefetch
                            >
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
