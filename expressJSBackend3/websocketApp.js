const WebSocket = require('ws');
const http = require('http');
const sql = require('mssql');
const mysql = require('mysql');
const util = require('util');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
const config = require('./config');

const { accessKey, secretKey } = config.AWS;
const uri = "mongodb+srv://rishavry:WINwin1$$$@cluster0.xukeo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const server = http.createServer();
const port = 8019;

const wss = new WebSocket.Server({ server });

const configForMSSQL = {
    user: 'rishavry',
    password: 'WINwin1$$$',
    server: '35.225.71.255',
    database: 'Megagram',
    options: {
        encrypt: false,
        enableArithAbort: false
    }
};

const connection = mysql.createConnection({
    host: '34.41.180.139',
    user: 'rishavry',
    password: 'WINwin1$$$',
    database: 'Megagram',
    dateStrings: true
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
});

//key: username, value: the activity status of key
const activityStatuses = {};

//key: username value: set of connected-clients that have subscribed to updates of the activity status of key
const activityStatusClients = {};

//key: convoId, value: list of usernames typing in that convoId
const isTypings = {};

//key: convoId, value: set of connected-clients that have subscribed to updates of the typing of key
const isTypingClients = {};

//key: convoId, value: lastMessage as array [lastMessage, dateLastMessageWasSent]
const lastMessages = {};

//key: convoId, value: set of connected-clients that have subcribed to updates of the last messages of key
const lastMessageClients = {};

//key: convoId, value: the convo's hasUnreadMessage field
const hasUnreadMessages = {};

//key: convoId, value: set of connected-clients that have subcribed to updates of the hasUnreadMessage field of key
const hasUnreadMessageClients = {};

//key: convoId, value: convoTitle of key
const convoTitles = {};

//key: convoId, value: set of connected-clients that have subscribed to updates of the convoTitle field of key
const convoTitleClients = {};

//key: convoId, value: set of promoted users of key convo
const promotedUsers = {};

//key: convoId, value: convo-initiator for that username
const convoInitiators = {};

//key: convoId, value: a set of connected-clients that have subscribed to updates of the set of promoted users of key convo
const promotedUserClients = {};

//key: convoId, value: list of messageIds in order of messageSentAt field for key convo
const messages = {};

//key: convoId, value: set of connected-clients that have subscribed to updates of the messages of key convo
const messageClients = {};

//key: convoId, value: a list of two elements, first element being the CHRONOLOGICALLY latest message of convo, and the second being the message's messageSentAt attribute as a Date object
const chronologicallyLatestMessages = {};

//key: convoId, value: set of connected-clients that have subscribed to updates of the CHRONOLOGICALLY latest messages of key convo
const chronologicallyLatestMessageClients = {};

//key: convoId, value: currently active session key id of convo, "" if there is none
const convoSessionKeys = {};

//key: convoId, value: set of connected-clients that have subscribed to updates of the currently active session key of key convo
const convoSessionKeyClients = {};


