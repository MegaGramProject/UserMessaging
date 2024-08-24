<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserFollowing extends Model
{
    protected $table = 'userfollowings';

    protected $connection = 'pgsql';

    protected $fillable = [
        'follower',
        'followee',
    ];

    public $timestamps = false;

    public $incrementing = false;
}
