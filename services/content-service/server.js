const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Correct Redis Connection
const redisClient = redis.createClient({ url: 'redis://redis:6379' });
redisClient.on('error', err => console.log('Redis Error', err));
redisClient.connect();

// 2. MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/cms_db');

const Content = mongoose.model('Content', new mongoose.Schema({
    title: String, body: String, author: String, createdAt: { type: Date, default: Date.now }
}));

// 3. Functional Route
app.post('/', async (req, res) => {
    try {
        const entry = await Content.create(req.body);
        // Cache notification in Redis
        await redisClient.set(`new_entry:${entry._id}`, entry.title);
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: "Database or Redis failure" });
    }
});

app.get('/', async (req, res) => {
    const data = await Content.find().sort({ createdAt: -1 });
    res.json(data);
});

app.listen(4002, () => console.log('Content Service running on 4002'));