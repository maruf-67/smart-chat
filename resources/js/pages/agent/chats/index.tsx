import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface Chat {
    id: number;
    guest_name: string;
    guest_email: string;
    last_message: string | null;
    last_message_at: string | null;
    message_count: number;
    status: string;
}

export default function AgentChatsIndex({ chats = [] }: { chats?: Chat[] }) {
    const { url } = usePage();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Agent',
            href: '/agent',
        },
        {
            title: 'Chats',
            href: url,
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'closed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Chats" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        My Chats
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your assigned customer conversations
                    </p>
                </div>

                {/* Chats List */}
                <Card className="border-border dark:border-border">
                    <CardHeader>
                        <CardTitle>Active Conversations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chats.length > 0 ? (
                            <div className="space-y-2">
                                {chats.map((chat) => (
                                    <Link
                                        key={chat.id}
                                        href={`/agent/chats/${chat.id}`}
                                        className="block rounded-lg border border-border bg-background p-4 hover:bg-accent dark:border-border dark:hover:bg-accent/50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-foreground">
                                                        {chat.guest_name}
                                                    </h3>
                                                    <Badge
                                                        className={`text-xs ${getStatusColor(
                                                            chat.status,
                                                        )}`}
                                                    >
                                                        {chat.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {chat.guest_email}
                                                </p>
                                                {chat.last_message && (
                                                    <p className="mt-2 line-clamp-2 text-sm text-foreground">
                                                        {chat.last_message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <p>
                                                    {chat.message_count}{' '}
                                                    messages
                                                </p>
                                                {chat.last_message_at && (
                                                    <p>
                                                        {new Date(
                                                            chat.last_message_at,
                                                        ).toLocaleTimeString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    No chats assigned yet. Check back soon!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
