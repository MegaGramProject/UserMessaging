<?php

namespace App\GraphQL\Mutations;

use App\Models\UserFollowing;

class UserFollowingMutation
{

    public function addUserFollowing($root, array $args)
    {
        $userFollowing = new UserFollowing();
        $userFollowing->follower = $args['newUserFollowing']['follower'];
        $userFollowing->followee = $args['newUserFollowing']['followee'];
        $userFollowing->save();

        return true;
    }

    public function removeUserFollowing($root, array $args)
    {
        UserFollowing::where('follower', $args['userFollowingToRemove']['follower'])
        ->where('followee', $args['userFollowingToRemove']['followee'])
        ->delete();

        return true;

    }
}
