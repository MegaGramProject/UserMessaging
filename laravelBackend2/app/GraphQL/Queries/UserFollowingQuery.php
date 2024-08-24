<?php

namespace App\GraphQL\Queries;

use App\Models\UserFollowing;

class UserFollowingQuery
{

    public function getAllUserFollowings($root, array $args)
    {
        $query = UserFollowing::query();

        if (isset($args['filter'])) {
            $filter = $args['filter'];
            if (isset($filter['username'])) {
                $query->where(function($q) use ($filter) {
                    $q->where('follower', $filter['username'])
                    ->orWhere('followee', $filter['username']);
                });
            }
            
        }

        return $query->get();
    }

}
