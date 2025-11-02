import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    Loader2,
    MessageCircle,
    Paperclip,
    Send,
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
    created_at: string;
    user_id?: number | null;
    file_path?: string | null;
    file_type?: string | null;
    file_size?: number | null;
}

interface Props {
    guestId?: string;
    chat?: {
        id: number;
        guest_identifier: string;
        auto_reply_enabled: boolean;
        agent_id?: number | null;
        messages: Message[];
        has_more_messages?: boolean;
    } | null;
}

export default function ChatThread({ guestId, chat }: Props) {
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
        () => sortMessages(chat?.messages ?? []),
        [chat?.messages, sortMessages],
    );
    const combinedMessages = useMemo(() => {
        const merged = new Map<number, Message>();
        [...serverMessages, ...messages].forEach((message) => {
            merged.set(message.id, message);
        });

        return sortMessages(Array.from(merged.values()));
    }, [messages, serverMessages, sortMessages]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [botIndicatorTimestamp, setBotIndicatorTimestamp] = useState<
        string | null
    >(null);
    const botTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(chat?.has_more_messages ?? false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const guestIdentifier = chat?.guest_identifier ?? guestId ?? '';
    const expectsAutoReply = useMemo(() => {
        if (chat) {
            if (chat.agent_id) {
                return false;
            }

            return chat.auto_reply_enabled !== false;
        }

        return true;
    }, [chat]);

    const clearBotTypingTimer = useCallback(() => {
        if (botTypingTimeoutRef.current) {
            clearTimeout(botTypingTimeoutRef.current);
            botTypingTimeoutRef.current = null;
        }
    }, []);
    const clearBotTypingIndicator = useCallback(() => {
        setIsBotTyping(false);
        setBotIndicatorTimestamp(null);
        clearBotTypingTimer();
    }, [clearBotTypingTimer]);

    const showBotTypingIndicator = useCallback(() => {
        setIsBotTyping(true);
        setBotIndicatorTimestamp(new Date().toISOString());
        clearBotTypingTimer();
        botTypingTimeoutRef.current = setTimeout(() => {
            clearBotTypingIndicator();
        }, 15000);
    }, [clearBotTypingIndicator, clearBotTypingTimer]);

    useEffect(() => {
        if (!guestIdentifier || typeof window === 'undefined' || !window.Echo) {
            return;
        }

        const channelName = `guest-chat.${guestIdentifier}`;
        console.log('[Guest Chat] Connecting to channel:', channelName);
        const channel = window.Echo.channel(channelName);

        channel.subscribed(() => {
            console.log('[Guest Chat] Successfully subscribed');
        });

        const listener = (payload: { message: Message }) => {
            console.log('[Guest Chat] Received message:', payload.message);
            const newMessage = payload.message;
            setMessages((prevMessages) => {
                // Avoid adding duplicate messages
                if (prevMessages.some((m) => m.id === newMessage.id)) {
                    return prevMessages;
                }
                return [...prevMessages, newMessage];
            });
        };

        channel.listen('.MessageSent', listener);

        return () => {
            console.log('[Guest Chat] Leaving channel:', channelName);
            channel.stopListening('.MessageSent', listener);
            setMessages([]);
            window.Echo?.leave(channelName);
            clearBotTypingTimer();
        };
    }, [
        clearBotTypingIndicator,
        clearBotTypingTimer,
        guestIdentifier,
        sortMessages,
    ]);

    useEffect(() => {
        return () => {
            clearBotTypingTimer();
        };
    }, [clearBotTypingTimer]);

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

    const loadMoreMessages = useCallback(async () => {
        if (!guestIdentifier || loadingMore || !hasMore) {
            return;
        }

        setLoadingMore(true);

        try {
            const oldestMessage = combinedMessages[0];
            const beforeId = oldestMessage?.id;

            const response = await fetch(
                `/chat/${guestIdentifier}/messages?before_id=${beforeId}`,
            );
            const data = await response.json();

            if (data.messages && data.messages.length > 0) {
                setMessages((prev) => {
                    const merged = new Map<number, Message>();
                    [...data.messages, ...prev].forEach((message) => {
                        merged.set(message.id, message);
                    });

                    return Array.from(merged.values());
                });
                setHasMore(data.has_more);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more messages:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [combinedMessages, guestIdentifier, hasMore, loadingMore]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!guestIdentifier || !messageText.trim()) {
            return;
        }

        setSending(true);

        const formData = new FormData();
        formData.append('content', messageText);

        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }
        router.post(`/chat/${guestIdentifier}/messages`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setMessageText('');
                handleRemoveFile();
                if (expectsAutoReply) {
                    showBotTypingIndicator();
                }
            },
            onFinish: () => setSending(false),
            onError: () => {
                clearBotTypingIndicator();
            },
        });
    };

    return (
        <>
            <Head title="Chat with Us" />

            <div
                key={guestIdentifier || 'new-thread'}
                className="min-h-screen bg-linear-to-br from-background via-background to-muted/20"
            >
                {/* Header */}
                <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-semibold">Back to Home</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold">
                                    Smart Chat
                                </span>
                            </div>
                            <Link href="/chat?new=1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    New Chat
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Chat Area */}
                <main className="container mx-auto px-4 py-8">
                    <FadeIn delay={0.1} className="mx-auto max-w-4xl">
                        <div className="mb-6 text-center">
                            <h1 className="mb-2 text-3xl font-bold">
                                Start a Conversation
                            </h1>
                            <p className="text-muted-foreground">
                                Our AI-powered assistant is here to help you
                                24/7
                            </p>
                        </div>

                        <SlideIn direction="bottom" delay={0.2}>
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                        Chat Window
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Messages Area */}
                                    <div
                                        ref={messagesContainerRef}
                                        className="mb-4 min-h-[400px] space-y-4 rounded-lg border border-border bg-muted/20 p-4"
                                    >
                                        {/* Load More Button */}
                                        {hasMore &&
                                            combinedMessages.length > 0 && (
                                                <div className="flex justify-center pb-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={
                                                            loadMoreMessages
                                                        }
                                                        disabled={loadingMore}
                                                        className="gap-2"
                                                    >
                                                        {loadingMore ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Loading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Load Earlier
                                                                Messages
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                        {combinedMessages.length === 0 ? (
                                            <div className="flex h-[400px] flex-col items-center justify-center text-center">
                                                <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                                <p className="text-lg font-medium text-muted-foreground">
                                                    No messages yet
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Start the conversation
                                                    below!
                                                </p>
                                            </div>
                                        ) : (
                                            combinedMessages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${
                                                        message.sender ===
                                                        'guest'
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                                            message.sender ===
                                                            'guest'
                                                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                                : message.sender ===
                                                                    'bot'
                                                                  ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100'
                                                                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                                        }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-line">
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
                                                                    View
                                                                    attachment
                                                                    {message.file_size &&
                                                                        ` (${(message.file_size / 1024).toFixed(0)}KB)`}
                                                                </a>
                                                            </div>
                                                        )}
                                                        <span className="mt-1 block text-xs opacity-70">
                                                            {new Date(
                                                                message.created_at,
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {isBotTyping && (
                                            <div className="flex justify-start">
                                                <div className="max-w-[80%] rounded-lg bg-green-100 px-4 py-2 text-green-900 dark:bg-green-900/30 dark:text-green-100">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>
                                                            Assistant is typing…
                                                        </span>
                                                    </div>
                                                    <span className="mt-1 block text-xs opacity-70">
                                                        {botIndicatorTimestamp
                                                            ? new Date(
                                                                  botIndicatorTimestamp,
                                                              ).toLocaleTimeString()
                                                            : '...'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <form
                                        onSubmit={handleSubmit}
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
                                                        {(
                                                            selectedFile.size /
                                                            1024
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
                                                type="text"
                                                placeholder="Type your message..."
                                                value={messageText}
                                                onChange={(e) =>
                                                    setMessageText(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1"
                                                disabled={sending}
                                            />
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={
                                                    sending ||
                                                    !messageText.trim()
                                                }
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>

                                    <p className="mt-4 text-center text-xs text-muted-foreground">
                                        {guestIdentifier ? (
                                            <>
                                                Your session ID:{' '}
                                                {guestIdentifier}
                                            </>
                                        ) : (
                                            <>
                                                A session ID will be assigned
                                                when you send your first message
                                            </>
                                        )}
                                    </p>
                                </CardContent>
                            </Card>
                        </SlideIn>

                        {/* Features */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <FadeIn delay={0.4}>
                                <div className="rounded-lg border border-border bg-card p-4 text-center">
                                    <div className="mb-2 text-2xl">⚡</div>
                                    <h3 className="mb-1 font-semibold">
                                        Instant Replies
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Get immediate responses from our AI
                                    </p>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.5}>
                                <div className="rounded-lg border border-border bg-card p-4 text-center">
                                    <div className="mb-2 text-2xl">👤</div>
                                    <h3 className="mb-1 font-semibold">
                                        Human Support
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Agents can join when needed
                                    </p>
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.6}>
                                <div className="rounded-lg border border-border bg-card p-4 text-center">
                                    <div className="mb-2 text-2xl">🔒</div>
                                    <h3 className="mb-1 font-semibold">
                                        Secure & Private
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your conversations are protected
                                    </p>
                                </div>
                            </FadeIn>
                        </div>
                    </FadeIn>
                </main>
            </div>
        </>
    );
}