const updateActivityStatusToClients = async () => {
    try {
        await sql.connect(configForMSSQL);
        let userActivityStatus;
        for (let username of Object.keys(activityStatusClients)) {
            const query = `
                SELECT activityStatus
                FROM userActivityStatuses
                WHERE username = @username
            `;
            const request = new sql.Request();
            request.input('username', sql.NVarChar, username);
            const result = await request.query(query);
            if(result.recordset.length==0) {
                userActivityStatus = 'inactive';
            }
            else {
                userActivityStatus = result.recordset[0]['activityStatus'];
            }
            if((username in activityStatuses) && activityStatuses[username]!==userActivityStatus) {
                if(activityStatusClients[username].size>0) {
                    for(let client of activityStatusClients[username]) {
                        client.send(JSON.stringify(['update-activity-status', username, userActivityStatus]));
                    }
                }
                activityStatuses[username] = userActivityStatus;
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

const updateIsTypingToClients = async () => {
    try {
        await sql.connect(configForMSSQL);
        for (let convoId of Object.keys(isTypingClients)) {
            const query = `
                SELECT username
                FROM usersMessagingIsTyping
                WHERE convoIdOfTyping = @convoId
            `;
            const request = new sql.Request();
            request.input('convoId', sql.NVarChar, convoId);
            const result = await request.query(query);
            const usersTypingInConvo = [];
            for(let record of result.recordset) {
                usersTypingInConvo.push(record['username']);
            }
            if((convoId in isTypings) && !listsAreIdentical(isTypings[convoId], usersTypingInConvo)) {
                if(isTypingClients[convoId].size>0) {
                    for(let client of isTypingClients[convoId]) {
                        client.send(JSON.stringify(['update-is-typing', convoId, usersTypingInConvo]));
                    }
                }
                isTypings[convoId] = usersTypingInConvo;
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Promisify the query method
const query = util.promisify(connection.query).bind(connection);

const updateLastMessageToClients = async () => {
    try {
        for (let convoId of Object.keys(lastMessageClients)) {
            const results = await query('SELECT latestMessage FROM convos WHERE convoId = ?', [convoId]);

            if (results.length > 0) {
                const kmsClient = new KMSClient({
                    credentials: {
                        accessKeyId: accessKey,
                        secretAccessKey: secretKey,
                    },
                    region: 'us-east-1',
                });

                let latestMessage = results[0].latestMessage;

                const ciphertextBlob = Buffer.from(latestMessage, 'base64');
                let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                let decryptResponse = await kmsClient.send(decryptCommand);
                latestMessage = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
        
                latestMessage = JSON.parse(latestMessage);

                if (latestMessage[1].charAt(latestMessage[1].length - 1) !== 'Z') {
                    latestMessage[1] += 'Z';
                }

                if ((convoId in lastMessages) && !listsAreIdentical(lastMessages[convoId], latestMessage)) {
                    for (let client of lastMessageClients[convoId]) {
                        client.send(JSON.stringify(['update-last-message', convoId, latestMessage]));
                    }
                    lastMessages[convoId] = latestMessage;
                }
            } else {
                delete isTypings[convoId];
                delete isTypingClients[convoId];
                delete lastMessages[convoId];
                delete lastMessageClients[convoId];
                delete hasUnreadMessage[convoId];
                delete hasUnreadMessageClients[convoId];
                delete convoTitles[convoId];
                delete convoTitleClients[convoId];
                delete promotedUsers[convoId];
                delete promotedUserClients[convoId];
                delete convoInitiators[convoId];
                delete messageClients[convoId];
                delete messages[convoId];
                delete chronologicallyLatestMessageClients[convoId];
                delete chronologicallyLatestMessages[convoId];
                delete convoSessionKeyClients[convoId];
                delete convoSessionKeys[convoId];
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const updateUnreadMessageToClients = async () => {
    try {
        for (let convoId of Object.keys(lastMessageClients)) {
            const results = await query('SELECT hasUnreadMessage FROM convos WHERE convoId = ?', [convoId]);

            if (results.length > 0) {
                let hasUnreadMessage = results[0].hasUnreadMessage;
                hasUnreadMessage = JSON.parse(hasUnreadMessage);

                if ((convoId in hasUnreadMessages) && !listsAreIdentical(hasUnreadMessages[convoId], hasUnreadMessage)) {
                    for (let client of hasUnreadMessageClients[convoId]) {
                        client.send(JSON.stringify(['update-unread-message', convoId, hasUnreadMessage]));
                    }
                    hasUnreadMessages[convoId] = hasUnreadMessage;
                }
            } else {
                delete isTypings[convoId];
                delete isTypingClients[convoId];
                delete lastMessages[convoId];
                delete lastMessageClients[convoId];
                delete hasUnreadMessage[convoId];
                delete hasUnreadMessageClients[convoId];
                delete convoTitles[convoId];
                delete convoTitleClients[convoId];
                delete promotedUsers[convoId];
                delete promotedUserClients[convoId];
                delete convoInitiators[convoId];
                delete messageClients[convoId];
                delete messages[convoId];
                delete chronologicallyLatestMessageClients[convoId];
                delete chronologicallyLatestMessages[convoId];
                delete convoSessionKeyClients[convoId];
                delete convoSessionKeys[convoId];
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const updateConvoTitleToClients = async () => {
    try {
        for (let convoId of Object.keys(convoTitleClients)) {
            const results = await query('SELECT convoTitle FROM convos WHERE convoId = ?', [convoId]);

            if (results.length > 0) {
                const kmsClient = new KMSClient({
                    credentials: {
                        accessKeyId: accessKey,
                        secretAccessKey: secretKey,
                    },
                    region: 'us-east-1',
                });

                let convoTitle = results[0].convoTitle;
                
                const ciphertextBlob = Buffer.from(convoTitle, 'base64');

                let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                let decryptResponse = await kmsClient.send(decryptCommand);

                convoTitle = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
        

                if ((convoId in convoTitles) && convoTitle!==convoTitles[convoId]) {
                    for (let client of hasUnreadMessageClients[convoId]) {
                        client.send(JSON.stringify(['update-convo-title', convoId, convoTitle]));
                    }
                    convoTitles[convoId] = convoTitle;
                }
            } else {
                delete isTypings[convoId];
                delete isTypingClients[convoId];
                delete lastMessages[convoId];
                delete lastMessageClients[convoId];
                delete hasUnreadMessage[convoId];
                delete hasUnreadMessageClients[convoId];
                delete convoTitles[convoId];
                delete convoTitleClients[convoId];
                delete promotedUsers[convoId];
                delete promotedUserClients[convoId];
                delete convoInitiators[convoId];
                delete messageClients[convoId];
                delete messages[convoId];
                delete chronologicallyLatestMessageClients[convoId];
                delete chronologicallyLatestMessages[convoId];
                delete convoSessionKeyClients[convoId];
                delete convoSessionKeys[convoId];
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const updateConvoInitiatorAndPromotedMembersToClients = async () => {
    try {
        for(let convoId of Object.keys(promotedUserClients)) {
            const results = await query('SELECT convoInitiator, promotedUsers FROM convos WHERE convoId = ?', [convoId]);

            if (results.length > 0) {
                const kmsClient = new KMSClient({
                    credentials: {
                        accessKeyId: accessKey,
                        secretAccessKey: secretKey,
                    },
                    region: 'us-east-1',
                });
                let promotedUsersOfConvo = results[0].promotedUsers;
                let ciphertextBlob = Buffer.from(promotedUsersOfConvo, 'base64');
                let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                let decryptResponse = await kmsClient.send(decryptCommand);
                promotedUsersOfConvo = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
                promotedUsersOfConvo = JSON.parse(promotedUsersOfConvo);

                let convoInitiator = results[0].convoInitiator;
                ciphertextBlob = Buffer.from(convoInitiator, 'base64');
                decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                decryptResponse = await kmsClient.send(decryptCommand);
                convoInitiator = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
                convoInitiator = JSON.parse(convoInitiator);

                promotedUsersOfConvo.push(convoInitiator[0]);
                
                if((convoId in convoInitiators) && (convoInitiators[convoId][0]!==convoInitiator[0] || convoInitiators[convoId][1]!==convoInitiator[1])) {
                    for(let client of promotedUserClients[convoId]) {
                        client.send(JSON.stringify(['update-convo-initator', convoId, convoInitiator]));
                    }
                    convoInitiators[convoId] = convoInitiator;
                }

                if((convoId in promotedUsers) && !listsAreIdentical(promotedUsers[convoId], promotedUsersOfConvo)) {
                    for(let client of promotedUserClients[convoId]) {
                        client.send(JSON.stringify(['update-promoted-users', convoId, promotedUsersOfConvo]));
                    }
                    promotedUsers[convoId] = promotedUsersOfConvo;
                }
    
            } else {
                delete isTypings[convoId];
                delete isTypingClients[convoId];
                delete lastMessages[convoId];
                delete lastMessageClients[convoId];
                delete hasUnreadMessage[convoId];
                delete hasUnreadMessageClients[convoId];
                delete convoTitles[convoId];
                delete convoTitleClients[convoId];
                delete promotedUsers[convoId];
                delete promotedUserClients[convoId];
                delete convoInitiators[convoId];
                delete messageClients[convoId];
                delete messages[convoId];
                delete chronologicallyLatestMessageClients[convoId];
                delete chronologicallyLatestMessages[convoId];
                delete convoSessionKeyClients[convoId];
                delete convoSessionKeys[convoId];
            }

        }
    }
    catch(error) {
        console.log(error);
    }
};

const updateMessagesToClients = async () => {
    try {
        for (let convoId of Object.keys(messageClients)) {
            const results = await query('SELECT * FROM messages WHERE convoId = ? ORDER BY messageSentAt', [convoId]);

            if (results.length > 0) {
                let messageIds = [];
                for(let result of results) {
                    messageIds.push(result.messageId)
                }
                
                if ((convoId in messages) && !listsAreIdentical(messageIds, messages[convoId])) {
                    let messagesOfConvo = [];
                    const kmsClient = new KMSClient({
                        credentials: {
                            accessKeyId: accessKey,
                            secretAccessKey: secretKey,
                        },
                        region: 'us-east-1',
                    });
                    for(let result of results) {
                        ciphertextBlob = Buffer.from(result.message, 'base64');
                        let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        let decryptResponse = await kmsClient.send(decryptCommand);
                        result.message = Buffer.from(decryptResponse.Plaintext).toString('utf-8');

                        ciphertextBlob = Buffer.from(result.sender, 'base64');
                        decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        decryptResponse = await kmsClient.send(decryptCommand);
                        result.sender = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
                    
                        messagesOfConvo.push(result);
                    }
                    for (let client of messageClients[convoId]) {
                        client.send(JSON.stringify(['update-messages', convoId, messagesOfConvo]));
                    }
                    messages[convoId] = messageIds;
                }
            } else {
                delete isTypings[convoId];
                delete isTypingClients[convoId];
                delete lastMessages[convoId];
                delete lastMessageClients[convoId];
                delete hasUnreadMessage[convoId];
                delete hasUnreadMessageClients[convoId];
                delete convoTitles[convoId];
                delete convoTitleClients[convoId];
                delete promotedUsers[convoId];
                delete promotedUserClients[convoId];
                delete convoInitiators[convoId];
                delete messageClients[convoId];
                delete messages[convoId];
                delete chronologicallyLatestMessageClients[convoId];
                delete chronologicallyLatestMessages[convoId];
                delete convoSessionKeyClients[convoId];
                delete convoSessionKeys[convoId];
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }

}

const updateChronologicallyLatestMessageToClients = async() => {
    try {
        for(let convoId of Object.keys(chronologicallyLatestMessageClients)) {
            const results = await query('SELECT sender, message, messageSentAt FROM messages WHERE convoId = ? ORDER BY messageSentAt DESC LIMIT 1', [convoId]);

        if (results.length > 0) {
            const kmsClient = new KMSClient({
                credentials: {
                    accessKeyId: accessKey,
                    secretAccessKey: secretKey,
                },
                region: 'us-east-1',
            });
            let chronologicallyLatestMessage = [];
            ciphertextBlob = Buffer.from(results[0].message, 'base64');
            let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
            let decryptResponse = await kmsClient.send(decryptCommand);
            const decryptedMessage = Buffer.from(decryptResponse.Plaintext).toString('utf-8');

            ciphertextBlob = Buffer.from(results[0].sender, 'base64');
            decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
            decryptResponse = await kmsClient.send(decryptCommand);
            const decryptedSender = Buffer.from(decryptResponse.Plaintext).toString('utf-8');

            chronologicallyLatestMessage.push(JSON.parse(decryptedMessage))
            chronologicallyLatestMessage.push(new Date(results[0].messageSentAt+"Z"));
            chronologicallyLatestMessage.push(decryptedSender);
            if((convoId in chronologicallyLatestMessages) && chronologicallyLatestMessages[convoId][1] < chronologicallyLatestMessage[1]) {
                for (let client of chronologicallyLatestMessageClients[convoId]) {
                    client.send(JSON.stringify(['update-chronologically-latest-message', convoId, [chronologicallyLatestMessage[2], chronologicallyLatestMessage[0] ] ]));
                }
                chronologicallyLatestMessages[convoId] = chronologicallyLatestMessage;
            }

        } else {
            delete isTypings[convoId];
            delete isTypingClients[convoId];
            delete lastMessages[convoId];
            delete lastMessageClients[convoId];
            delete hasUnreadMessage[convoId];
            delete hasUnreadMessageClients[convoId];
            delete convoTitles[convoId];
            delete convoTitleClients[convoId];
            delete promotedUsers[convoId];
            delete promotedUserClients[convoId];
            delete convoInitiators[convoId];
            delete messageClients[convoId];
            delete messages[convoId];
            delete chronologicallyLatestMessageClients[convoId];
            delete chronologicallyLatestMessages[convoId];
            delete convoSessionKeyClients[convoId];
            delete convoSessionKeys[convoId];
        }

    }
    }
    catch(error) {
        console.log(error);
    }
}

const removeInactiveConvoSessionKeys = async () => {
    const mongoDBClient = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    try {
        await sql.connect(configForMSSQL);
        const query = 'SELECT * FROM userActivityStatuses';
        const request = new sql.Request();
        const userActivityStatusesResult = await request.query(query);
        const userActivityStatuses = userActivityStatusesResult.recordset;

        await mongoDBClient.connect();
        const db = mongoDBClient.db('Megagram');
        const collection = db.collection('currentlyActiveSessionKeys');
        const allActiveSessionKeys = await collection.find({}).toArray();
        let filteredUserActivityStatuses;

        let inactiveSessionKeyConvoIds = [];

        allActiveSessionKeys.forEach(activeSessionKey => {
            let setOfMembers = new Set();
            for (let member of activeSessionKey.membersOfConvo) {
                setOfMembers.add(member[0]);
            }
            
            filteredUserActivityStatuses = userActivityStatuses.filter(userActivityStatus =>
                setOfMembers.has(userActivityStatus.username) && userActivityStatus.activityStatus !== 'inactive'
            );


            if (filteredUserActivityStatuses.length == 0) {
                inactiveSessionKeyConvoIds.push(activeSessionKey.convoId);
            }
        });

        if (inactiveSessionKeyConvoIds.length > 0) {
            const filter = { convoId: { $in: inactiveSessionKeyConvoIds } };
            await collection.deleteMany(filter);
        }

    } catch (err) {
        console.error(err);
    }
    finally {
        await mongoDBClient.close();
    }
};

const updateConvoSessionKeysToClients = async () => {
    const mongoDBClient = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    try {
        await mongoDBClient.connect();
        const db = mongoDBClient.db('Megagram');
        const collection = db.collection('currentlyActiveSessionKeys');
        const allActiveSessionKeys = await collection.find({}).toArray();
        let convoSessionKeyId;

        for(let convoId of Object.keys(convoSessionKeyClients)) {
            const activeSessionKeyOfConvo = allActiveSessionKeys.filter(activeSessionKey => activeSessionKey.convoId === convoId);
            if(activeSessionKeyOfConvo.length>0) {
                convoSessionKeyId = activeSessionKeyOfConvo[0].sessionKeyId;
            }
            else {
                convoSessionKeyId = "";
            }
            if((convoId in convoSessionKeys) && convoSessionKeys[convoId] !== convoSessionKeyId) {
                for (let client of convoSessionKeyClients[convoId]) {
                    client.send(JSON.stringify(['update-convo-session-key', convoId, convoSessionKeyId]));
                }
                convoSessionKeys[convoId] = convoSessionKeyId;
            }
        }
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await mongoDBClient.close();
    }
}

function listsAreIdentical(list1, list2) {
    if (list1.length !== list2.length) {
        return false;
    }
    for (let i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) {
            return false;
        }
    }
    return true;
}


let intervalId = setInterval(updateActivityStatusToClients, 450);
let intervalId2 = setInterval(updateIsTypingToClients, 350);
let intervalId3 = setInterval(updateLastMessageToClients, 450);
let intervalId4 = setInterval(updateUnreadMessageToClients, 450);
let intervalId5 = setInterval(updateConvoTitleToClients, 450);
let intervalId6 = setInterval(updateConvoInitiatorAndPromotedMembersToClients, 450);
let intervalId7 = setInterval(updateMessagesToClients, 375);
let intervalId8 = setInterval(updateChronologicallyLatestMessageToClients, 375);
let intervalId9 = setInterval(removeInactiveConvoSessionKeys, 5000);
let intervalId10 = setInterval(updateConvoSessionKeysToClients, 450);



wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (event) =>  {
        const messageArray = JSON.parse(event);
        if(messageArray[0] === 'activity-status') {
            const username = messageArray[1];
            if (!(username in activityStatusClients)) {
                activityStatusClients[username] = new Set();
            }
            activityStatusClients[username].add(ws);


            if (username in activityStatuses) {
                ws.send(JSON.stringify(['get-activity-status', username, activityStatuses[username]]));
            }
            else {
                try {
                    await sql.connect(configForMSSQL);
                    const request = new sql.Request();
                    const query = `
                        SELECT activityStatus
                        FROM userActivityStatuses
                        WHERE username = @username
                    `;
                    request.input('username', sql.NVarChar, username);
                    const result = await request.query(query);
                    if(result.recordset.length==0) {
                        activityStatuses[username] = 'inactive';
                    }
                    else {
                        activityStatuses[username] = result.recordset[0]['activityStatus'];
                    }
                    ws.send(JSON.stringify(['get-activity-status', username, activityStatuses[username]]));

                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        else if(messageArray[0]==='is-typing') {
            const convoId = messageArray[1];
            if (!(convoId in isTypingClients)) {
                isTypingClients[convoId] = new Set();
            }
            isTypingClients[convoId].add(ws);
            

            if (convoId in isTypings) {
                ws.send(JSON.stringify(['get-is-typing', convoId, isTypings[convoId]]));
            }

            else {
                try {
                    await sql.connect(configForMSSQL);
                    const request = new sql.Request();
                    const query = `
                        SELECT username
                        FROM usersMessagingIsTyping
                        WHERE convoIdOfTyping = @convoId
                    `;
                    request.input('convoId', sql.NVarChar, convoId);
                    const result = await request.query(query);
                    const usernamesTypingInThisConvo = [];
                    for(let record of result.recordset) {
                        usernamesTypingInThisConvo.push(record['username']);
                    }
                    isTypings[convoId] = usernamesTypingInThisConvo
                    ws.send(JSON.stringify(['get-is-typing', convoId, isTypings[convoId]]));

                }
                catch (err) {
                    console.log(err);
                }

            }

        }
        else if(messageArray[0] === 'last-message-and-has-unread-message') {
            const convoId = messageArray[1];
            if (!(convoId in lastMessageClients)) {
                lastMessageClients[convoId] = new Set();
            }
            lastMessageClients[convoId].add(ws);

            if (!(convoId in hasUnreadMessageClients)) {
                hasUnreadMessageClients[convoId] = new Set();
            }
            hasUnreadMessageClients[convoId].add(ws);

            if (convoId in lastMessages) {
                //client need not be sent anything here
            }
            else {
                try {
                    const results = await query('SELECT latestMessage FROM convos WHERE convoId = ?', [convoId]);
    
                    if (results.length > 0) {
                        const kmsClient = new KMSClient({
                            credentials: {
                                accessKeyId: accessKey,
                                secretAccessKey: secretKey,
                            },
                            region: 'us-east-1',
                        });
                        let latestMessage = results[0].latestMessage;

                        const ciphertextBlob = Buffer.from(latestMessage, 'base64');
                        let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        let decryptResponse = await kmsClient.send(decryptCommand);
                        latestMessage = Buffer.from(decryptResponse.Plaintext).toString('utf-8');

                        latestMessage = JSON.parse(latestMessage);
        
                        if (latestMessage[1].charAt(latestMessage[1].length - 1) !== 'Z') {
                            latestMessage[1] += 'Z';
                        }
        
                        lastMessages[convoId] = latestMessage;
                    } else {
                        delete isTypings[convoId];
                        delete isTypingClients[convoId];
                        delete lastMessages[convoId];
                        delete lastMessageClients[convoId];
                        delete hasUnreadMessage[convoId];
                        delete hasUnreadMessageClients[convoId];
                        delete convoTitles[convoId];
                        delete convoTitleClients[convoId];
                        delete promotedUsers[convoId];
                        delete promotedUserClients[convoId];
                        delete convoInitiators[convoId];
                        delete messageClients[convoId];
                        delete messages[convoId];
                        delete chronologicallyLatestMessageClients[convoId];
                        delete chronologicallyLatestMessages[convoId];
                        delete convoSessionKeyClients[convoId];
                        delete convoSessionKeys[convoId];
                    }
                }
                catch(error) {
                    console.log(error);
                }
                
            }

            if(convoId in hasUnreadMessages) {
                 //client need not be sent anything here
            }

            else {
                try {
                    const results = await query('SELECT hasUnreadMessage FROM convos WHERE convoId = ?', [convoId]);
    
                    if (results.length > 0) {
                        let hasUnreadMessage = results[0].hasUnreadMessage;
                        hasUnreadMessage = JSON.parse(hasUnreadMessage);
        
                        hasUnreadMessages[convoId] = hasUnreadMessage;
                    } else {
                        delete isTypings[convoId];
                        delete isTypingClients[convoId];
                        delete lastMessages[convoId];
                        delete lastMessageClients[convoId];
                        delete hasUnreadMessage[convoId];
                        delete hasUnreadMessageClients[convoId];
                        delete convoTitles[convoId];
                        delete convoTitleClients[convoId];
                        delete promotedUsers[convoId];
                        delete promotedUserClients[convoId];
                        delete convoInitiators[convoId];
                        delete messageClients[convoId];
                        delete messages[convoId];
                        delete chronologicallyLatestMessageClients[convoId];
                        delete chronologicallyLatestMessages[convoId];
                        delete convoSessionKeyClients[convoId];
                        delete convoSessionKeys[convoId];
                    }
                }
                catch(error) {
                    console.log(error);
                }
            }
        }

        else if(messageArray[0] === 'convo-title') {
            const convoId = messageArray[1];
            if (!(convoId in convoTitleClients)) {
                convoTitleClients[convoId] = new Set();
            }
            convoTitleClients[convoId].add(ws);

            if(convoId in convoTitles) {
                //client need not be sent anything here
            }
            else {
                try {
                    const results = await query('SELECT convoTitle FROM convos WHERE convoId = ?', [convoId]);
    
                    if (results.length > 0) {
                        const kmsClient = new KMSClient({
                            credentials: {
                                accessKeyId: accessKey,
                                secretAccessKey: secretKey,
                            },
                            region: 'us-east-1',
                        });
                        let convoTitle = results[0].convoTitle;
                        const ciphertextBlob = Buffer.from(convoTitle, 'base64');
                        let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        let decryptResponse = await kmsClient.send(decryptCommand);
                        convoTitle = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
                        convoTitles[convoId] = convoTitle;
                    } else {
                        delete isTypings[convoId];
                        delete isTypingClients[convoId];
                        delete lastMessages[convoId];
                        delete lastMessageClients[convoId];
                        delete hasUnreadMessage[convoId];
                        delete hasUnreadMessageClients[convoId];
                        delete convoTitles[convoId];
                        delete convoTitleClients[convoId];
                        delete promotedUsers[convoId];
                        delete promotedUserClients[convoId];
                        delete convoInitiators[convoId];
                        delete messageClients[convoId];
                        delete messages[convoId];
                        delete chronologicallyLatestMessageClients[convoId];
                        delete chronologicallyLatestMessages[convoId];
                        delete convoSessionKeyClients[convoId];
                        delete convoSessionKeys[convoId];
                    }
                }
                catch(error) {
                    console.log(error);
                }
            }
        }
        else if(messageArray[0]==='promoted-members-of-convo') {
            const convoId = messageArray[1];
            if (!(convoId in promotedUserClients)) {
                promotedUserClients[convoId] = new Set();
            }
            promotedUserClients[convoId].add(ws);

            if(convoId in promotedUsers) {
                //client need not be sent anything here
            }
            else {
                try {
                    const results = await query('SELECT convoInitiator, promotedUsers FROM convos WHERE convoId = ?', [convoId]);
    
                    if (results.length > 0) {
                        const kmsClient = new KMSClient({
                            credentials: {
                                accessKeyId: accessKey,
                                secretAccessKey: secretKey,
                            },
                            region: 'us-east-1',
                        });
                        let promotedUsersOfConvo = results[0].promotedUsers;
                        let ciphertextBlob = Buffer.from(promotedUsersOfConvo, 'base64');
                        let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        let decryptResponse = await kmsClient.send(decryptCommand);
                        promotedUsersOfConvo = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
                        promotedUsersOfConvo = JSON.parse(promotedUsersOfConvo);

                        let convoInitiator = results[0].convoInitiator;
                        ciphertextBlob = Buffer.from(convoInitiator, 'base64');
                        decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        decryptResponse = await kmsClient.send(decryptCommand);
                        convoInitiator = Buffer.from(decryptResponse.Plaintext).toString('utf-8');
                        convoInitiator = JSON.parse(convoInitiator);

                        promotedUsersOfConvo.push(convoInitiator[0]);
                        promotedUsers[convoId] = promotedUsersOfConvo;
                        convoInitiators[convoId] = convoInitiator;
                    } else {
                        delete isTypings[convoId];
                        delete isTypingClients[convoId];
                        delete lastMessages[convoId];
                        delete lastMessageClients[convoId];
                        delete hasUnreadMessage[convoId];
                        delete hasUnreadMessageClients[convoId];
                        delete convoTitles[convoId];
                        delete convoTitleClients[convoId];
                        delete promotedUsers[convoId];
                        delete promotedUserClients[convoId];
                        delete convoInitiators[convoId];
                        delete messageClients[convoId];
                        delete messages[convoId];
                        delete chronologicallyLatestMessageClients[convoId];
                        delete chronologicallyLatestMessages[convoId];
                        delete convoSessionKeyClients[convoId];
                        delete convoSessionKeys[convoId];
                    }
                }
                catch(error) {
                    console.log(error);
                }
            }

        }
        
        else if(messageArray[0] === 'messages') {
            const convoId = messageArray[1];

            if (!(convoId in messageClients)) {
                messageClients[convoId] = new Set();
            }
            messageClients[convoId].add(ws);

            if(convoId in messages) {
                //client need not be sent anything here
            }
            else {
                try {
                    const results = await query('SELECT * from messages WHERE convoId = ? ORDER BY messageSentAt', [convoId]);
    
                    if (results.length > 0) {
                        let messageIds = [];
                        for(let result of results) {
                            messageIds.push(result.messageId)
                        }
                        messages[convoId] = messageIds;
                        
                    } else {
                        delete isTypings[convoId];
                        delete isTypingClients[convoId];
                        delete lastMessages[convoId];
                        delete lastMessageClients[convoId];
                        delete hasUnreadMessage[convoId];
                        delete hasUnreadMessageClients[convoId];
                        delete convoTitles[convoId];
                        delete convoTitleClients[convoId];
                        delete promotedUsers[convoId];
                        delete promotedUserClients[convoId];
                        delete convoInitiators[convoId];
                        delete messageClients[convoId];
                        delete messages[convoId];
                        delete chronologicallyLatestMessageClients[convoId];
                        delete chronologicallyLatestMessages[convoId];
                        delete convoSessionKeyClients[convoId];
                        delete convoSessionKeys[convoId];
                    }
                }
                catch(error) {
                    console.log(error);
                }
            }

        }

        else if(messageArray[0]==='chronologically-latest-message') {
            const convoId = messageArray[1];
            if (!(convoId in chronologicallyLatestMessageClients)) {
                chronologicallyLatestMessageClients[convoId] = new Set();
            }
            chronologicallyLatestMessageClients[convoId].add(ws);

            if(convoId in chronologicallyLatestMessages) {
                //client need not be sent anything here
            }

            else {
                try {
                    const results = await query('SELECT sender, message, messageSentAt FROM messages WHERE convoId = ? ORDER BY messageSentAt DESC LIMIT 1', [convoId]);
                    if (results.length > 0) {
                        const kmsClient = new KMSClient({
                            credentials: {
                                accessKeyId: accessKey,
                                secretAccessKey: secretKey,
                            },
                            region: 'us-east-1',
                        });
                        ciphertextBlob = Buffer.from(results[0].message, 'base64');
                        let decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        let decryptResponse = await kmsClient.send(decryptCommand);
                        const decryptedMessage = Buffer.from(decryptResponse.Plaintext).toString('utf-8');

                        ciphertextBlob = Buffer.from(results[0].sender, 'base64');
                        decryptCommand = new DecryptCommand({ CiphertextBlob: ciphertextBlob });
                        decryptResponse = await kmsClient.send(decryptCommand);
                        const decryptedSender = Buffer.from(decryptResponse.Plaintext).toString('utf-8');

                        let chronologicallyLatestMessage = [];
                        chronologicallyLatestMessage.push(JSON.parse(decryptedMessage))
                        chronologicallyLatestMessage.push(new Date(results[0].messageSentAt+"Z"));
                        chronologicallyLatestMessage.push(decryptedSender);
        
                        chronologicallyLatestMessages[convoId] = chronologicallyLatestMessage;
                    } else {
                        delete isTypings[convoId];
                        delete isTypingClients[convoId];
                        delete lastMessages[convoId];
                        delete lastMessageClients[convoId];
                        delete hasUnreadMessage[convoId];
                        delete hasUnreadMessageClients[convoId];
                        delete convoTitles[convoId];
                        delete convoTitleClients[convoId];
                        delete promotedUsers[convoId];
                        delete promotedUserClients[convoId];
                        delete convoInitiators[convoId];
                        delete messageClients[convoId];
                        delete messages[convoId];
                        delete chronologicallyLatestMessageClients[convoId];
                        delete chronologicallyLatestMessages[convoId];
                        delete convoSessionKeyClients[convoId];
                        delete convoSessionKeys[convoId];
                    }
                }
                catch(error) {
                    console.log(error);
                }
            }

        }
        else if(messageArray[0] === 'convo-session-key') {
            const convoId = messageArray[1];
            if (!(convoId in convoSessionKeyClients)) {
                convoSessionKeyClients[convoId] = new Set();
            }
            convoSessionKeyClients[convoId].add(ws);
            if(convoId in convoSessionKeys) {
                //client need not be sent anything here
            }
            else {
                const mongoDBClient = new MongoClient(uri, {
                    serverApi: {
                        version: ServerApiVersion.v1,
                        strict: true,
                        deprecationErrors: true,
                    }
                });
                try {
                    await mongoDBClient.connect();
                    const db = mongoDBClient.db('Megagram');
                    const collection = db.collection('currentlyActiveSessionKeys');
                    const activeSessionKeyOfConvo = await collection.find({convoId: convoId}).toArray();
                    if(activeSessionKeyOfConvo.length==0) {
                        convoSessionKeys[convoId] = "";
                    }
                    else {
                        convoSessionKeys[convoId] = activeSessionKeyOfConvo[0].sessionKeyId;
                    }
                }
                catch(error) {
                    console.log(error);
                }
                finally {
                    await mongoDBClient.close();
                }
            }
        }
    });

    ws.on('close', () => {
        for (let username of Object.keys(activityStatusClients)) {
            if (activityStatusClients[username].has(ws)) {
                activityStatusClients[username].delete(ws);
                if (activityStatusClients[username].size === 0) {
                    delete activityStatusClients[username];
                    delete activityStatuses[username];
                }
            }
        }
        for (let convoId of Object.keys(isTypingClients)) {
            if (isTypingClients[convoId].has(ws)) {
                isTypingClients[convoId].delete(ws);
                if (isTypingClients[convoId].size === 0) {
                    delete isTypingClients[convoId];
                    delete isTypings[convoId];
                }
            }
        }

        for (let convoId of Object.keys(lastMessageClients)) {
            if (lastMessageClients[convoId].has(ws)) {
                lastMessageClients[convoId].delete(ws);
                if (lastMessageClients[convoId].size === 0) {
                    delete lastMessageClients[convoId];
                    delete lastMessages[convoId];
                }
            }
        }

        for (let convoId of Object.keys(hasUnreadMessageClients)) {
            if (hasUnreadMessageClients[convoId].has(ws)) {
                hasUnreadMessageClients[convoId].delete(ws);
                if (hasUnreadMessageClients[convoId].size === 0) {
                    delete hasUnreadMessageClients[convoId];
                    delete hasUnreadMessages[convoId];
                }
            }
        }

        for (let convoId of Object.keys(convoTitleClients)) {
            if (convoTitleClients[convoId].has(ws)) {
                convoTitleClients[convoId].delete(ws);
                if (convoTitleClients[convoId].size === 0) {
                    delete convoTitleClients[convoId];
                    delete convoTitles[convoId];
                }
            }
        }

        for (let convoId of Object.keys(promotedUserClients)) {
            if (promotedUserClients[convoId].has(ws)) {
                promotedUserClients[convoId].delete(ws);
                if (promotedUserClients[convoId].size === 0) {
                    delete promotedUserClients[convoId];
                    delete promotedUsers[convoId];
                    delete convoInitiators[convoId];
                }
            }
        }

        for (let convoId of Object.keys(messageClients)) {
            if (messageClients[convoId].has(ws)) {
                messageClients[convoId].delete(ws);
                if (messageClients[convoId].size === 0) {
                    delete messageClients[convoId];
                    delete messages[convoId];
                }
            }
        }

        for (let convoId of Object.keys(chronologicallyLatestMessageClients)) {
            if (chronologicallyLatestMessageClients[convoId].has(ws)) {
                chronologicallyLatestMessageClients[convoId].delete(ws);
                if (chronologicallyLatestMessageClients[convoId].size === 0) {
                    delete chronologicallyLatestMessageClients[convoId];
                    delete chronologicallyLatestMessages[convoId];
                }
            }
        }

        for (let convoId of Object.keys(convoSessionKeyClients)) {
            if (convoSessionKeyClients[convoId].has(ws)) {
                convoSessionKeyClients[convoId].delete(ws);
                if (convoSessionKeyClients[convoId].size === 0) {
                    delete convoSessionKeyClients[convoId];
                    delete convoSessionKeys[convoId];
                }
            }
        }

        console.log('Client disconnected');
    });
});



server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});