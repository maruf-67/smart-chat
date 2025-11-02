import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MessageSquare, User, Bot } from 'lucide-react';

interface Agent {
    id: number;
    name: string;
}

interface Chat {
    id: number;
    guest_identifier: string;
    agent_id: number | null;
    agent?: Agent | null;
    auto_reply_enabled: boolean;
    last_activity_at: string;
    created_at: string;
}

interface PaginatedChats {
    data: Chat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function AdminChatsIndex({
    chats
}: {
    chats: PaginatedChats
}) {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Chats" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Chat Management
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View and manage all customer conversations ({chats.total} total)
                        </p>
                    </div>
                </div>

                {/* Chats List */}
                <Card className="border-border dark:border-border">
                    <CardHeader>
                        <CardTitle>All Chats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chats.data && chats.data.length > 0 ? (
                            <div className="space-y-3">
                                {chats.data.map((chat: Chat) => (
                                    <Link
                                        key={chat.id}
                                        href={`/admin/chats/${chat.id}`}
                                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent dark:border-border dark:hover:bg-accent/50"
                                    >
                                        <div className="flex flex-1 items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <MessageSquare className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-foreground">
                                                        {chat.guest_identifier}
                                                    </span>
                                                    {chat.auto_reply_enabled && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Bot className="h-3 w-3" />
                                                            Auto-reply
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>Last activity: {formatDate(chat.last_activity_at || chat.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {chat.agent ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium text-foreground">
                                                        {chat.agent.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <Badge variant="outline">Unassigned</Badge>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-lg font-medium text-foreground">No chats found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Chats will appear here once guests start conversations
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
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
