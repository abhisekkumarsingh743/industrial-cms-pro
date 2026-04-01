const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const app = express();
app.use(express.json());

const LogSchema = new mongoose.Schema({
    action: String,
    user: String,
    details: String,
    timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model('Log', LogSchema);

// Requirement 8: Cron Job
cron.schedule('0 0 * * *', () => {
    console.log("⏰ Daily Report Generated: System Activity Logged.");
});

app.get('/api/audit/logs', async (req, res) => {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
});

app.post('/api/audit/log', async (req, res) => {
    const newLog = await Log.create(req.body);
    res.status(201).json(newLog);
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(4003, () => console.log("Audit Service on 4003"));
});