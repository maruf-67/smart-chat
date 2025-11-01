import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import { Stat } from '@/components/stat';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface User {
    first_name: string;
    last_name: string;
    email: string;
}

export default function AdminDashboard() {
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
                                value="24"
                                description="Active conversations"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Active Agents"
                                value="3"
                                description="Assigned to chats"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Pending Chats"
                                value="5"
                                description="Awaiting assignment"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Messages Today"
                                value="142"
                                description="Total messages sent"
                            />
                        </StaggerItem>
                    </div>
                </StaggerChildren>

                {/* Quick Actions */}
                <SlideIn direction="bottom" delay={0.5}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md dark:border-border">
                            <h2 className="font-semibold text-foreground">
                                Recent Chats
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                View and manage the most recent conversations.
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md dark:border-border">
                            <h2 className="font-semibold text-foreground">
                                System Status
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                All systems operational. Response times are
                                optimal.
                            </p>
                        </div>
                    </div>
                </SlideIn>
            </div>
        </AppLayout>
    );
}
