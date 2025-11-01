import { FadeIn } from '@/components/animations/fade-in';
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AutoReplyRule {
    id: number;
    keyword: string;
    reply_message: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function AdminRulesIndex({
    rules = [],
}: {
    rules?: AutoReplyRule[];
}) {
    const { url } = usePage();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<AutoReplyRule | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Auto-Reply Rules',
            href: url,
        },
    ];

    const handleDeleteClick = (rule: AutoReplyRule) => {
        setRuleToDelete(rule);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!ruleToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/rules/${ruleToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setRuleToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        return text.length > maxLength
            ? text.substring(0, maxLength) + '...'
            : text;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Auto-Reply Rules" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <FadeIn>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Auto-Reply Rules
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage automated responses for common keywords
                            </p>
                        </div>
                        <Link href="/admin/rules/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Rule
                            </Button>
                        </Link>
                    </div>
                </FadeIn>

                {/* Rules List */}
                <Card className="border-border dark:border-border">
                    <CardHeader>
                        <CardTitle>All Rules ({rules.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rules.length > 0 ? (
                            <StaggerChildren className="space-y-2">
                                {rules.map((rule: AutoReplyRule) => (
                                    <StaggerItem key={rule.id}>
                                        <div className="flex items-start justify-between rounded-lg border border-border bg-background p-4 hover:bg-accent dark:border-border dark:hover:bg-accent/50">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="font-semibold text-foreground">
                                                        {rule.keyword}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            rule.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {rule.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {truncateText(
                                                        rule.reply_message,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="ml-4 flex gap-2">
                                                <Link
                                                    href={`/admin/rules/${rule.id}/edit`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteClick(rule)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </StaggerItem>
                                ))}
                            </StaggerChildren>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="mb-4 text-muted-foreground">
                                    No auto-reply rules found
                                </p>
                                <Link href="/admin/rules/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Rule
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Auto-Reply Rule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the rule for keyword{' '}
                            <span className="font-semibold">
                                "{ruleToDelete?.keyword}"
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Rule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
