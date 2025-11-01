import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type FormEvent, useRef } from 'react';

interface Message {
    id: number;
    content: string;
    user_id: number | null;
    created_at: string;
}

interface Chat {
    id: number;
    guest_name: string;
    guest_email: string;
    agent_id: number | null;
    agent?: { first_name: string; last_name: string } | null;
    messages: Message[];
    status: string;
    created_at: string;
}

export default function AdminChatShow({ chat }: { chat: Chat }) {
    const { url } = usePage();
    const messageInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Chats',
            href: '/admin/chats',
        },
        {
            title: `Chat with ${chat.guest_name}`,
            href: url,
        },
    ];

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const message = messageInputRef.current?.value;
        if (message && messageInputRef.current) {
            // TODO: Send message via API
            messageInputRef.current.value = '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat with ${chat.guest_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Chat with {chat.guest_name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {chat.guest_email}
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Messages */}
                    <div className="lg:col-span-2">
                        <Card className="flex h-96 flex-col border-border dark:border-border">
                            <CardHeader>
                                <CardTitle>Messages</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4 overflow-y-auto">
                                {chat.messages && chat.messages.length > 0 ? (
                                    chat.messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className="space-y-1"
                                        >
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    message.created_at,
                                                ).toLocaleString()}
                                            </p>
                                            <div
                                                className={`rounded-lg p-3 text-sm ${
                                                    message.user_id
                                                        ? 'ml-auto max-w-xs bg-primary text-primary-foreground'
                                                        : 'max-w-xs bg-accent text-accent-foreground'
                                                }`}
                                            >
                                                {message.content}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No messages yet
                                    </div>
                                )}
                            </CardContent>
                            <div className="border-t border-border p-4 dark:border-border">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex gap-2"
                                >
                                    <Input
                                        ref={messageInputRef}
                                        placeholder="Type a message..."
                                        className="flex-1"
                                    />
                                    <Button type="submit">Send</Button>
                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Chat Info */}
                    <div className="space-y-4">
                        <Card className="border-border dark:border-border">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Chat Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Guest Name
                                    </Label>
                                    <p className="font-medium text-foreground">
                                        {chat.guest_name}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Guest Email
                                    </Label>
                                    <p className="font-medium text-foreground">
                                        {chat.guest_email}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Assigned Agent
                                    </Label>
                                    <p className="font-medium text-foreground">
                                        {chat.agent
                                            ? `${chat.agent.first_name} ${chat.agent.last_name}`
                                            : 'Unassigned'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Status
                                    </Label>
                                    <p className="font-medium text-foreground capitalize">
                                        {chat.status}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Created At
                                    </Label>
                                    <p className="font-medium text-foreground">
                                        {new Date(
                                            chat.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
