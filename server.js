const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors({ origin: "*" }));

const port = process.env.PORT || 3000;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://mathewsgeorge202:ansu@cluster0.ylyaonw.mongodb.net/hai', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected successfully");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Create separate schemas for each teacher's collection
const abelRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
}, { collection: 'abel_records' });

const kevinRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
}, { collection: 'kevin_records' });

const sonuRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
}, { collection: 'sonu_records' });

// Create separate models based on the schemas
const AbelRecord = mongoose.model('AbelRecord', abelRecordSchema);
const KevinRecord = mongoose.model('KevinRecord', kevinRecordSchema);
const SonuRecord = mongoose.model('SonuRecord', sonuRecordSchema);

// Endpoint to receive check-in and check-out data
app.post('/record', async (req, res) => {
    const { serialNumber, logData, time, teacher, period } = req.body;
    try {
        let recordModel;

        // Determine which teacher was selected and choose the appropriate model
        switch (teacher.toUpperCase()) {
            case 'ABEL':
                recordModel = AbelRecord;
                break;
            case 'KEVIN':
                recordModel = KevinRecord;
                break;
            case 'SONU':
                recordModel = SonuRecord;
                break;
            default:
                recordModel = null;
        }

        if (!recordModel) {
            return res.status(400).send('Invalid Teacher');
        }

        // Save the record to the appropriate MongoDB collection
        const record = new recordModel({
            serialNumber,
            logData,
            time,
            period,
        });
        await record.save();

        res.status(201).send('Record saved successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
