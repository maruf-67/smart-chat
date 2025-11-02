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

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    image: string | null;
    user_type: 'admin' | 'agent' | 'user';
    status: number;
    role_id: number;
}

interface Props {
    user: User;
    roles: Role[];
}

export default function AdminUsersEdit({ user, roles }: Props) {
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
            title: `${user.first_name} ${user.last_name}`,
            href: url,
        },
    ];

    const handleSuccess = () => {
        router.get('/admin/users');
    };

    // Prepare initial data for the form
    const initialData = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || '',
        role_id: user.role_id,
        user_type: user.user_type,
        status: user.status === 1,
        image: user.image || null,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User - ${user.first_name} ${user.last_name}`} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <FadeIn>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Edit User
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update user information, role, and permissions
                        </p>
                    </div>
                </FadeIn>

                {/* Form */}
                <UserForm
                    isEdit={true}
                    userId={user.id}
                    initialData={initialData}
                    roles={roles}
                    onSuccess={handleSuccess}
                />
            </div>
        </AppLayout>
    );
}
