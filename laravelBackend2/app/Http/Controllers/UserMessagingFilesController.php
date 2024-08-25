<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Str;


class UserMessagingFilesController extends Controller
{

    public function sendFilesWithMessage(Request $request) {
        
        $request->validate([
            'messageId' => 'required|string',
            'convoId' => 'required|string',
        ]);

        $messageId = $request->input('messageId');
        $convoId = $request->input('convoId');


        $projectId = 'megagram-428802';
        $bucketName = 'megagram-usermessaging-filessent';
        putenv("GOOGLE_APPLICATION_CREDENTIALS=/Users/rishavr/Downloads/megagram-428802-476264306d3b.json");

    
        $storage = new StorageClient([
            'projectId' => $projectId,
        ]);


        $bucket = $storage->bucket($bucketName);

        foreach ($request->allFiles() as $key => $file) {
            $uniqueFileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $bucket->upload(
                fopen($file->getPathname(), 'r'),
                [
                    'name' => $uniqueFileName,
                    'metadata' => [
                        'metadata' => [
                            'messageId' => $messageId,
                            'convoId' => $convoId,
                            'position'=> (int)$key,
                            'fileName'=>$file->getClientOriginalName()
                        ]
                    ]
                ]
            );

        }

        return response()->json(['message' => 'File(s) uploaded successfully'], 200);
    }


    public function deleteFilesWithMessage(Request $request) {
        $request->validate([
            'messageId' => 'required|string',
        ]);

        $messageId = $request->input('messageId');


        $projectId = 'megagram-428802';
        $bucketName = 'megagram-usermessaging-filessent';
        putenv("GOOGLE_APPLICATION_CREDENTIALS=/Users/rishavr/Downloads/megagram-428802-476264306d3b.json");

    
        $storage = new StorageClient([
            'projectId' => $projectId,
        ]);


        $bucket = $storage->bucket($bucketName);

        $objects = $bucket->objects();

        foreach ($objects as $object) {
            $metadata = $object->info();

            if ($metadata['metadata']['messageId'] === $messageId) {
                $object->delete();
            }
        }

        return response()->json(['message' => 'File(s) deleted successfully'], 200);
    }

    public function getAllFilesForConvo(String $convoId) {

        $projectId = 'megagram-428802';
        $bucketName = 'megagram-usermessaging-filessent';
        putenv("GOOGLE_APPLICATION_CREDENTIALS=/Users/rishavr/Downloads/megagram-428802-476264306d3b.json");

    
        $storage = new StorageClient([
            'projectId' => $projectId,
        ]);


        $bucket = $storage->bucket($bucketName);

        $objects = $bucket->objects();

        $output = [];

        foreach ($objects as $object) {
            $metadata = $object->info();
    
            if ($metadata['metadata']['convoId'] === $convoId) {
                $signedUrl = $object->signedUrl(new \DateTime('1 hour'));

                $output[] = [
                    'fileAsString' => base64_encode($object->downloadAsString()),
                    'messageId' => $metadata['metadata']['messageId'],
                    'position' => $metadata['metadata']['position'],
                    'mimeType' => $metadata['contentType'],
                    'fileName' => $metadata['metadata']['fileName'],
                ];

            }
        }
    
        return response()->json($output, 200);

    }

}
