import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Bot,
    FileText,
    Image as ImageIcon,
    Paperclip,
    Send,
    User,
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

interface Agent {
    id: number;
    name: string;
    email: string;
}

interface Chat {
    id: number;
    guest_identifier: string;
    agent_id: number | null;
    auto_reply_enabled: boolean;
    agent?: Agent | null;
    messages: Message[];
    created_at: string;
    last_activity_at: string;
}

interface Props {
    chat: Chat;
    agents: Agent[];
}

export default function AdminChatShow({ chat, agents }: Props) {
    const { url } = usePage();

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
    const [selectedAgent, setSelectedAgent] = useState<string>(
        chat.agent_id?.toString() || 'unassigned',
    );
    const [updatingAgent, setUpdatingAgent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
            title: chat.guest_identifier,
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

    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) {
            return;
        }

        const channels = [`guest-chat.${chat.guest_identifier}`, 'admin-chats'];

        console.log('[Admin Chat] Connecting to channels:', channels);

        const listener = (payload: { message: Message }) => {
            console.log('[Admin Chat] Received message:', payload.message);
            const newMessage = payload.message;
            // Ensure we only add messages for the current chat
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
                    `[Admin Chat] Successfully subscribed to ${channelName}`,
                );
            });
            channel.listen('.MessageSent', listener);
        });

        return () => {
            console.log('[Admin Chat] Cleaning up channel subscriptions');
            setMessages([]);
            channels.forEach((channelName) => {
                window.Echo?.leave(channelName);
            });
        };
    }, [chat.guest_identifier, chat.id]);

    const handleAgentChange = (value: string) => {
        setSelectedAgent(value);
        setUpdatingAgent(true);

        const agentId = value === 'unassigned' ? null : parseInt(value);

        router.patch(
            `/admin/chats/${chat.id}`,
            { agent_id: agentId },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingAgent(false),
            },
        );
    };

    const toggleAutoReply = () => {
        router.patch(
            `/admin/chats/${chat.id}`,
            { auto_reply_enabled: !chat.auto_reply_enabled },
            {
                preserveScroll: true,
            },
        );
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 1048576) {
            alert('File size must be less than 1MB');
            return;
        }

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
        if (!messageText.trim()) return;

        setSending(true);

        const formData = new FormData();
        formData.append('content', messageText);

        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }

        router.post(`/admin/chats/${chat.id}/messages`, formData, {
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
            <Head title={`Chat: ${chat.guest_identifier}`} />
            <div
                key={chat.id}
                className="flex h-full flex-1 flex-col gap-6 p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {chat.guest_identifier}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Started {new Date(chat.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {chat.auto_reply_enabled && (
                            <Badge variant="secondary" className="gap-1">
                                <Bot className="h-3 w-3" />
                                Auto-reply active
                            </Badge>
                        )}
                        {chat.agent && (
                            <Badge variant="default" className="gap-1">
                                <User className="h-3 w-3" />
                                {chat.agent.name}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Messages Section */}
                    <div className="lg:col-span-2">
                        <Card className="flex h-[600px] flex-col border-border dark:border-border">
                            <CardHeader className="border-b border-border">
                                <CardTitle>Messages</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
                                {combinedMessages.length > 0 ? (
                                    <>
                                        {combinedMessages.map((message) => {
                                            const isGuest =
                                                message.sender === 'guest';
                                            const isBot =
                                                message.sender === 'bot';

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isGuest ? 'justify-start' : 'justify-end'}`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] space-y-1 ${
                                                            isGuest
                                                                ? 'items-start'
                                                                : 'items-end'
                                                        }`}
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
                                                                {
                                                                    message.content
                                                                }
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
                                                                        View
                                                                        attachment
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
                                        No messages yet
                                    </div>
                                )}
                            </CardContent>
                            <div className="border-t border-border p-4">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="space-y-3"
                                >
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
                                                    {(
                                                        selectedFile.size / 1024
                                                    ).toFixed(0)}
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
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            placeholder="Type your message..."
                                            value={messageText}
                                            onChange={(e) =>
                                                setMessageText(e.target.value)
                                            }
                                            disabled={sending}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={
                                                sending || !messageText.trim()
                                            }
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Settings Section */}
                    <div className="space-y-6">
                        {/* Agent Assignment */}
                        <Card className="border-border dark:border-border">
                            <CardHeader>
                                <CardTitle>Agent Assignment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Assign Agent</Label>
                                    <Select
                                        value={selectedAgent}
                                        onValueChange={handleAgentChange}
                                        disabled={updatingAgent}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">
                                                Unassigned
                                            </SelectItem>
                                            {agents.map((agent) => (
                                                <SelectItem
                                                    key={agent.id}
                                                    value={agent.id.toString()}
                                                >
                                                    {agent.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Assigning an agent will disable
                                        auto-reply
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Auto-Reply Settings */}
                        <Card className="border-border dark:border-border">
                            <CardHeader>
                                <CardTitle>Auto-Reply</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Status
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {chat.auto_reply_enabled
                                                ? 'Active'
                                                : 'Disabled'}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            chat.auto_reply_enabled
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {chat.auto_reply_enabled ? 'ON' : 'OFF'}
                                    </Badge>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={toggleAutoReply}
                                    className="w-full"
                                >
                                    {chat.auto_reply_enabled
                                        ? 'Disable'
                                        : 'Enable'}{' '}
                                    Auto-Reply
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Chat Info */}
                        <Card className="border-border dark:border-border">
                            <CardHeader>
                                <CardTitle>Chat Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium">Guest ID</p>
                                    <p className="text-muted-foreground">
                                        {chat.guest_identifier}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">Created</p>
                                    <p className="text-muted-foreground">
                                        {new Date(
                                            chat.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">Last Activity</p>
                                    <p className="text-muted-foreground">
                                        {new Date(
                                            chat.last_activity_at ||
                                                chat.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">Messages</p>
                                    <p className="text-muted-foreground">
                                        {combinedMessages.length} total
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
