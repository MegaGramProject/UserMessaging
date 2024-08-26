<?php

return [

    'paths' => ['/graphql', 'api/sendFilesWithMessage', 'api/getAllFilesForConvo/*', 'api/deleteFilesWithMessage', 'api/deleteSingleFileFromMessage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:8011'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
