<?php

namespace App\GraphQL\Mutations;

use App\Models\MessageReaction;
use Aws\Kms\KmsClient;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use App\GraphQL\Queries\MessageReactionQuery;

class MessageReactionMutation
{

    public function addMessageReaction($root, array $args)
    {
        $reaction = new MessageReaction();
        $kmsClient = new KmsClient([
            'version' => 'latest',
            'region'  => Config::get('services.aws.region'),
            'credentials' => [
                'key'    => Config::get('services.aws.key'),
                'secret' => Config::get('services.aws.secret'),
            ],
        ]);

        $keyId = "";
        if(strlen($args['newReaction']['sessionKeyId'])==0) {
            try {
                $result = $client->createKey([
                    'KeyUsage'    => 'ENCRYPT_DECRYPT',
                    'Origin'      => 'AWS_KMS'
                ]);
            
                $keyId = $result['KeyMetadata']['KeyId'];
            } catch (\Exception $e) {
                echo 'Error creating KMS key: ' . $e->getMessage();
                return "FAILED";
            }
        }
        else {
            $keyId = $args['newReaction']['sessionKeyId'];
        }
        
        $reaction->convoId = $args['newReaction']['convoId'];
        $reaction->messageId = $args['newReaction']['messageId'];
        $reaction->username = self::encryptData($kmsClient, $args['newReaction']['username'], $keyId);
        $reaction->fullName = self::encryptData($kmsClient, $args['newReaction']['fullName'], $keyId);
        $reaction->reaction = self::encryptData($kmsClient, $args['newReaction']['reaction'], $keyId);
        $reaction->save();

        return $keyId;
    }

    public function removeMessageReaction($root, array $args)
    {
        $kmsClient = new KmsClient([
            'version' => 'latest',
            'region'  => Config::get('services.aws.region'),
            'credentials' => [
                'key'    => Config::get('services.aws.key'),
                'secret' => Config::get('services.aws.secret'),
            ],
        ]);

        $query = MessageReaction::query();
        $messageReactions = $query->get();
        foreach ($messageReactions as $messageReaction) {
            if($messageReaction->messageId === $args['reactionToRemove']['messageId']) {
                $decryptedUsername = MessageReactionQuery::decryptData($kmsClient, $messageReaction->username);
                $decryptedReaction = MessageReactionQuery::decryptData($kmsClient, $messageReaction->reaction);
                if($decryptedUsername===$args['reactionToRemove']['username'] && $decryptedReaction===$args['reactionToRemove']['reaction']) {
                    MessageReaction::where('messageId', $messageReaction->messageId)
                    ->where('username', $messageReaction->username)
                    ->where('reaction', $messageReaction->reaction)
                    ->delete();
                    break;
                }
            }
        }

        return true;

    }

    public static function encryptData($kmsClient, $data, $sessionKeyId)
    {
        try {
            $result = $kmsClient->encrypt([
                'KeyId' => $sessionKeyId,
                'Plaintext' => $data,
            ]);

            return base64_encode($result['CiphertextBlob']);
        } catch (\Exception $e) {
            Log::error('KMS Encryption failed: ' . $e->getMessage());
            return null;
        }
    }

}