import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import { Stat } from '@/components/stat';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface User {
    first_name: string;
    last_name: string;
    email: string;
}

interface Stats {
    total_chats: number;
    active_agents: number;
    unassigned_chats: number;
    messages_today: number;
}

interface Props {
    stats: Stats;
}

export default function AdminDashboard({ stats }: Props) {
    const page = usePage();
    const auth = page.props.auth as { user: User } | undefined;
    const user = auth?.user;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Dashboard',
            href: '/admin',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Welcome Header */}
                <FadeIn delay={0.1}>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome back, {user?.first_name ?? 'Admin'}!
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Here's an overview of your chat management system.
                    </p>
                </FadeIn>

                {/* Stats Grid */}
                <StaggerChildren staggerDelay={0.08} childDelay={0.2}>
                    <div className="grid gap-4 md:grid-cols-4">
                        <StaggerItem>
                            <Stat
                                label="Total Chats"
                                value={stats.total_chats.toString()}
                                description="All conversations"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Active Agents"
                                value={stats.active_agents.toString()}
                                description="Assigned to chats"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Unassigned Chats"
                                value={stats.unassigned_chats.toString()}
                                description="Awaiting assignment"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Messages Today"
                                value={stats.messages_today.toString()}
                                description="Total messages sent"
                            />
                        </StaggerItem>
                    </div>
                </StaggerChildren>

                {/* Quick Actions */}
                <SlideIn direction="bottom" delay={0.5}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Link href="/admin/chats">
                            <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md dark:border-border cursor-pointer">
                                <h2 className="font-semibold text-foreground">
                                    Manage Chats
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    View and manage all customer conversations. Assign
                                    agents and monitor chat activity.
                                </p>
                            </div>
                        </Link>
                        <Link href="/admin/rules">
                            <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md dark:border-border cursor-pointer">
                                <h2 className="font-semibold text-foreground">
                                    Auto-Reply Rules
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Configure intelligent auto-reply rules for common
                                    questions and scenarios.
                                </p>
                            </div>
                        </Link>
                    </div>
                </SlideIn>
            </div>
        </AppLayout>
    );
}
