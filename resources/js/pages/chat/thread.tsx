import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

interface Message {
    id: number;
    content: string;
    sender: 'guest' | 'agent' | 'bot';
    created_at: string;
}

interface Props {
    guestId?: string;
    messages?: Message[];
}

export default function ChatThread({ guestId, messages = [] }: Props) {
    const [messageText, setMessageText] = useState('');

    return (
        <>
            <Head title="Chat with Us" />

            <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
                {/* Header */}
                <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-semibold">Back to Home</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">
                                Smart Chat
                            </span>
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
                                    <div className="mb-4 min-h-[400px] space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                                        {messages.length === 0 ? (
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
                                            messages.map((message) => (
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
                                                                ? 'bg-primary text-primary-foreground'
                                                                : message.sender ===
                                                                    'bot'
                                                                  ? 'bg-secondary text-secondary-foreground'
                                                                  : 'bg-muted text-foreground'
                                                        }`}
                                                    >
                                                        <p className="text-sm">
                                                            {message.content}
                                                        </p>
                                                        <span className="mt-1 block text-xs opacity-70">
                                                            {new Date(
                                                                message.created_at,
                                                            ).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            // TODO: Implement message sending
                                            console.log(
                                                'Sending message:',
                                                messageText,
                                            );
                                            setMessageText('');
                                        }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Type your message..."
                                            value={messageText}
                                            onChange={(e) =>
                                                setMessageText(e.target.value)
                                            }
                                            className="flex-1"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={!messageText.trim()}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>

                                    <p className="mt-4 text-center text-xs text-muted-foreground">
                                        {guestId ? (
                                            <>Your session ID: {guestId}</>
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
