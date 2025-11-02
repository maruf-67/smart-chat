import { FadeIn } from '@/components/animations/fade-in';
import { UserForm } from '@/components/form/user-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
    title: string;
}

interface Props {
    roles: Role[];
}

export default function AdminUsersCreate({ roles }: Props) {
    const { url } = usePage();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Users',
            href: '/admin/users',
        },
        {
            title: 'Create',
            href: url,
        },
    ];

    const handleSuccess = () => {
        router.get('/admin/users');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <FadeIn>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Create New User
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add a new user to the system with role and
                            permissions
                        </p>
                    </div>
                </FadeIn>

                {/* Form */}
                <UserForm
                    isEdit={false}
                    roles={roles}
                    onSuccess={handleSuccess}
                />
            </div>
        </AppLayout>
    );
}
