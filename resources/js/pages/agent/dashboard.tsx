import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import { Stat } from '@/components/stat';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

export default function AgentDashboard() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Agent',
            href: '/agent',
        },
        {
            title: 'Dashboard',
            href: '/agent',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agent Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Welcome Header */}
                <FadeIn delay={0.1}>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Your Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        View your assigned chats and respond to customers.
                    </p>
                </FadeIn>

                {/* Stats Grid */}
                <StaggerChildren staggerDelay={0.08} childDelay={0.2}>
                    <div className="grid gap-4 md:grid-cols-3">
                        <StaggerItem>
                            <Stat
                                label="Assigned Chats"
                                value="4"
                                description="Currently handling"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Pending Chats"
                                value="2"
                                description="Waiting for assignment"
                            />
                        </StaggerItem>
                        <StaggerItem>
                            <Stat
                                label="Today's Messages"
                                value="38"
                                description="Total responses sent"
                            />
                        </StaggerItem>
                    </div>
                </StaggerChildren>

                {/* Quick Actions */}
                <SlideIn direction="bottom" delay={0.5}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md dark:border-border">
                            <h2 className="font-semibold text-foreground">
                                Your Active Chats
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                View and manage conversations you're currently
                                handling.
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md dark:border-border">
                            <h2 className="font-semibold text-foreground">
                                Response Time
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Average response time: 2 minutes 30 seconds
                            </p>
                        </div>
                    </div>
                </SlideIn>
            </div>
        </AppLayout>
    );
}
