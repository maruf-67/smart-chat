import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    FileText,
    Image as ImageIcon,
    Paperclip,
    Send,
    Wifi,
    WifiOff,
    X,
} from 'lucide-react';
import {
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

interface Message {
    id: number;
    chat_id: number;
    content: string;
    sender: 'guest' | 'agent' | 'bot';
    user_id: number | null;
    created_at: string;
    file_path?: string | null;
    file_type?: string | null;
    file_size?: number | null;
}

interface Chat {
    id: number;
    guest_identifier: string;
    guest_name?: string;
    guest_email?: string;
    messages: Message[];
    status: string;
    created_at: string;
}

export default function AgentChatShow({ chat }: { chat: Chat }) {
    const { url, props } = usePage();
    const userId = (props as { auth?: { user?: { id?: number } } })?.auth?.user
        ?.id;

    const sortMessages = useCallback((items: Message[]): Message[] => {
        return [...items].sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
        );
    }, []);

    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const serverMessages = useMemo(
        () => sortMessages(chat.messages ?? []),
        [chat.messages, sortMessages],
    );
    const combinedMessages = useMemo(() => {
        const merged = new Map<number, Message>();
        [...serverMessages, ...messages].forEach((message) => {
            merged.set(message.id, message);
        });

        return sortMessages(Array.from(merged.values()));
    }, [messages, serverMessages, sortMessages]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const guestName = chat.guest_name ?? chat.guest_identifier;
    const guestEmail = chat.guest_email ?? 'Guest user';

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

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [combinedMessages]);

    // Real-time WebSocket connection
    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) {
            console.warn('[Agent Chat] Echo not available');
            return;
        }

        if (!userId) {
            console.warn('[Agent Chat] No authenticated user found');
            return;
        }

        const channels = [
            `user.${userId}`,
            `guest-chat.${chat.guest_identifier}`,
        ];

        console.log('[Agent Chat] Connecting to channels:', channels);

        const listener = (payload: { message: Message }) => {
            console.log('[Agent Chat] Received message:', payload.message);
            const newMessage = payload.message;
            if (newMessage.chat_id === chat.id) {
                setMessages((prevMessages) => {
                    // Avoid adding duplicate messages
                    if (prevMessages.some((m) => m.id === newMessage.id)) {
                        return prevMessages;
                    }
                    return [...prevMessages, newMessage];
                });
            }
        };

        channels.forEach((channelName) => {
            const channel = window.Echo.channel(channelName);
            channel.subscribed(() => {
                console.log(
                    `[Agent Chat] Successfully subscribed to ${channelName}`,
                );
                setIsConnected(true);
            });
            channel.error(() => {
                setIsConnected(false);
            });
            channel.listen('.MessageSent', listener);
        });

        return () => {
            console.log('[Agent Chat] Cleaning up channel subscriptions');
            setMessages([]);
            channels.forEach((channelName) => {
                window.Echo?.leave(channelName);
            });
            setIsConnected(false);
        };
    }, [chat.guest_identifier, chat.id, userId]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        // Validate file size (1MB = 1048576 bytes)
        if (file.size > 1048576) {
            alert('File size must be less than 1MB');
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
        ];
        if (!allowedTypes.includes(file.type)) {
            alert('Only PDF, JPG, JPEG, and PNG files are allowed');
            return;
        }

        setSelectedFile(file);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!messageText.trim()) {
            return;
        }

        setSending(true);

        const formData = new FormData();
        formData.append('content', messageText);

        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }
        router.post(`/agent/chats/${chat.id}/messages`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setMessageText('');
                handleRemoveFile();
            },
            onFinish: () => setSending(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat with ${guestName}`} />
            <div
                key={chat.id}
                className="flex h-full flex-1 flex-col gap-6 p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Chat with {guestName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {guestEmail}
                        </p>
                    </div>
                    {/* Connection Status */}
                    <Badge
                        variant={isConnected ? 'default' : 'secondary'}
                        className="gap-1.5"
                    >
                        {isConnected ? (
                            <>
                                <Wifi className="h-3 w-3" />
                                Live
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-3 w-3" />
                                Connecting...
                            </>
                        )}
                    </Badge>
                </div>
                {/* Chat Area */}
                <Card className="flex h-[600px] flex-col border-border dark:border-border">
                    <CardHeader className="border-b border-border">
                        <CardTitle>Conversation</CardTitle>
                    </CardHeader>
                    <CardContent
                        ref={messagesContainerRef}
                        className="flex-1 space-y-4 overflow-y-auto p-4"
                    >
                        {combinedMessages.length > 0 ? (
                            <>
                                {combinedMessages.map((message) => {
                                    const isGuest = message.sender === 'guest';
                                    const isBot = message.sender === 'bot';

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isGuest ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div
                                                className={`max-w-[75%] space-y-1 ${isGuest ? 'items-start' : 'items-end'}`}
                                            >
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        message.created_at,
                                                    ).toLocaleTimeString()}
                                                    {isBot && ' • Bot'}
                                                </p>
                                                <div
                                                    className={`rounded-lg p-3 ${
                                                        isGuest
                                                            ? 'bg-muted text-foreground'
                                                            : isBot
                                                              ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'
                                                              : 'bg-primary text-primary-foreground'
                                                    }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {message.content}
                                                    </p>
                                                    {message.file_path && (
                                                        <div className="mt-2 flex items-center gap-2 rounded border border-current/20 bg-current/10 p-2">
                                                            {message.file_type ===
                                                            'pdf' ? (
                                                                <FileText className="h-4 w-4" />
                                                            ) : (
                                                                <ImageIcon className="h-4 w-4" />
                                                            )}
                                                            <a
                                                                href={`/storage/${message.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs underline hover:no-underline"
                                                            >
                                                                View attachment
                                                                {message.file_size &&
                                                                    ` (${(message.file_size / 1024).toFixed(0)}KB)`}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No messages yet. Start the conversation!
                            </div>
                        )}
                    </CardContent>
                    <div className="border-t border-border p-4 dark:border-border">
                        <form
                            onSubmit={handleSendMessage}
                            className="space-y-3"
                        >
                            {/* File Preview */}
                            {selectedFile && (
                                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                                    {filePreview ? (
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(
                                                0,
                                            )}
                                            KB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleRemoveFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Input Row */}
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={sending}
                                    title="Attach file (PDF, JPG, PNG - max 1MB)"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Input
                                    value={messageText}
                                    onChange={(event) =>
                                        setMessageText(event.target.value)
                                    }
                                    placeholder="Type your response..."
                                    className="flex-1"
                                    disabled={sending}
                                />
                                <Button
                                    type="submit"
                                    disabled={sending || !messageText.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                    {sending && (
                                        <span className="ml-2">Sending…</span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
                {combinedMessages.length} total
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-border dark:border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Guest ID</CardTitle>
                        </CardHeader>
                        <CardContent className="text-base font-medium">
                            {chat.guest_identifier}
                        </CardContent>
                    </Card>
                    <Card className="border-border dark:border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Created</CardTitle>
                        </CardHeader>
                        <CardContent className="text-base">
                            {new Date(chat.created_at).toLocaleString()}
                        </CardContent>
                    </Card>
                    <Card className="border-border dark:border-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Messages</CardTitle>
                        </CardHeader>
                        <CardContent className="text-base font-medium">
                            {messages.length} total
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
