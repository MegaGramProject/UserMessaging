<?php

return [

    'paths' => ['/graphql'], // Adjust the paths to include your GraphQL endpoint

    'allowed_methods' => ['*'], // Allows all methods (GET, POST, PUT, DELETE, etc.)

    'allowed_origins' => ['http://localhost:8011'], // Allows all origins (e.g., '*', 'https://example.com')

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Allows all headers

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
