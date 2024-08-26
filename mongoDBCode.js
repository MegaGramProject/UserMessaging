const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://rishavry:WINwin1$$$@cluster0.xukeo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function uploadFile() {
try {
    // Connect to the MongoDB database
    await client.connect();

    // Select the database
    const db = client.db('Megagram'); // Replace 'mydatabase' with your database name

    // Create a GridFS bucket
    const bucket = new GridFSBucket(db, {
    bucketName: 'filesThatHaveBeenForwarded' // Replace with your desired bucket name
    });

    // The file you want to upload
    const filename = '/Users/rishavr/UserMessaging/chicago.jpg'; // Replace with your file path

    // Create a readable stream from the file
    const readStream = fs.createReadStream(filename);

    const metadata = {
        convoId: 'fakeConvoId', // Replace with your convoId
        fileForwardedId: 'fakeFileForwardedId' // Replace with your fileForwardedId
    };

    // Create a writable stream to the GridFS bucket
    const uploadStream = bucket.openUploadStream('chicago.jpg', {
        metadata: metadata
    }); // Specify the file name in GridFS

    // Pipe the file to the bucket
    readStream.pipe(uploadStream);

    // Handle events for when the upload is complete or if there's an error
    uploadStream.on('finish', () => {
    console.log('File uploaded successfully!');
    client.close();
    });

    uploadStream.on('error', (err) => {
    console.error('Error uploading file:', err);
    client.close();
    });
} catch (err) {
    console.error('Error:', err);
    client.close();
}
}

// Call the function to upload the file
uploadFile();