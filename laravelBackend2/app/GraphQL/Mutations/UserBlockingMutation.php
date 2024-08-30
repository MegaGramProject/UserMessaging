<?php

namespace App\GraphQL\Mutations;

use App\Models\UserBlocking;
use App\GraphQL\Mutations\UserFollowingMutation;

class UserBlockingMutation
{

    public function addUserBlocking($root, array $args)
    {
        $userBlocking = new UserBlocking();
        $userBlocking->blocker = $args['newUserBlocking']['blocker'];
        $userBlocking->blockee = $args['newUserBlocking']['blockee'];
        $userBlocking->save();

        UserFollowingMutation::addUserBlocking($args['newUserBlocking']['blocker'], $args['newUserBlocking']['blockee']);

        return true;
    }

    public function removeUserBlocking($root, array $args)
    {
        UserBlocking::where('blocker', $args['userBlockingToRemove']['blocker'])
        ->where('blockee', $args['userBlockingToRemove']['blockee'])
        ->delete();

        return true;

    }

    //doesn't work unfortunately
    public function addUserBlockings($root, array $args) {
        $blockees = $args['newUserBlockings']['blockees'];
        print_r($blockees);
        $blocker = $args['newUserBlockings']['blocker'];
        
        for ($x = 0; $x < count($blockees); $x++) {
            $userBlocking = new UserBlocking();
            $userBlocking->blocker = $blocker;
            $userBlocking->blockee = $blockees[$x];
            echo $blockees[$x];
            $userBlocking->save();
            UserFollowingMutation::addUserBlocking($blocker, $blockees[$x]);
        }
        
        return true;
    }
    
    
}
