<?php


use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UserMessagingFilesController;


Route::post('/sendFilesWithMessage', [UserMessagingFilesController::class, 'sendFilesWithMessage']);
Route::delete('/deleteSingleFileFromMessage/{filePosition}', [UserMessagingFilesController::class, 'deleteSingleFileFromMessage']);
Route::delete('/deleteFilesWithMessage', [UserMessagingFilesController::class, 'deleteFilesWithMessage']);
Route::get('/getAllFilesForConvo/{convoId}', [UserMessagingFilesController::class, 'getAllFilesForConvo']);
