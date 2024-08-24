<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBlocking extends Model
{
    protected $table = 'blockedusernames';

    protected $connection = 'pgsql';

    protected $fillable = [
        'blocker',
        'blockee',
    ];

    public $timestamps = false;

    public $incrementing = false;
}
