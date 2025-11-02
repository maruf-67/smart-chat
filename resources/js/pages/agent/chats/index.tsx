import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface Agent {
    id: number;
    name: string;
}

interface MessageSummary {
    id: number;
    content: string;
    created_at: string;
}

interface Chat {
    id: number;
    guest_identifier: string;
    agent_id: number | null;
    agent?: Agent | null;
    messages?: MessageSummary[]; // latest message eager-loaded (limit 1)
    messages_count: number;
    last_activity_at: string | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function AgentChatsIndex({ chats }: { chats: Paginated<Chat> }) {
    const { url } = usePage();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Agent', href: '/agent' },
        { title: 'Chats', href: url },
    ];

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
                        Manage your assigned conversations
                    </p>
                </div>

                {/* Chats List */}
                <Card className="border-border dark:border-border">
                    <CardHeader>
                        <CardTitle>Assigned Conversations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chats.data.length > 0 ? (
                            <div className="space-y-2">
                                {chats.data.map((chat) => {
                                    const last =
                                        chat.messages && chat.messages.length > 0
                                            ? chat.messages[0]
                                            : null;
                                    return (
                                        <Link
                                            key={chat.id}
                                            href={`/agent/chats/${chat.id}`}
                                            className="block rounded-lg border border-border bg-background p-4 hover:bg-accent dark:border-border dark:hover:bg-accent/50"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-foreground">
                                                            {chat.guest_identifier}
                                                        </h3>
                                                        <Badge
                                                            variant={
                                                                chat.agent_id
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {chat.agent_id
                                                                ? chat.agent?.name ??
                                                                  'Assigned'
                                                                : 'Unassigned'}
                                                        </Badge>
                                                    </div>
                                                    {last && (
                                                        <p className="mt-2 line-clamp-2 text-sm text-foreground">
                                                            {last.content}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right text-xs text-muted-foreground">
                                                    <p>{chat.messages_count} messages</p>
                                                    <p>
                                                        {new Date(
                                                            chat.last_activity_at ??
                                                                last?.created_at ??
                                                                chat.id,
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    No chats assigned yet. Check back soon!
                                </p>
                            </div>
                        )}

                        {chats.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Page {chats.current_page} of {chats.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {chats.current_page > 1 && (
                                        <Link
                                            href={`${url}?page=${chats.current_page - 1}`}
                                            className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {chats.current_page < chats.last_page && (
                                        <Link
                                            href={`${url}?page=${chats.current_page + 1}`}
                                            className="rounded-md border border-border px-3 py-1 text-sm hover:bg-accent"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
