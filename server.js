const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

const mongoUrl = 'mongodb+srv://suryathangaraj95:suryathangaraj@2003@cluster0.0cqnti9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; 
const dbName = 'trends';
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/trends', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('trends');

        const trends = await collection.find().sort({ datetime: -1 }).limit(1).toArray();
        res.json(trends[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching trends');
    } finally {
        await client.close();
    }
});

app.get('/fetch-trends', (req, res) => {
    exec('node twitterScraper.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send('Error fetching trends');
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.send('Trends fetched');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
