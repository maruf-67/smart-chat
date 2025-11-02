import { FloatingCard } from '@/components/animations/floating-card';
import { ParallaxContainer } from '@/components/animations/parallax-container';
import { RotateIn } from '@/components/animations/rotate-in';
import { SlideIn } from '@/components/animations/slide-in';
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import { TiltCard } from '@/components/animations/tilt-card';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Clock,
    MessageCircle,
    Shield,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to Smart Chat">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted/20">
                {/* Animated background blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <ParallaxContainer
                        speed={-0.3}
                        className="absolute top-20 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
                    />
                    <ParallaxContainer
                        speed={0.5}
                        className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
                    />
                    <ParallaxContainer
                        speed={-0.2}
                        className="absolute top-2/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
                    />
                </div>

                {/* Navigation */}
                <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
                    <nav className="container mx-auto flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2">
                            <MessageCircle className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">
                                Smart Chat
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={dashboard()}>
                                    <Button variant="default">Dashboard</Button>
                                </Link>
                            ) : (
                                <Link href={login()}>
                                    <Button variant="ghost">Log in</Button>
                                </Link>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 container mx-auto px-4 pt-32 pb-16">
                    <FloatingCard
                        delay={0.1}
                        duration={4}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <div className="mb-8 space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                                <span className="inline-block bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                                    Smart Chat Workflow
                                </span>
                                <span className="block bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Management System
                                </span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Automate conversations, empower agents, and
                                delight customers with intelligent auto-reply
                                engine and real-time chat management.
                            </p>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <RotateIn delay={0.6} axis="y">
                                <Link href="/chat">
                                    <Button
                                        size="lg"
                                        className="gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        Start Chat Now
                                    </Button>
                                </Link>
                            </RotateIn>
                            <RotateIn delay={0.7} axis="y">
                                <Link href="/chat?new=1">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="gap-2 transition-all hover:scale-105"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        New Conversation
                                    </Button>
                                </Link>
                            </RotateIn>
                        </div>
                    </FloatingCard>

                    {/* Features Grid */}
                    <SlideIn direction="bottom" delay={0.3} className="mt-24">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold">
                                Why Choose Smart Chat?
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Everything you need to manage customer
                                conversations at scale
                            </p>
                        </div>

                        <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <StaggerItem>
                                <TiltCard
                                    tiltAmount={10}
                                    className="group relative h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <RotateIn
                                        delay={0.5}
                                        axis="z"
                                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-lg"
                                        style={{
                                            transform: 'translateZ(50px)',
                                        }}
                                    >
                                        <Zap className="h-7 w-7 text-primary" />
                                    </RotateIn>
                                    <h3
                                        className="mb-2 text-xl font-semibold"
                                        style={{
                                            transform: 'translateZ(30px)',
                                        }}
                                    >
                                        Auto-Reply Engine
                                    </h3>
                                    <p
                                        className="text-muted-foreground"
                                        style={{
                                            transform: 'translateZ(20px)',
                                        }}
                                    >
                                        Intelligent AI-powered responses handle
                                        common queries instantly, 24/7
                                    </p>
                                </TiltCard>
                            </StaggerItem>

                            <StaggerItem>
                                <TiltCard
                                    tiltAmount={10}
                                    className="group relative h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <RotateIn
                                        delay={0.6}
                                        axis="z"
                                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-lg"
                                        style={{
                                            transform: 'translateZ(50px)',
                                        }}
                                    >
                                        <Users className="h-7 w-7 text-primary" />
                                    </RotateIn>
                                    <h3
                                        className="mb-2 text-xl font-semibold"
                                        style={{
                                            transform: 'translateZ(30px)',
                                        }}
                                    >
                                        Agent Workspace
                                    </h3>
                                    <p
                                        className="text-muted-foreground"
                                        style={{
                                            transform: 'translateZ(20px)',
                                        }}
                                    >
                                        Unified dashboard for agents to manage
                                        assigned chats efficiently
                                    </p>
                                </TiltCard>
                            </StaggerItem>

                            <StaggerItem>
                                <TiltCard
                                    tiltAmount={10}
                                    className="group relative h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <RotateIn
                                        delay={0.7}
                                        axis="z"
                                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-lg"
                                        style={{
                                            transform: 'translateZ(50px)',
                                        }}
                                    >
                                        <Clock className="h-7 w-7 text-primary" />
                                    </RotateIn>
                                    <h3
                                        className="mb-2 text-xl font-semibold"
                                        style={{
                                            transform: 'translateZ(30px)',
                                        }}
                                    >
                                        Real-Time Updates
                                    </h3>
                                    <p
                                        className="text-muted-foreground"
                                        style={{
                                            transform: 'translateZ(20px)',
                                        }}
                                    >
                                        Instant message delivery with Laravel
                                        Reverb WebSocket integration
                                    </p>
                                </TiltCard>
                            </StaggerItem>

                            <StaggerItem>
                                <TiltCard
                                    tiltAmount={10}
                                    className="group relative h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <RotateIn
                                        delay={0.8}
                                        axis="z"
                                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-lg"
                                        style={{
                                            transform: 'translateZ(50px)',
                                        }}
                                    >
                                        <Shield className="h-7 w-7 text-primary" />
                                    </RotateIn>
                                    <h3
                                        className="mb-2 text-xl font-semibold"
                                        style={{
                                            transform: 'translateZ(30px)',
                                        }}
                                    >
                                        Role-Based Access
                                    </h3>
                                    <p
                                        className="text-muted-foreground"
                                        style={{
                                            transform: 'translateZ(20px)',
                                        }}
                                    >
                                        Secure RBAC system with Admin, Agent,
                                        and Guest permissions
                                    </p>
                                </TiltCard>
                            </StaggerItem>

                            <StaggerItem>
                                <TiltCard
                                    tiltAmount={10}
                                    className="group relative h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <RotateIn
                                        delay={0.9}
                                        axis="z"
                                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-lg"
                                        style={{
                                            transform: 'translateZ(50px)',
                                        }}
                                    >
                                        <TrendingUp className="h-7 w-7 text-primary" />
                                    </RotateIn>
                                    <h3
                                        className="mb-2 text-xl font-semibold"
                                        style={{
                                            transform: 'translateZ(30px)',
                                        }}
                                    >
                                        Analytics Dashboard
                                    </h3>
                                    <p
                                        className="text-muted-foreground"
                                        style={{
                                            transform: 'translateZ(20px)',
                                        }}
                                    >
                                        Track performance metrics, response
                                        times, and agent productivity
                                    </p>
                                </TiltCard>
                            </StaggerItem>

                            <StaggerItem>
                                <TiltCard
                                    tiltAmount={10}
                                    className="group relative h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <RotateIn
                                        delay={1.0}
                                        axis="z"
                                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 shadow-lg"
                                        style={{
                                            transform: 'translateZ(50px)',
                                        }}
                                    >
                                        <MessageCircle className="h-7 w-7 text-primary" />
                                    </RotateIn>
                                    <h3
                                        className="mb-2 text-xl font-semibold"
                                        style={{
                                            transform: 'translateZ(30px)',
                                        }}
                                    >
                                        Guest Chat Interface
                                    </h3>
                                    <p
                                        className="text-muted-foreground"
                                        style={{
                                            transform: 'translateZ(20px)',
                                        }}
                                    >
                                        Clean, intuitive chat interface for
                                        guests - no login required
                                    </p>
                                </TiltCard>
                            </StaggerItem>
                        </StaggerChildren>
                    </SlideIn>

                    {/* CTA Section */}
                    <div className="mt-24">
                        <TiltCard
                            tiltAmount={5}
                            className="relative overflow-hidden rounded-2xl border border-border/50 bg-linear-to-r from-primary/10 via-background to-primary/10 p-12 text-center backdrop-blur-sm"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Animated gradient border effect */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r from-primary/20 via-transparent to-primary/20 opacity-50" />

                            <FloatingCard delay={0.2} duration={5}>
                                <h2
                                    className="mb-4 text-3xl font-bold"
                                    style={{ transform: 'translateZ(40px)' }}
                                >
                                    Ready to Transform Your Customer Service?
                                </h2>
                                <p
                                    className="mb-8 text-lg text-muted-foreground"
                                    style={{ transform: 'translateZ(30px)' }}
                                >
                                    Join thousands of businesses using Smart
                                    Chat to automate support and increase
                                    satisfaction
                                </p>
                                <div
                                    className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                                    style={{ transform: 'translateZ(50px)' }}
                                >
                                    <RotateIn delay={1.2} axis="y">
                                        <Link href="/chat?new=1">
                                            <Button
                                                size="lg"
                                                className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                                            >
                                                <MessageCircle className="h-5 w-5" />
                                                Try Live Chat Demo
                                            </Button>
                                        </Link>
                                    </RotateIn>
                                </div>
                            </FloatingCard>
                        </TiltCard>
                    </div>

                    {/* Footer */}
                    <footer className="mt-24 border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
                        <p>
                            © {new Date().getFullYear()} Smart Chat. All rights
                            reserved.
                        </p>
                    </footer>
                </main>
            </div>
        </>
    );
}
