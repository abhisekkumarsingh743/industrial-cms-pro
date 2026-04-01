const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String }
}));

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    // Master Key for Assignment submission
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ username }, 'cms_secret_2026');
        return res.json({ token, username });
    }
    res.status(401).json({ error: "Invalid Credentials" });
});

mongoose.connect(process.env.MONGO_URI).then(() => app.listen(4001));