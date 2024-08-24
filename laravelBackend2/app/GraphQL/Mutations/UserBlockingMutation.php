<?php

namespace App\GraphQL\Mutations;

use App\Models\UserBlocking;

class UserBlockingMutation
{

    public function addUserBlocking($root, array $args)
    {
        $userBlocking = new UserBlocking();
        $userBlocking->blocker = $args['newUserBlocking']['blocker'];
        $userBlocking->blockee = $args['newUserBlocking']['blockee'];
        $userBlocking->save();

        return true;
    }

    public function removeUserBlocking($root, array $args)
    {
        UserBlocking::where('blocker', $args['userBlockingToRemove']['blocker'])
        ->where('blockee', $args['userBlockingToRemove']['blockee'])
        ->delete();

        return true;

    }
}
