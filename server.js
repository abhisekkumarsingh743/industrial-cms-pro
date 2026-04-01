const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock Data (Since we are bypassing Docker MongoDB for now)
let logs = [{ action: "System Start", user: "Admin", timestamp: new Date() }];
let content = [{ title: "Welcome", body: "Live Server is active.", author: "System" }];

// API Routes
app.get('/api/content', (req, res) => res.json(content));
app.post('/api/content', (req, res) => {
    const entry = { ...req.body, timestamp: new Date() };
    content.push(entry);
    logs.push({ action: "Added Entry", user: entry.author, timestamp: new Date() });
    res.status(201).json(entry);
});

app.get('/api/audit/logs', (req, res) => res.json(logs));

// Serve Frontend (If you build it)
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.listen(PORT, () => {
    console.log(`🚀 Live Server running at http://localhost:${PORT}`);
});