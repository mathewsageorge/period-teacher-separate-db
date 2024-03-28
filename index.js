const $status = document.getElementById("status");
const $log = document.getElementById("log");
const $teacher = document.getElementById("teacher");
const $period = document.getElementById("period");
const $subject = document.getElementById("subject");
const $recordInfo = document.getElementById("record-info");

const currentTime = () => {
    return new Date().toString().slice(0, -31);
};

let currentStatus = "in";

const handleNewRecord = async (serialNumber, logData, time, teacher, period, subject) => {
    try {
        await fetch('https://period-teacher-separate-db.onrender.com/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serialNumber,
                logData,
                time,
                teacher,
                period,
                subject,
            }),
        });
        updateRecordInfo(serialNumber, logData, time, teacher, period, subject);
    } catch (error) {
        console.error('Failed to save record on the server:', error);
        alert('Failed to save record on the server.');
    }
};

if (!window.NDEFReader) {
    $status.innerHTML = "<h4>NFC Unsupported!</h4>";
}

const activateNFC = () => {
    const ndef = new NDEFReader();

    ndef.scan()
        .then(() => {
            $status.innerHTML = "<h4>Bring an NFC tag towards the back of your phone...</h4>";
        })
        .catch((err) => {
            console.log("Scan Error:", err);
            alert(err);
        });

    ndef.onreadingerror = (e) => {
        $status.innerHTML = "<h4>Read Error</h4>" + currentTime();
        console.log(e);
    };

    ndef.onreading = async(e) => {
        const time = currentTime();
        const { serialNumber } = e;
        const teacher = $teacher.value;
        const period = $period.value;
        const subject = $subject.value;
        $status.innerHTML = `<h4>Last Read</h4>${serialNumber}<br>${currentTime()}`;
        await handleNewRecord(serialNumber, currentStatus, time, teacher, period, subject);
        console.log(e);
    };
};

const updateRecordInfo = (serialNumber, logData, time, teacher, period, subject) => {
    $recordInfo.innerHTML = `
        <h4>Record Information:</h4>
        <p>Serial Number: ${serialNumber}</p>
        <p>Log Data: ${logData}</p>
        <p>Time: ${time}</p>
        <p>Teacher: ${teacher}</p>
        <p>Period: ${period}</p>
        <p>Subject: ${subject}</p>
    `;
};

document.getElementById("start-btn").onclick = (e) => {
    activateNFC();
};

document.getElementById("check-in").onchange = (e) => {
    e.target.checked && (currentStatus = "in");
};

document.getElementById("check-out").onchange = (e) => {
    e.target.checked && (currentStatus = "out");
};

$subject.addEventListener("change", (e) => {
    updateRecordInfo(
        "", 
        currentStatus,
        currentTime(),
        $teacher.value,
        $period.value,
        e.target.value
    );
});

// Add an event listener to the "Start Class" button
document.getElementById('start-class-btn').addEventListener('click', async () => {
    const teacher = document.getElementById('teacher').value;
    const subject = document.getElementById('subject').value;

    try {
        const response = await fetch('/start-class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teacher, subject })
        });

        if (response.ok) {
            alert('Class started successfully');
        } else {
            alert('Failed to start class');
        }
    } catch (error) {
        console.error('Error starting class:', error);
        alert('Error starting class');
    }
});
