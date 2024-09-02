const WebSocket = require('ws');
const http = require('http');
const sql = require('mssql');

const server = http.createServer();
const port = 8017;

const wss = new WebSocket.Server({ server });

const clients = new Set();

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

//key: username, value: the activity status of key
const activityStatuses = {};

//key: username value: set of connected-clients that have subscribed to updates of the activity status of key
const activityStatusClients = {};

//key: convoId, value: list of usernames typing in that convoId
const isTypings = {};

//key: convoId, value: set of connected-clients that have subscribed to updates of the typing of key
const isTypingClients = {};



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
            if(activityStatuses[username]!==userActivityStatus) {
                for(let client of activityStatusClients[username]) {
                    client.send(JSON.stringify(['update-activity-status', username, userActivityStatus]));
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
            if(!listsAreIdentical(isTypings[convoId], usersTypingInConvo)) {
                for(let client of isTypingClients[convoId]) {
                    client.send(JSON.stringify(['update-is-typing', convoId, usersTypingInConvo]));
                }
                isTypings[convoId] = usersTypingInConvo;
            }
        }
    }
    catch (error) {
        console.log(error);
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

let intervalId = setInterval(updateActivityStatusToClients, 500);
let intervalId2 = setInterval(updateIsTypingToClients, 350);


wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('message', async (event) =>  {
        const messageArray = JSON.parse(event);
        if(messageArray[0] === 'activity-status') {
            const username = messageArray[1];
            if (!(username in activityStatusClients)) {
                activityStatusClients[username] = new Set();
            }
            if (!activityStatusClients[username].has(ws)) {
                activityStatusClients[username].add(ws);
            }


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
            for (let convoId of Object.keys(isTypingClients)) {
                if (isTypingClients[convoId].has(ws)) {
                    isTypingClients[convoId].delete(ws);
                    if (isTypingClients[convoId].size === 0) {
                        delete isTypingClients[convoId];
                        delete isTypings[convoId];
                    }
                }
            }
            const convoId = messageArray[1];
            if (!(convoId in isTypingClients)) {
                isTypingClients[convoId] = new Set();
            }
            if (!isTypingClients[convoId].has(ws)) {
                isTypingClients[convoId].add(ws);
            }

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
    });

    ws.on('close', () => {
        clients.delete(ws);
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
        console.log('Client disconnected');
    });
});



server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});