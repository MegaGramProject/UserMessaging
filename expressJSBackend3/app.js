const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Connection, Request, TYPES } = require('tedious');

const cors = require('cors');

const sql = require('mssql');
const config = {
    server: '35.225.71.255',
    port: 1433,
    authentication: {
        type: 'default',
        options: {
            userName: 'rishavry',
            password: 'WINwin1$$$'
        }
    },
    options: {
        encrypt: false,
        database: 'Megagram'
    }
};

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


const app = express();
app.use(express.json());
const port = 8016;


const corsOptions = {
    origin: 'http://localhost:8011',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


const checkAllTheActiveAndIdleUsers = async () => {
    let connection;
    try {
        await sql.connect(configForMSSQL);

        const query = `
            SELECT username, latestActivityStatusNotification
            FROM userActivityStatuses
            WHERE activityStatus != 'inactive'
        `;

        const result = await sql.query(query);
        const activeOrIdleUsersThatAreNowInactive = [];
        const currentTime = new Date();

        if (result.recordset.length === 0) {
            clearInterval(intervalId);
            isCheckingAllTheActiveAndIdleUsers = false;
            await sql.close();
            return;
        }

        result.recordset.forEach(record => {
            const notificationTime = new Date(record.latestActivityStatusNotification);
            const timeDifferenceInSeconds = (currentTime - notificationTime) / 1000;
            if (timeDifferenceInSeconds > 5) {
                activeOrIdleUsersThatAreNowInactive.push(record.username);
            }
        });

        if(activeOrIdleUsersThatAreNowInactive.length>0) {
            connection = new Connection(config);
            await new Promise((resolve, reject) => {
                connection.on('connect', err => {
                    if (err) {
                        return reject(err);
                    }

                    const request = new Request(
                        `
                        UPDATE userActivityStatuses
                        SET activityStatus = 'inactive'
                        WHERE username IN (${activeOrIdleUsersThatAreNowInactive.map((_, index) => `@username${index}`).join(', ')})
                        `,
                        (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        }
                    );

                    activeOrIdleUsersThatAreNowInactive.forEach((username, index) => {
                        request.addParameter(`username${index}`, TYPES.NVarChar, username);
                    });

                    connection.execSql(request);
                });

                connection.connect();
            });
        }

    } catch (err) {
        console.error('SQL error:', err);
    } finally {
        await sql.close();

        if (connection) {
            connection.close();
        }
    }
};

intervalId = setInterval(checkAllTheActiveAndIdleUsers, 5000);
isCheckingAllTheActiveAndIdleUsers = true;



app.post('/notifyOfActivityStatus/:username', async (req, res) => {
    const connection = new Connection(config);
    try {
        const username = req.params.username;
        const activityStatus = req.body.activityStatus;
        const dateTimeOfNotification = req.body.currDateTime;

        await new Promise((resolve, reject) => {
            connection.on('connect', err => {
                if (err) {
                    return reject(err);
                }

                const request = new Request(
                    `MERGE INTO userActivityStatuses AS target
                    USING (VALUES (@username, @latestActivityStatusNotification, @activityStatus)) AS source (username, latestActivityStatusNotification, activityStatus)
                    ON target.username = source.username
                    WHEN MATCHED THEN
                        UPDATE SET
                            latestActivityStatusNotification = source.latestActivityStatusNotification,
                            activityStatus = source.activityStatus
                    WHEN NOT MATCHED THEN
                        INSERT (username, latestActivityStatusNotification, activityStatus)
                        VALUES (source.username, source.latestActivityStatusNotification, source.activityStatus);`,
                    (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    }
                );

                request.addParameter('username', TYPES.NVarChar, username);
                request.addParameter('latestActivityStatusNotification', TYPES.DateTime, dateTimeOfNotification);
                request.addParameter('activityStatus', TYPES.NVarChar, activityStatus);

                connection.execSql(request);
            });

            connection.connect();
        });
        if(!isCheckingAllTheActiveAndIdleUsers)  {
            isCheckingAllTheActiveAndIdleUsers = true;
            await checkAllTheActiveAndIdleUsers();
            intervalId = setInterval(checkAllTheActiveAndIdleUsers, 5000);
        }
        connection.close();
        res.status(200).json({ output: 'SUCCESS!' });
    } catch (err) {
        if(connection) {
            connection.close();
        }
        res.status(500).json({ output: 'FAILURE!', error: err.message });
    }
});


app.post('/notifyOfUserTyping/:username/:convoId', async (req, res) => {
    const connection = new Connection(config);
    try {
        const username = req.params.username;
        const convoId = req.params.convoId;
        await new Promise((resolve, reject) => {
            connection.on('connect', err => {
                if (err) {
                    return reject(err);
                }

                const request = new Request(
                    `MERGE INTO usersMessagingIsTyping AS target
                    USING (VALUES (@username, @convoIdOfTyping)) AS source (username, convoIdOfTyping)
                    ON target.username = source.username
                    WHEN MATCHED THEN
                        UPDATE SET target.convoIdOfTyping = source.convoIdOfTyping
                    WHEN NOT MATCHED BY TARGET THEN
                        INSERT (username, convoIdOfTyping)
                        VALUES (source.username, source.convoIdOfTyping);`,
                    (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    }
                );

                request.addParameter('username', TYPES.NVarChar, username);
                request.addParameter('convoIdOfTyping', TYPES.NVarChar, convoId === 'null' ? null : convoId);

                connection.execSql(request);
            });

            connection.connect();
        });
        connection.close();
        res.status(200).json({ output: 'SUCCESS!' });

    }

    catch(err) {
        connection.close();
        console.log(err.message);
        res.status(500).json({ output: 'FAILURE!', error: err.message });
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

