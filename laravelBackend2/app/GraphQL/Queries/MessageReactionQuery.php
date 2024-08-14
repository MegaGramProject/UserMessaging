<?php

namespace App\GraphQL\Queries;

use App\Models\MessageReaction;

class MessageReactionQuery
{

    public function getAllMessageReactions($root, array $args)
    {
        $query = MessageReaction::query();

        if (isset($args['filter'])) {
            $filter = $args['filter'];
            if (isset($filter['convoId'])) {
                $query->where('convoId', $filter['convoId']);
            }
            if (isset($filter['messageId'])) {
                $query->where('messageId', $filter['messageId']);
            }
            if (isset($filter['username'])) {
                $query->where('username', $filter['username']);
            }
        }


        return $query->get();
    }

}
