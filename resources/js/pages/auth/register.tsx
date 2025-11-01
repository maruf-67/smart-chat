import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Head } from '@inertiajs/react';

export default function Register() {
    return (
        <AuthLayout
            title="Registration Disabled"
            description="Public registration is currently disabled"
        >
            <Head title="Register" />
            <div className="space-y-4 text-center">
                <p className="text-muted-foreground">
                    Registration is not available at this time. Please contact
                    an administrator if you need an account.
                </p>
                <TextLink href={login()} className="text-primary">
                    Return to Login
                </TextLink>
            </div>
        </AuthLayout>
    );
}
