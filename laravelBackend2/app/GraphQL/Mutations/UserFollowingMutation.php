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

    public static function addUserBlocking(string $user1, string $user2) {
        UserFollowing::where('follower', $user1)
        ->where('followee', $user2)
        ->delete();

        UserFollowing::where('follower', $user2)
        ->where('followee', $user1)
        ->delete();

        return true;
    }
}
