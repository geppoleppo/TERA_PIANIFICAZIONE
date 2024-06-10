const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/collaboratori', (req, res) => {
    try {
        const collaboratori = db.getAllCollaboratori();
        res.json(collaboratori);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/commesse', (req, res) => {
    try {
        const commesse = db.getAllCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
