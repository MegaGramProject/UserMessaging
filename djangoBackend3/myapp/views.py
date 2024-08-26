from rest_framework.decorators import api_view
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from rest_framework.response import Response
from rest_framework import status
from gridfs import GridFS
import base64


uri = "mongodb+srv://rishavry:WINwin1$$$@cluster0.xukeo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['Megagram']
collection = db['userMessagingFileReactions']



@api_view(['POST'])
def addUserMessagingFileReaction(request):
    try:
        data = request.data
        
        required_fields = ['messageId', 'convoId', 'position', 'reaction', 'reactionUsername']
        for field in required_fields:
            if field not in data:
                return Response({"error": f"Missing required field: {field}"}, status=status.HTTP_400_BAD_REQUEST)

        document = {
            'messageId': data['messageId'],
            'convoId': data['convoId'],
            'position': data['position'],
            'reaction': data['reaction'],
            'reactionUsername': data['reactionUsername']
        }

        result = collection.insert_one(document)
        
        return Response({"message": "Document added successfully", "id": str(result.inserted_id)}, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def removeUserMessagingFileReaction(request):
    try:
        data = request.data
        messageId = data.get('messageId')
        username = data.get('username')
        reaction = data.get('reaction')
        position = data.get('position')

        if not all([messageId, username, reaction, position is not None]):
            return Response({"error": "Missing required fields in request data"}, status=status.HTTP_400_BAD_REQUEST)
        
        query = {
            'messageId': messageId,
            'reactionUsername': username,
            'reaction': reaction,
            'position': position
        }

        result = collection.delete_one(query)

        if result.deleted_count == 0:
            return Response({"error": "No document found matching the given criteria"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Document deleted successfully"}, status=status.HTTP_200_OK)
    
    except Exception as e:

        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def getAllMessageFileReactionsForConvo(request, convoId):
    try:
        documents = collection.find({'convoId': convoId})

        response_data = []
        for doc in documents:
            doc['_id'] = str(doc['_id'])
            response_data.append(doc)
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def addFileToReplyTo(request, fileToReplyToId):
    grid_fs = GridFS(db, collection='filesThatHaveBeenRepliedTo')
    convoId = request.data.get('convoId')
    fileToReplyTo = request.FILES.get('fileToReplyTo')

    if convoId is not None and fileToReplyTo is not None:
        file_content = fileToReplyTo.read()
        grid_fs_file = grid_fs.new_file(filename=fileToReplyTo.name, content_type=fileToReplyTo.content_type, metadata={'fileToReplyToId': fileToReplyToId, 'convoId': convoId})
        grid_fs_file.write(file_content)
        grid_fs_file.close()
        return Response({'message': 'success'}, status=status.HTTP_201_CREATED)
    
    return Response({'message': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def getAllFilesThatWereRepliedToInConvo(request, convoId):
    grid_fs = GridFS(db, collection='filesThatHaveBeenRepliedTo')
    assembled_files = {}

    for file in grid_fs.find({'metadata.convoId': convoId}):
        file_buffer = bytearray()

        with grid_fs.get(file._id) as grid_out:
            while True:
                chunk = grid_out.read(4096)
                if not chunk:
                    break
                file_buffer.extend(chunk)

        encoded_content = base64.b64encode(file_buffer)

        assembled_files[file.metadata.get('fileToReplyToId')] = {
            'filename': file.filename,
            'content_type': file.content_type,
            'content': encoded_content
        }

    return Response(assembled_files)


@api_view(['DELETE'])
def removeFileThatWasRepliedTo(request, fileToReplyToId):
    grid_fs = GridFS(db, collection='filesThatHaveBeenRepliedTo')
    files = grid_fs.find({'metadata.fileToReplyToId': fileToReplyToId})

    files_found = False

    for file in files:
        grid_fs.delete(file._id)
        files_found = True

    if not files_found:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'message': 'File successfully deleted'}, status=status.HTTP_200_OK)
