<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Magpie API Secret Key
    |--------------------------------------------------------------------------
    |
    | Your Magpie secret API key. You can find this in your Magpie Dashboard.
    | This key must start with "sk_" and should be kept secret.
    |
    */

    'secret_key' => env('MAGPIE_SECRET_KEY'),

    /*
    |--------------------------------------------------------------------------
    | API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the Magpie API connection including base URL,
    | API version, and timeout settings.
    |
    */

    'base_url' => env('MAGPIE_BASE_URL', 'https://api.magpie.im'),

    'api_version' => env('MAGPIE_API_VERSION', 'v2'),

    /*
    |--------------------------------------------------------------------------
    | HTTP Client Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the HTTP client used to communicate with the API.
    |
    */

    'timeout' => (int) env('MAGPIE_TIMEOUT', 30),

    'connect_timeout' => (int) env('MAGPIE_CONNECT_TIMEOUT', 10),

    /*
    |--------------------------------------------------------------------------
    | Retry Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for automatic retry of failed requests.
    |
    */

    'max_retries' => (int) env('MAGPIE_MAX_RETRIES', 3),

    'retry_delay' => (int) env('MAGPIE_RETRY_DELAY', 1000), // milliseconds

    /*
    |--------------------------------------------------------------------------
    | Debug Configuration
    |--------------------------------------------------------------------------
    |
    | When debug mode is enabled, detailed request/response information
    | will be logged for troubleshooting purposes.
    |
    */

    'debug' => env('MAGPIE_DEBUG', env('APP_DEBUG', false)),

    /*
    |--------------------------------------------------------------------------
    | SSL Verification
    |--------------------------------------------------------------------------
    |
    | Whether to verify SSL certificates when making API requests.
    | Set to false only for testing with self-signed certificates.
    |
    */

    'verify_ssl' => env('MAGPIE_VERIFY_SSL', true),

    /*
    |--------------------------------------------------------------------------
    | Default Headers
    |--------------------------------------------------------------------------
    |
    | Additional headers to send with every API request.
    |
    */

    'default_headers' => [
        // Add any custom headers here
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for logging API requests and responses.
    |
    */

    'logging' => [
        'enabled' => env('MAGPIE_LOGGING_ENABLED', false),
        'channel' => env('MAGPIE_LOGGING_CHANNEL', 'default'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for handling Magpie webhooks.
    |
    */

    'webhooks' => [
        'secret' => env('MAGPIE_WEBHOOK_SECRET'),
        'tolerance' => (int) env('MAGPIE_WEBHOOK_TOLERANCE', 300), // seconds
    ],

];
