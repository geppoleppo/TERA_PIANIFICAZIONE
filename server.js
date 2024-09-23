const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');  // Importa tutte le funzioni dal modulo database
const mysql = require('mysql');

const app = express();
const port = 4443;

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
    }
});


app.get('/api/sync-commesse', (req, res) => {
    // Modifica la query per selezionare le colonne esistenti
    // Se Colore non esiste nel DB MySQL, puoi assegnare un colore di default
    mysqlConnection.query('SELECT NOME, Descrizione, "#FFFFFF" AS Colore FROM COMMESSE', (err, results) => {
        if (err) {
            console.error('Error fetching commesse from MySQL:', err);
            res.status(500).json({ error: err.message });
        } else {
            try {
                // Aggiornare SQLite con le commesse ottenute da MySQL
                results.forEach(commessa => {
                    db.updateCommesse([commessa]);
                });
                res.json({ message: 'Commesse sincronizzate correttamente da MySQL a SQLite' });
            } catch (error) {
                console.error('Error updating commesse in SQLite:', error);
                res.status(500).json({ error: error.message });
            }
        }
    });
});



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

app.get('/api/collaboratori', (req, res) => {
    try {
        const collaboratori = db.getAllCollaboratori();
        res.json(collaboratori);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/commesse-comuni', (req, res) => {
    const { collaboratoriIds } = req.body;
  
    try {
      const commesseComuni = db.getCommesseComuni(collaboratoriIds);
      res.json(commesseComuni);
    } catch (error) {
      console.error('Errore nel recupero delle commesse comuni:', error);
      res.status(500).json({ error: 'Errore nel recupero delle commesse comuni' });
    }
  });
  



app.get('/api/commesse/collaboratore/:id', (req, res) => {
    const collaboratoreId = req.params.id;
    try {
        const commesse = db.getCommesseByCollaboratore(collaboratoreId);
        res.json(commesse);
    } catch (error) {
        console.error(`Errore nel recupero delle commesse per il collaboratore ${collaboratoreId}:`, error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/commesse', (req, res) => {
    try {
        const commesse = db.getSelectedCommesse();
        res.json(commesse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/eventi', (req, res) => {
    try {
      const eventi = db.getAllEventi().map(evento => ({
        Id: evento.Id,
        Subject: evento.Descrizione || 'Nessun titolo', // Cambia 'Descrizione' in 'Subject'
        Location: 'Nessuna posizione', // Aggiungi un campo Location se necessario
        StartTime: new Date(evento.Inizio).toISOString(), // Converti la data a stringa ISO
        EndTime: new Date(evento.Fine).toISOString(),     // Converti la data a stringa ISO
        CategoryColor: evento.Colore || '#1aaa55', // Usa il colore dal DB o un default
        CollaboratoreId:evento.CollaboratoreId 

      }));
  
      res.json(eventi);
    } catch (error) {
      console.error('Errore nel recupero degli eventi:', error);
      res.status(500).send('Errore nel recupero degli eventi');
    }
  });
  

  
  

app.post('/api/eventi', (req, res) => {
    const { Descrizione, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza } = req.body;
    try {
      const newEvento = db.createEvento({
        Descrizione,
        Inizio,
        Fine,
        CommessaName,
        IncaricatoId,
        Colore,
        Progresso,
        Dipendenza
      });
      res.status(201).json(newEvento);
    } catch (error) {
      res.status(500).json({ error: 'Errore nel salvataggio dell\'evento' });
    }
  });
  

app.put('/api/eventi/:id', (req, res) => {
    try {
        const updatedEvento = db.updateEvento(req.params.id, req.body);
        res.json(updatedEvento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/eventi/:id', (req, res) => {
    try {
        db.deleteEvento(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/update-sqlite', (req, res) => {
    try {
        const { commesse } = req.body;
        db.updateCommesse(commesse);
        res.json({ message: 'Commesse updated in SQLite' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint per associare una commessa a un collaboratore
app.post('/api/associate-commesse-collaboratore', (req, res) => {
    const { collaboratoreId, commesse } = req.body;

    try {
        // Rimuovi tutte le commesse associate al collaboratore
        db.removeAllCommesseFromCollaboratore(collaboratoreId);

        // Associa le nuove commesse al collaboratore
        commesse.forEach(commessa => {
            db.associateCommessaCollaboratore(collaboratoreId, commessa.commessaName, commessa.colore);
        });

        res.status(200).send('Commesse associate correttamente');
    } catch (error) {
        console.error('Errore nell\'associazione delle commesse:', error);
        res.status(500).send('Errore nel salvataggio delle commesse');
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
