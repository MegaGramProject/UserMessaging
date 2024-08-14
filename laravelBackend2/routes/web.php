<?php

use Illuminate\Support\Facades\Route;
use App\Models\MessageReaction;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/getAllMessageReactions', function () {
    $messageReactions = MessageReaction::all();

    return response()->json($messageReactions, 200);
});
