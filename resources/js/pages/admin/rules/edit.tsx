import { FadeIn } from '@/components/animations/fade-in';
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link, usePage } from '@inertiajs/react';

interface AutoReplyRule {
    id: number;
    keyword: string;
    reply_message: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function AdminRulesEdit({ rule }: { rule: AutoReplyRule }) {
    const { url } = usePage();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Auto-Reply Rules',
            href: '/admin/rules',
        },
        {
            title: `Edit: ${rule.keyword}`,
            href: url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Rule: ${rule.keyword}`} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <FadeIn>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Edit Auto-Reply Rule
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update the automated response for "{rule.keyword}"
                        </p>
                    </div>
                </FadeIn>

                {/* Form Card */}
                <Card className="border-border dark:border-border">
                    <CardHeader>
                        <CardTitle>Rule Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={`/admin/rules/${rule.id}?_method=PATCH`}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <StaggerChildren className="space-y-6">
                                    {/* Keyword Field */}
                                    <StaggerItem>
                                        <div className="space-y-2">
                                            <Label htmlFor="keyword">
                                                Keyword{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="keyword"
                                                name="keyword"
                                                type="text"
                                                required
                                                maxLength={100}
                                                defaultValue={rule.keyword}
                                                placeholder="e.g., hello, help, pricing"
                                                disabled={processing}
                                            />
                                            <InputError
                                                message={errors.keyword}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                The keyword that triggers this
                                                auto-reply (case-insensitive)
                                            </p>
                                        </div>
                                    </StaggerItem>

                                    {/* Reply Message Field */}
                                    <StaggerItem>
                                        <div className="space-y-2">
                                            <Label htmlFor="reply_message">
                                                Reply Message{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Textarea
                                                id="reply_message"
                                                name="reply_message"
                                                required
                                                rows={5}
                                                defaultValue={
                                                    rule.reply_message
                                                }
                                                placeholder="Enter the automated response message..."
                                                disabled={processing}
                                                className="resize-none"
                                            />
                                            <InputError
                                                message={errors.reply_message}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                This message will be
                                                automatically sent when the
                                                keyword is detected
                                            </p>
                                        </div>
                                    </StaggerItem>

                                    {/* Active Toggle */}
                                    <StaggerItem>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                name="is_active"
                                                defaultChecked={rule.is_active}
                                                disabled={processing}
                                            />
                                            <Label
                                                htmlFor="is_active"
                                                className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Active (rule is enabled)
                                            </Label>
                                        </div>
                                        <InputError
                                            message={errors.is_active}
                                        />
                                    </StaggerItem>

                                    {/* Action Buttons */}
                                    <StaggerItem>
                                        <div className="flex gap-4">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Updating...'
                                                    : 'Update Rule'}
                                            </Button>
                                            <Link href="/admin/rules">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </Link>
                                        </div>
                                    </StaggerItem>
                                </StaggerChildren>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
