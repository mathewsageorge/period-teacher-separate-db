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
    subject: String,
}, { collection: 'abel_records' });

const kevinRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
    subject: String,
}, { collection: 'kevin_records' });

const sonuRecordSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: String,
    period: String,
    subject: String,
}, { collection: 'sonu_records' });

// Create separate models based on the schemas
const AbelRecord = mongoose.model('AbelRecord', abelRecordSchema);
const KevinRecord = mongoose.model('KevinRecord', kevinRecordSchema);
const SonuRecord = mongoose.model('SonuRecord', sonuRecordSchema);


// Modify the schema for class counts
const classCountSchema = new mongoose.Schema({
    teacher: String,
    subject: String,
    classCount: { type: Number, default: 0 } // Initialize class count to 0
});

const ClassCount = mongoose.model('ClassCount', classCountSchema);

// Endpoint to start a class
app.post('/start-class', async (req, res) => {
    const { teacher, subject } = req.body;
    try {
        // Find or create the class count document for the teacher and subject
        let classCount = await ClassCount.findOne({ teacher, subject });
        if (!classCount) {
            classCount = new ClassCount({ teacher, subject });
        }

        // Increment the class count and save
        classCount.classCount++;
        await classCount.save();

        res.status(200).send('Class started successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to receive check-in and check-out data
app.post('/record', async (req, res) => {
    const { serialNumber, logData, time, teacher, period,subject } = req.body;
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
            subject,
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
