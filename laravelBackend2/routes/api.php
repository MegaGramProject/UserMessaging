<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageReactionController;
use App\Http\Middleware\CustomCorsMiddleware;



Route::middleware([CustomCorsMiddleware::class])->group(function () {
    Route::get('/getAllMessageReactions', [MessageReactionController::class, 'index']);
});