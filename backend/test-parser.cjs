const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());

app.post('/', (req, res) => res.json(req.body));
app.use((err, req, res, next) => {
    res.status(400).json({ expose: err.expose, type: err.type, body: err.body });
});

async function run() {
    console.log("=== Testing raw string ===");
    const rawRes = await request(app).post('/').set('Content-Type', 'application/json').send('2e5c29cd-24d0-491b-970c-b1bb6629337d');
    console.log(rawRes.body);

    console.log("=== Testing stringified string ===");
    const stringifiedRes = await request(app).post('/').set('Content-Type', 'application/json').send(JSON.stringify('2e5c29cd-24d0-491b-970c-b1bb6629337d'));
    console.log(stringifiedRes.body);
}

run();
