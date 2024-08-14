<?php

namespace App\GraphQL\Mutations;

use App\Models\MessageReaction;

class MessageReactionMutation
{

    public function addMessageReaction($root, array $args)
    {
        $reaction = new MessageReaction();
        $reaction->convoId = $args['newReaction']['convoId'];
        $reaction->messageId = $args['newReaction']['messageId'];
        $reaction->username = $args['newReaction']['username'];
        $reaction->fullName = $args['newReaction']['fullName'];
        $reaction->reaction = $args['newReaction']['reaction'];
        $reaction->save();

        return true;
    }

    public function removeMessageReaction($root, array $args)
    {
        MessageReaction::where('messageId', $args['reactionToRemove']['messageId'])
        ->where('username', $args['reactionToRemove']['username'])
        ->where('reaction', $args['reactionToRemove']['reaction'])
        ->delete();

        return true;

    }
}
