const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database'); // Assumendo che database.js sia nella cartella src

const app = express();
const port = 3001; // Puoi scegliere un'altra porta se necessario

app.use(cors());
app.use(bodyParser.json());

// Rotte per i Collaboratori
app.get('/collaboratori', (req, res) => {
    try {
        const collaboratori = db.getAllCollaboratori();
        res.json(collaboratori);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/collaboratori', (req, res) => {
    const { nome, colore, immagine } = req.body;
    try {
        const id = db.addCollaboratore(nome, colore, immagine);
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/collaboratori/:id', (req, res) => {
    const { id } = req.params;
    const { nome, colore, immagine } = req.body;
    try {
        db.updateCollaboratore(id, nome, colore, immagine);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/collaboratori/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.deleteCollaboratore(id);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotte per le Commesse
app.get('/commesse', (req, res) => {
    try {
        const commesse = db.getAllCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/commesse', (req, res) => {
    const { descrizione, colore } = req.body;
    try {
        const id = db.addCommessa(descrizione, colore);
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/commesse/:id', (req, res) => {
    const { id } = req.params;
    const { descrizione, colore } = req.body;
    try {
        db.updateCommessa(id, descrizione, colore);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/commesse/:id', (req, res) => {
    const { id } = req.params;
    try {
        db.deleteCommessa(id);
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Route per aggiungere un nuovo evento
app.post('/eventi', (req, res) => {
    const { subject, startTime, endTime, isAllDay, commessaId, color } = req.body;
    console.log("POST request to add event received:", req.body);
    try {
        const eventId = db.addEvento(subject, startTime, endTime, isAllDay, commessaId, color);
        console.log("Event added, responding with ID:", eventId);
        res.json({ id: eventId });
    } catch (error) {
        console.error("Failed to add event:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route per aggiornare un evento esistente
app.put('/eventi/:id', (req, res) => {
    const { id } = req.params;
    const { subject, startTime, endTime, isAllDay, commessaId, color } = req.body;
    console.log("PUT request to update event received:", {id, ...req.body});
    try {
        db.updateEvento(id, subject, startTime, endTime, isAllDay, commessaId, color);
        console.log("Event updated:", id);
        res.sendStatus(200);
    } catch (error) {
        console.error("Failed to update event:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route per eliminare un evento
app.delete('/eventi/:id', (req, res) => {
    const { id } = req.params;
    console.log("DELETE request for event ID:", id);
    try {
        db.deleteEvento(id);
        console.log("Event deleted:", id);
        res.sendStatus(200);
    } catch (error) {
        console.error("Failed to delete event:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route per ottenere i dati dello scheduler
app.get('/Eventi', (req, res) => {
    try {
        console.log("Fetching scheduler data...");
        const eventData = db.getAllEvents(); // Assumi che questa funzione esista in database.js
        console.log("Scheduler data retrieved:", eventData);
        res.json(eventData);
    } catch (error) {
        console.error("Error retrieving scheduler data:", error);
        res.status(500).json({ error: "Errore nel recupero dei dati degli eventi" });
    }
});


