<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Reverb Server
    |--------------------------------------------------------------------------
    |
    | This option controls the default server that will be used to handle
    | incoming websocket connections. At this time only "reverb" is
    | supported, however keeping this configurable allows future
    | flexibility as additional drivers are introduced.
    |
    */

    'default' => env('REVERB_SERVER', 'reverb'),

    /*
    |--------------------------------------------------------------------------
    | Reverb Servers
    |--------------------------------------------------------------------------
    |
    | Each server definition contains the configuration used when starting
    | the websocket server. Values here should align with the command
    | options supplied to `php artisan reverb:start`.
    |
    */

    'servers' => [

        'reverb' => [
            'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
            'port' => (int) env('REVERB_SERVER_PORT', 8080),
            'path' => env('REVERB_SERVER_PATH', ''),
            'hostname' => env('REVERB_HOST', '127.0.0.1'),
            'options' => [
                'tls' => env('REVERB_TLS_ENABLED', false) ? [
                    'local_cert' => env('REVERB_TLS_CERT'),
                    'local_pk' => env('REVERB_TLS_KEY'),
                    'passphrase' => env('REVERB_TLS_PASSPHRASE'),
                ] : [],
            ],
            'max_request_size' => (int) env('REVERB_MAX_REQUEST_SIZE', 10000),
            'scaling' => [
                'enabled' => env('REVERB_SCALING_ENABLED', false),
                'channel' => env('REVERB_SCALING_CHANNEL', 'reverb'),
                'server' => [
                    'url' => env('REVERB_SCALING_SERVER_URL'),
                    'host' => env('REVERB_SCALING_HOST', '127.0.0.1'),
                    'port' => env('REVERB_SCALING_PORT', '6379'),
                    'username' => env('REVERB_SCALING_USERNAME'),
                    'password' => env('REVERB_SCALING_PASSWORD'),
                    'database' => env('REVERB_SCALING_DATABASE', '0'),
                    'timeout' => env('REVERB_SCALING_TIMEOUT', 60),
                ],
            ],
            'pulse_ingest_interval' => (int) env('REVERB_PULSE_INGEST_INTERVAL', 15),
            'telescope_ingest_interval' => (int) env('REVERB_TELESCOPE_INGEST_INTERVAL', 15),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Reverb Applications
    |--------------------------------------------------------------------------
    |
    | Applications define the credentials that clients will use when
    | authenticating with the websocket server. The "config" provider
    | allows you to manage these credentials in code without requiring
    | direct environment lookups during runtime.
    |
    */

    'apps' => [
        'provider' => 'config',
        'apps' => [
            (function () {
                $extractHost = static function (string $origin): ?string {
                    $origin = trim($origin);

                    if ($origin === '') {
                        return null;
                    }

                    if ($origin === '*') {
                        return '*';
                    }

                    $origin = rtrim($origin, '/');

                    $components = parse_url($origin);

                    $host = $components['host'] ?? null;

                    if ($host === null && isset($components['path'])) {
                        $host = $components['path'];
                    }

                    $host ??= $origin;

                    if (str_contains($host, '/')) {
                        $host = explode('/', $host, 2)[0];
                    }

                    if (str_contains($host, ':')) {
                        $host = explode(':', $host, 2)[0];
                    }

                    $host = strtolower(trim($host));

                    return $host !== '' ? $host : null;
                };

                $origins = array_values(array_filter(
                    array_map('trim', explode(',', env('REVERB_ALLOWED_ORIGINS', '*'))),
                    static fn ($origin) => $origin !== ''
                ));

                if (empty($origins)) {
                    $origins = ['*'];
                }

                if (! in_array('*', $origins, true)) {
                    $defaults = [];

                    $appUrl = env('APP_URL');
                    if ($appUrl) {
                        $defaults[] = $appUrl;

                        $appHost = parse_url($appUrl, PHP_URL_HOST);
                        if ($appHost) {
                            $defaults[] = $appHost;
                        }
                    }

                    $environment = env('APP_ENV', 'production');

                    if (in_array($environment, ['local', 'development'], true)) {
                        $defaults[] = 'localhost';
                        $defaults[] = '127.0.0.1';
                    }

                    $origins = array_merge(
                        $origins,
                        array_filter($defaults, static fn ($value) => $value !== null && $value !== '')
                    );
                }

                if (in_array('*', $origins, true)) {
                    $origins = ['*'];
                } else {
                    $origins = array_values(array_unique(array_filter(
                        array_map($extractHost, $origins),
                        static fn ($origin) => $origin !== null && $origin !== ''
                    )));
                }

                return [
                    'key' => env('REVERB_APP_KEY'),
                    'secret' => env('REVERB_APP_SECRET'),
                    'app_id' => env('REVERB_APP_ID'),
                    'options' => [
                        'host' => env('REVERB_HOST', env('REVERB_SERVER_HOST', '127.0.0.1')),
                        'port' => (int) env('REVERB_PORT', env('REVERB_SERVER_PORT', 8080)),
                        'scheme' => env('REVERB_SCHEME', env('REVERB_SERVER_SCHEME', 'http')),
                        'useTLS' => env('REVERB_SCHEME', env('REVERB_SERVER_SCHEME', 'http')) === 'https',
                    ],
                    'allowed_origins' => $origins,
                    'ping_interval' => (int) env('REVERB_PING_INTERVAL', 60),
                    'activity_timeout' => (int) env('REVERB_ACTIVITY_TIMEOUT', 30),
                    'max_message_size' => (int) env('REVERB_MAX_MESSAGE_SIZE', 10000),
                ];
            })(),
        ],
    ],

];
