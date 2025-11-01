import { FadeIn } from '@/components/animations/fade-in';
import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    user_type: 'admin' | 'agent' | 'user';
    status: 'active' | 'inactive';
    role?: {
        id: number;
        name: string;
        description: string | null;
    } | null;
    role_id?: number | null;
    created_at: string;
    updated_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersData {
    data: User[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

interface Filters {
    search?: string;
    user_type?: string;
    sort_by?: string;
}

interface Props {
    users?: UsersData;
    filters?: Filters;
}

export default function AdminUsersIndex({ users, filters = {} }: Props) {
    const { url } = usePage();
    const [search, setSearch] = useState(filters?.search || '');
    const [userType, setUserType] = useState(filters?.user_type || 'all');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Users',
            href: url,
        },
    ];

    // Debounced filter application with SPA-like behavior
    useEffect(() => {
        const timer = setTimeout(() => {
            router.visit('/admin/users', {
                data: {
                    search: search || undefined,
                    user_type: userType === 'all' ? undefined : userType,
                    sort_by: sortBy,
                },
                only: ['users', 'filters'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, userType, sortBy]);

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/users/${userToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const getUserTypeColor = (
        userType: User['user_type'],
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (userType) {
            case 'admin':
                return 'destructive';
            case 'agent':
                return 'default';
            case 'user':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getStatusColor = (
        status: User['status'],
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        return status === 'active' ? 'default' : 'secondary';
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <FadeIn>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                User Management
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage system users and their access
                            </p>
                        </div>
                        <Link href="/admin/users/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </Link>
                    </div>
                </FadeIn>

                {/* Users Table */}
                <StaggerChildren>
                    <StaggerItem>
                        <Card className="border-border dark:border-border">
                            <CardHeader>
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <CardTitle>
                                        All Users ({users?.meta?.total ?? 0})
                                    </CardTitle>
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Search users..."
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                className="w-full pl-10 md:w-64"
                                            />
                                        </div>
                                        <Select
                                            value={userType}
                                            onValueChange={setUserType}
                                        >
                                            <SelectTrigger className="w-full md:w-32">
                                                <SelectValue placeholder="User Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Types
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    Admins
                                                </SelectItem>
                                                <SelectItem value="agent">
                                                    Agents
                                                </SelectItem>
                                                <SelectItem value="user">
                                                    Users
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={sortBy}
                                            onValueChange={setSortBy}
                                        >
                                            <SelectTrigger className="w-full md:w-32">
                                                <SelectValue placeholder="Sort" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="created_at">
                                                    Newest
                                                </SelectItem>
                                                <SelectItem value="first_name">
                                                    Name
                                                </SelectItem>
                                                <SelectItem value="email">
                                                    Email
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!users || users.data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <p className="text-sm text-muted-foreground">
                                            No users found
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted text-xs text-muted-foreground uppercase">
                                                <tr>
                                                    <th className="px-6 py-3">
                                                        User
                                                    </th>
                                                    <th className="px-6 py-3">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3">
                                                        Created
                                                    </th>
                                                    <th className="px-6 py-3 text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.data.map((user) => (
                                                    <tr
                                                        key={user.id}
                                                        className="border-b border-border bg-background hover:bg-muted/50"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10">
                                                                    {user.image ? (
                                                                        <AvatarImage
                                                                            src={
                                                                                user.image
                                                                            }
                                                                            alt={`${user.first_name} ${user.last_name}`}
                                                                        />
                                                                    ) : null}
                                                                    <AvatarFallback>
                                                                        {getInitials(
                                                                            user.first_name,
                                                                            user.last_name,
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {
                                                                            user.first_name
                                                                        }{' '}
                                                                        {
                                                                            user.last_name
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {user
                                                                            .role
                                                                            ?.name ??
                                                                            '—'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge
                                                                variant={getUserTypeColor(
                                                                    user.user_type,
                                                                )}
                                                            >
                                                                {user.user_type}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge
                                                                variant={getStatusColor(
                                                                    user.status,
                                                                )}
                                                            >
                                                                {user.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {formatDate(
                                                                user.created_at,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link
                                                                    href={`/admin/users/${user.id}/edit`}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        handleDeleteClick(
                                                                            user,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination */}
                                {users && users.meta?.last_page > 1 && (
                                    <div className="mt-6 flex justify-center gap-2">
                                        {users.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.get(link.url, {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }
                                                }}
                                                disabled={
                                                    !link.url || link.active
                                                }
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </StaggerItem>
                </StaggerChildren>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                                {userToDelete?.first_name}{' '}
                                {userToDelete?.last_name}
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
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
