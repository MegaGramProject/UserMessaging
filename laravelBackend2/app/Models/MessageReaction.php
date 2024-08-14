<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageReaction extends Model
{
    protected $table = 'messageReactions';

    protected $fillable = [
        'convoId',
        'messageId',
        'username',
        'fullName',
        'reaction'
    ];

    public $timestamps = false;
}
