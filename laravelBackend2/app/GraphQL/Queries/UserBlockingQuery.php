<?php

namespace App\GraphQL\Queries;

use App\Models\UserBlocking;

class UserBlockingQuery
{

    public function getAllUserBlockings($root, array $args)
    {
        $query = UserBlocking::query();

        if (isset($args['filter'])) {
            $filter = $args['filter'];
            if (isset($filter['username'])) {
                $query->where(function($q) use ($filter) {
                    $q->where('blocker', $filter['username'])
                    ->orWhere('blockee', $filter['username']);
                });
            }
            
        }


        return $query->get();
    }

}
