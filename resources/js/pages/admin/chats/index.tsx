import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface Chat {
    id: number;
    guest_name: string;
    guest_email: string;
    agent_id: number | null;
    agent?: { first_name: string; last_name: string } | null;
    message_count: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function AdminChatsIndex({ chats = [] }: { chats?: Chat[] }) {
    const { url } = usePage();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Chats',
            href: url,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Chats" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Chat Threads
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage all customer chat conversations
                        </p>
                    </div>
                </div>

                {/* Chats Table */}
                <Card className="border-border dark:border-border">
                    <CardHeader>
                        <CardTitle>All Chats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chats.length > 0 ? (
                            <div className="space-y-2">
                                {chats.map((chat: Chat) => (
                                    <Link
                                        key={chat.id}
                                        href={`/admin/chats/${chat.id}`}
                                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:bg-accent dark:border-border dark:hover:bg-accent/50"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground">
                                                {chat.guest_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {chat.guest_email}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-foreground">
                                                {chat.agent?.first_name
                                                    ? `Assigned to ${chat.agent.first_name}`
                                                    : 'Unassigned'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {chat.message_count} messages
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    No chats found
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
