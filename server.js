const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database'); // Importa correttamente il database

const mysql = require('mysql');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const mysqlConnection = mysql.createConnection({
    host: '93.49.98.201',
    port: 8085,
    user: 'geppolo',
    password: 'geppolo',
    database: 'gestionale'
});

mysqlConnection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');

        // Sincronizza le commesse dal MySQL al SQLite all'avvio del server
        syncCommesse();
    }
});


const { syncCommesseToSQLite } = require('./database'); // Importa la funzione di sincronizzazione

const syncCommesse = async () => {
    try {
        // Fetch commesse da MySQL
        mysqlConnection.query('SELECT NOME, DESCRIZIONE, COLLABORATORI FROM COMMESSE', (err, results) => {
            if (err) {
                console.error('Error fetching commesse from MySQL:', err);
                return;
            }

            // Prepariamo le commesse per la sincronizzazione
            const commesseToSync = results.map(commessa => ({
                descrizione: commessa.NOME,
                colore: '#000000', // Puoi modificare il colore se necessario
                collaboratori: '', // Lasciamo vuoto per ora
            }));

            // Chiama la funzione per sincronizzare le commesse in SQLite
            syncCommesseToSQLite(commesseToSync);
        });
    } catch (error) {
        console.error('Error syncing commesse:', error);
    }
};

// Sincronizza le commesse all'avvio del server
syncCommesse();








// Endpoint MySQL
app.get('/api/commesse-mysql', (req, res) => {
    mysqlConnection.query('SELECT NOME FROM COMMESSE', (err, results) => {
        if (err) {
            console.error('Error fetching commesse:', err);
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Endpoint per ottenere collaboratori
app.get('/api/collaboratori', (req, res) => {
    try {
        const collaboratori = db.getAllCollaboratori();
        res.json(collaboratori);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint per ottenere commesse
app.get('/api/commesse', (req, res) => {
    try {
        const commesse = db.getSelectedCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint per ottenere eventi
app.get('/api/eventi', (req, res) => {
    try {
        const eventi = db.getAllEventi();
        res.json(eventi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint per creare un evento
app.post('/api/eventi', (req, res) => {
    try {
        const newEvento = db.createEvento(req.body);
        res.json(newEvento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint per aggiornare un evento
app.put('/api/eventi/:id', (req, res) => {
    try {
        const updatedEvento = db.updateEvento(req.params.id, req.body);
        res.json(updatedEvento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint per eliminare un evento
app.delete('/api/eventi/:id', (req, res) => {
    try {
        db.deleteEvento(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint per ottenere una singola commessa basata sul nome della commessa
const { getCommessaByName } = require('./database'); // Importa la funzione dal database.js

app.get('/api/commessa/:commessaName', (req, res) => {
    const { commessaName } = req.params;

    try {
        // Utilizza la funzione definita in database.js per ottenere la commessa
        const commessa = getCommessaByName(commessaName);

        if (!commessa) {
            return res.status(404).json({ error: 'Commessa non trovata' });
        }

        res.json(commessa);
    } catch (error) {
        console.error('Errore durante il recupero della commessa:', error.message);
        res.status(500).json({ error: 'Errore nel recupero della commessa' });
    }
});
 

const { updateCollaboratoriCommessa } = require('./database'); // Importa la funzione dal database.js

app.post('/api/update-commessa', (req, res) => {
    const { commessaName, collaboratori } = req.body;
  
    try {
        // Chiama la funzione nel file database.js per aggiornare i collaboratori
        updateCollaboratoriCommessa(commessaName, collaboratori);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating commessa:', error.message);
        res.status(500).json({ success: false, message: 'Error updating commessa', error: error.message });
    }
});
  

// Endpoint per aggiornare commesse in SQLite
app.post('/api/update-sqlite', (req, res) => {
    const { commesse } = req.body;
  
    try {
        // Aggiorna o inserisce le commesse nel database
        db.updateCommesse(commesse);
        res.json({ success: true, message: 'Commesse updated successfully' });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento delle commesse:', error.message);
        res.status(500).json({ success: false, message: 'Error updating commesse', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
