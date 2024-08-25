<?php

use Illuminate\Support\Facades\Route;
use App\Models\MessageReaction;
use Illuminate\Http\Request;
use App\Http\Controllers\UserMessagingFilesController;


Route::get('/', function () {
    return view('welcome');
});


Route::get('/getAllMessageReactions', function () {
    $messageReactions = MessageReaction::all();

    return response()->json($messageReactions, 200);
});

