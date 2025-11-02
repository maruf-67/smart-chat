import {
    StaggerChildren,
    StaggerItem,
} from '@/components/animations/stagger-children';
import { InputField, type SelectOption } from '@/components/form/input-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormDataConvertible } from '@inertiajs/core';
import { router, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';

interface Role {
    id: number;
    name: string;
    title: string;
}

interface UserFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role_id: number | string;
    user_type: 'admin' | 'agent' | 'user';
    status: boolean;
    image: File | string | null;
}

export interface UserFormProps {
    isEdit?: boolean;
    userId?: number;
    initialData?: Partial<UserFormData>;
    roles?: Role[];
    onSuccess?: () => void;
}

export function UserForm({
    isEdit = false,
    userId,
    initialData = {},
    roles = [],
    onSuccess,
}: UserFormProps) {
    const {
        data: formData,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        setDefaults,
        transform,
    } = useForm<UserFormData>({
        first_name: initialData.first_name ?? '',
        last_name: initialData.last_name ?? '',
        email: initialData.email ?? '',
        phone: initialData.phone ?? '',
        password: '',
        password_confirmation: '',
        role_id:
            initialData.role_id !== undefined && initialData.role_id !== null
                ? initialData.role_id
                : '',
        user_type: initialData.user_type ?? 'user',
        status:
            initialData.status !== undefined && initialData.status !== null
                ? Boolean(initialData.status)
                : true,
        image: initialData.image ?? null,
    });

    const fieldErrors = errors as Partial<Record<keyof UserFormData, string>>;

    const isAdmin = formData.user_type === 'admin';

    const [showPassword, setShowPassword] = useState(!isEdit);

    useEffect(() => {
        const nextData: UserFormData = {
            first_name: initialData.first_name ?? '',
            last_name: initialData.last_name ?? '',
            email: initialData.email ?? '',
            phone: initialData.phone ?? '',
            password: '',
            password_confirmation: '',
            role_id:
                initialData.role_id !== undefined &&
                initialData.role_id !== null
                    ? initialData.role_id
                    : '',
            user_type: initialData.user_type ?? 'user',
            status:
                initialData.status !== undefined && initialData.status !== null
                    ? Boolean(initialData.status)
                    : true,
            image: initialData.image ?? null,
        };

        setData(nextData);
        setDefaults(nextData);

        startTransition(() => {
            setShowPassword(!isEdit);
        });
    }, [initialData, isEdit, setData, setDefaults]);

    useEffect(() => {
        if (!showPassword && isEdit) {
            setData((current) => ({
                ...current,
                password: '',
                password_confirmation: '',
            }));

            clearErrors();
        }
    }, [showPassword, isEdit, setData, clearErrors]);

    const handleFieldChange = (
        field: keyof UserFormData,
        value: string | number | boolean | File | null,
    ) => {
        const updated: UserFormData = {
            ...formData,
        };

        switch (field) {
            case 'status':
                updated.status = Boolean(value);
                break;
            case 'image':
                updated.image = (value as File | string | null) ?? null;
                break;
            case 'role_id':
                updated.role_id = (
                    value !== null && value !== undefined
                        ? (value as number | string)
                        : ''
                ) as UserFormData['role_id'];
                break;
            case 'user_type': {
                const nextType =
                    value !== null && value !== undefined
                        ? (value as UserFormData['user_type'])
                        : 'user';

                updated.user_type = nextType;

                if (nextType !== 'admin') {
                    updated.role_id = '';
                    clearErrors();
                }

                break;
            }
            case 'first_name':
            case 'last_name':
            case 'email':
            case 'phone':
            case 'password':
            case 'password_confirmation':
                updated[field] = (
                    value !== null && value !== undefined ? String(value) : ''
                ) as never;
                break;
        }

        setData(updated);
    };

    const roleOptions: SelectOption[] = roles.map((role) => ({
        value: role.id,
        label: role.title || role.name,
    }));

    const userTypeOptions: SelectOption[] = [
        { value: 'admin', label: 'Admin' },
        { value: 'agent', label: 'Agent' },
        { value: 'user', label: 'User' },
    ];

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const targetUrl =
            isEdit && userId ? `/admin/users/${userId}` : '/admin/users';

        transform((current) => {
            const payload: Record<string, FormDataConvertible> = {
                ...current,
                status: current.status ? '1' : '0',
            };

            if (!current.image || !(current.image instanceof File)) {
                delete payload.image;
            }

            if (!payload.password) {
                delete payload.password;
            }

            if (!payload.password_confirmation) {
                delete payload.password_confirmation;
            }

            if (current.user_type === 'admin') {
                if (payload.role_id !== undefined && payload.role_id !== null) {
                    payload.role_id = String(payload.role_id);
                }
            } else {
                delete payload.role_id;
            }

            if (isEdit) {
                payload._method = 'put';

                if (!showPassword) {
                    delete payload.password;
                    delete payload.password_confirmation;
                }
            }

            return payload;
        });

        post(targetUrl, {
            forceFormData: true,
            onSuccess: () => {
                setData((current) => {
                    const next = { ...current };

                    if (isEdit && !showPassword) {
                        next.password = '';
                        next.password_confirmation = '';
                    }

                    if (current.user_type !== 'admin') {
                        next.role_id = '';
                    }

                    return next;
                });

                if (formData.user_type !== 'admin') {
                    clearErrors();
                }

                onSuccess?.();
            },
        });
    };

    return (
        <Card className="border-border dark:border-border">
            <CardHeader>
                <CardTitle>
                    {isEdit ? 'Edit User Details' : 'User Information'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <StaggerChildren className="grid gap-6 md:grid-cols-2">
                        {/* First Name */}
                        <StaggerItem>
                            <InputField
                                name="first_name"
                                type="text"
                                label="First Name"
                                value={formData.first_name}
                                onChange={(value) =>
                                    handleFieldChange('first_name', value)
                                }
                                error={fieldErrors.first_name}
                                required
                                placeholder="Enter first name"
                                helpText="User's first name"
                                disabled={processing}
                                maxLength={255}
                            />
                        </StaggerItem>

                        {/* Last Name */}
                        <StaggerItem>
                            <InputField
                                name="last_name"
                                type="text"
                                label="Last Name"
                                value={formData.last_name}
                                onChange={(value) =>
                                    handleFieldChange('last_name', value)
                                }
                                error={fieldErrors.last_name}
                                required
                                placeholder="Enter last name"
                                helpText="User's last name"
                                disabled={processing}
                                maxLength={255}
                            />
                        </StaggerItem>

                        {/* Email */}
                        <StaggerItem>
                            <InputField
                                name="email"
                                type="email"
                                label="Email"
                                value={formData.email}
                                onChange={(value) =>
                                    handleFieldChange('email', value)
                                }
                                error={fieldErrors.email}
                                required
                                placeholder="Enter email address"
                                helpText="User's email for login"
                                disabled={processing}
                            />
                        </StaggerItem>

                        {/* Phone */}
                        <StaggerItem>
                            <InputField
                                name="phone"
                                type="tel"
                                label="Phone"
                                value={formData.phone}
                                onChange={(value) =>
                                    handleFieldChange('phone', value)
                                }
                                error={fieldErrors.phone}
                                placeholder="Enter phone number"
                                helpText="Optional contact number"
                                disabled={processing}
                                maxLength={15}
                            />
                        </StaggerItem>

                        {/* Password Toggle (Edit Mode Only) */}
                        {isEdit && (
                            <StaggerItem className="md:col-span-2">
                                <InputField
                                    name="change_password"
                                    type="checkbox"
                                    label="Change Password"
                                    checkboxLabel="Change user password"
                                    value={showPassword}
                                    onChange={(value) =>
                                        setShowPassword(!!value)
                                    }
                                    disabled={processing}
                                />
                            </StaggerItem>
                        )}

                        {/* Password Fields */}
                        {(!isEdit || showPassword) && (
                            <>
                                <StaggerItem>
                                    <InputField
                                        name="password"
                                        type="password"
                                        label="Password"
                                        value={formData.password}
                                        onChange={(value) =>
                                            handleFieldChange('password', value)
                                        }
                                        error={fieldErrors.password}
                                        required={!isEdit}
                                        placeholder={
                                            isEdit
                                                ? 'Enter new password'
                                                : 'Enter password'
                                        }
                                        helpText="Min 8 characters"
                                        disabled={processing}
                                    />
                                </StaggerItem>

                                <StaggerItem>
                                    <InputField
                                        name="password_confirmation"
                                        type="password"
                                        label="Confirm Password"
                                        value={formData.password_confirmation}
                                        onChange={(value) =>
                                            handleFieldChange(
                                                'password_confirmation',
                                                value,
                                            )
                                        }
                                        error={
                                            fieldErrors.password_confirmation
                                        }
                                        required={!isEdit || showPassword}
                                        placeholder="Confirm password"
                                        helpText="Must match password"
                                        disabled={processing}
                                    />
                                </StaggerItem>
                            </>
                        )}

                        {isAdmin && (
                            <StaggerItem>
                                <InputField
                                    name="role_id"
                                    type="select"
                                    label="Role"
                                    value={formData.role_id}
                                    onChange={(value) =>
                                        handleFieldChange('role_id', value)
                                    }
                                    error={fieldErrors.role_id}
                                    required
                                    placeholder="Select a role"
                                    helpText="Define admin permissions"
                                    options={roleOptions}
                                    disabled={processing}
                                />
                            </StaggerItem>
                        )}

                        {/* User Type */}
                        <StaggerItem>
                            <InputField
                                name="user_type"
                                type="select"
                                label="User Type"
                                value={formData.user_type}
                                onChange={(value) =>
                                    handleFieldChange('user_type', value)
                                }
                                error={fieldErrors.user_type}
                                required
                                placeholder="Select user type"
                                helpText="Admin, Agent, or User"
                                options={userTypeOptions}
                                disabled={processing}
                            />
                        </StaggerItem>

                        {/* Status */}
                        <StaggerItem>
                            <InputField
                                name="status"
                                type="checkbox"
                                label="Status"
                                checkboxLabel="Active"
                                value={formData.status}
                                onChange={(value) =>
                                    handleFieldChange('status', value)
                                }
                                helpText="Enable/disable this account"
                                disabled={processing}
                            />
                        </StaggerItem>

                        {/* Profile Image */}
                        <StaggerItem className="md:col-span-2">
                            <InputField
                                name="image"
                                type="image"
                                label="Profile Picture"
                                value={formData.image}
                                onChange={(value) =>
                                    handleFieldChange('image', value)
                                }
                                error={fieldErrors.image}
                                helpText="Upload profile picture (max 2MB)"
                                accept="image/*"
                                maxSize={2 * 1024 * 1024}
                                disabled={processing}
                            />
                        </StaggerItem>
                    </StaggerChildren>

                    {/* Form Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/admin/users')}
                            disabled={processing}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : isEdit
                                  ? 'Update User'
                                  : 'Create User'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
