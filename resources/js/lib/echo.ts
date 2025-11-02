import { configureEcho, echo } from '@laravel/echo-react';

const resolveCsrfToken = (): string | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    if (window.Laravel?.csrfToken) {
        return window.Laravel.csrfToken;
    }

    if (typeof document !== 'undefined') {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? null
        );
    }

    return null;
};

/**
 * Configure Laravel Echo for real-time broadcasting with Reverb.
 * Uses @laravel/echo-react v2 API for automatic configuration.
 *
 * @see https://laravel.com/docs/12.x/broadcasting#client-reverb
 */
if (typeof window !== 'undefined') {
    const key = import.meta.env.VITE_REVERB_APP_KEY as string | undefined;
    const host = import.meta.env.VITE_REVERB_HOST as string | undefined;
    const port = import.meta.env.VITE_REVERB_PORT as string | undefined;
    const scheme =
        (import.meta.env.VITE_REVERB_SCHEME as string | undefined) ?? 'https';

    if (key && host) {
        const csrfToken = resolveCsrfToken();

        configureEcho({
            broadcaster: 'reverb',
            key,
            wsHost: host,
            wsPort: Number(port ?? 80),
            wssPort: Number(port ?? 443),
            forceTLS: scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            csrfToken: csrfToken ?? undefined,
            auth: {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            },
        });

        if (!window.Echo) {
            window.Echo = echo();
        }
    } else {
        console.warn('Reverb environment variables are not fully configured.');
    }
}
