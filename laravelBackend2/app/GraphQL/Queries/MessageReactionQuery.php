<?php

namespace App\GraphQL\Queries;

use App\Models\MessageReaction;
use Aws\Kms\KmsClient;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;


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
        }

        $messageReactions = $query->get();
        $output = [];

        $kmsClient = new KmsClient([
            'version' => 'latest',
            'region'  => Config::get('services.aws.region'),
            'credentials' => [
                'key'    => Config::get('services.aws.key'),
                'secret' => Config::get('services.aws.secret'),
            ],
        ]);
        

        foreach ($messageReactions as $messageReaction) {
            $decryptedUsername = self::decryptData($kmsClient, $messageReaction->username);
            $decryptedFullName = self::decryptData($kmsClient, $messageReaction->fullName);
            $decryptedReaction = self::decryptData($kmsClient, $messageReaction->reaction);

            $output[] = new MessageReaction([
                'convoId'   => $messageReaction->convoId,
                'messageId' => $messageReaction->messageId,
                'username'  => $decryptedUsername,
                'fullName'  => $decryptedFullName,
                'reaction'  => $decryptedReaction,
            ]);
        }

        return $output;
    }


    public static function decryptData($kmsClient, $ciphertextBase64)
    {
        try {
            $ciphertextBlob = base64_decode($ciphertextBase64);

            $result = $kmsClient->decrypt([
                'CiphertextBlob' => $ciphertextBlob,
            ]);
            
            $plaintextBinary = $result['Plaintext'];

            return mb_convert_encoding($plaintextBinary, 'UTF-8');
        } catch (\Exception $e) {
            Log::error('Decryption failed: ' . $e->getMessage());
            return null;
        }
    }

}