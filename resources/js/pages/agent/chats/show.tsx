import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    messages: Message[];
    status: string;
    created_at: string;
}

export default function AgentChatShow({ chat }: { chat: Chat }) {
    const { url } = usePage();
    const messageInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Agent',
            href: '/agent',
        },
        {
            title: 'Chats',
            href: '/agent/chats',
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

                {/* Chat Area */}
                <Card className="flex flex-1 flex-col border-border dark:border-border">
                    <CardHeader>
                        <CardTitle>Conversation</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4 overflow-y-auto">
                        {chat.messages && chat.messages.length > 0 ? (
                            chat.messages.map((message) => (
                                <div key={message.id} className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            message.created_at,
                                        ).toLocaleString()}
                                    </p>
                                    <div
                                        className={`w-fit max-w-md rounded-lg p-3 text-sm ${
                                            message.user_id
                                                ? 'ml-auto bg-primary text-primary-foreground'
                                                : 'bg-accent text-accent-foreground'
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No messages yet. Start the conversation!
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
                                placeholder="Type your response..."
                                className="flex-1"
                            />
                            <Button type="submit">Send</Button>
                        </form>
                    </div>
                </Card>

                {/* Chat Info */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-border dark:border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">
                                Guest Name
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-base font-medium">
                            {chat.guest_name}
                        </CardContent>
                    </Card>
                    <Card className="border-border dark:border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">
                                Guest Email
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-base font-medium">
                            {chat.guest_email}
                        </CardContent>
                    </Card>
                    <Card className="border-border dark:border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="text-base font-medium capitalize">
                            {chat.status}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
