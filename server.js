const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');  // Importa tutte le funzioni dal modulo database
const mysql = require('mysql');
const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt'),
    rejectUnauthorized: false // Disabilita la verifica del certificato SSL
  };
  
const app = express();
const port = 3004;

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
      //console.log("collaboratori:",collaboratori)

      // Mappiamo i dati nel formato richiesto
      const formattedCollaboratori = collaboratori.map((collaboratore) => ({
          resourceId: collaboratore.Id, // Presumo che "id" sia il campo dell'ID
          resourceName: collaboratore.Nome || "Unnamed", // Nome del collaboratore
          unit: collaboratore.unit || 100, // Default al 100% di capacità
          resourceGroup: collaboratore.resourceGroup || "Default Group", // Default se manca il gruppo
      }));

      res.json(formattedCollaboratori);
  } catch (error) {
      console.error("Errore durante il recupero dei collaboratori:", error);
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
        // Recupera tutti gli eventi
        const lista_eventi = db.getAllEventi();

        // Recupera tutti i collaboratori per mappare ID -> Nome
        const collaboratori = db.getAllCollaboratori();
        const collaboratoriMap = {}; // Mappa { id: { resourceId, resourceName, unit, resourceGroup } }
        
        collaboratori.forEach(collab => {
            collaboratoriMap[collab.Id] = {
                resourceId: collab.Id,
                resourceName: collab.Nome || "Unnamed",
                unit: 100, // Default unit
                resourceGroup: "Default Group"
            };
        });

        // Trasforma gli eventi per includere `resourceInfo` nel formato corretto
        const eventi = lista_eventi.map(evento => {
            let resourceInfo = [];
            let ids=[]
       
            if (evento.IncaricatoId) {
                // Se ci sono più incaricati, separali e mappa i nomi
                ids = evento.IncaricatoId.split(',').map(id => id.trim()).map(Number);
                resourceInfo = ids.map(id => collaboratoriMap[id] || { resourceId: id, resourceName: "Unknown", unit: 100, resourceGroup: "Unknown" });
            }
            console.log("ids:", ids);
            return {
                Id: evento.Id,
                Subject: evento.Descrizione || 'Nessun titolo',
                StartTime: new Date(evento.Inizio).toISOString(),
                EndTime: new Date(evento.Fine).toISOString(),
                Duration: evento.Durata || null,
                Predecessors: evento.Dipendenza || '',
                Progress: evento.Progresso || 0,
                resources: ids, // 👈 Ora è nel formato corretto!
                parentID: evento.ParentID || null,
                CategoryColor: evento.Colore || '#1aaa55',
                CommessaName: evento.CommessaName,
                info: evento.info,
            };
        });

        console.log("Eventi formattati:", eventi);
        res.json(eventi);
    } catch (error) {
        console.error('Errore nel recupero degli eventi:', error);
        res.status(500).send('Errore nel recupero degli eventi');
    }
});


   

app.post('/api/eventi', (req, res) => {
console.log("creare evento",req.body.taskData)

    const { Subject, StartTime, EndTime, CommessaName, resources, Progress, Predecessors ,parentID,info,Id} = req.body.taskData;
    try {
      const newEvento = db.createEvento({
        Subject,
        StartTime,
        EndTime,
        CommessaName,
        resources,
        Progress,
        Predecessors,
        parentID,
        info,
        Id
      });
      res.status(201).json(newEvento);
    } catch (error) {
      res.status(500).json({ error: 'Errore nel salvataggio dell\'evento' });
    }
  });
  

  app.put('/api/eventi/:id', async (req, res) => {
    try {
        console.log('📩 Richiesta ricevuta per aggiornamento evento:', req.params.id);
        console.log('📊 Dati ricevuti:', req.body);

        // Verifica che il parentID sia un valore valido
        if (!req.body || req.body.parentID === undefined) {
            return res.status(400).json({ error: 'parentID mancante nella richiesta' });
        }

        // Esegui l'aggiornamento nel database
        const updatedEvento = await db.updateEvento(req.params.id, req.body);

        if (!updatedEvento) {
            return res.status(404).json({ error: 'Evento non trovato' });
        }

        res.json({ message: 'Evento aggiornato con successo', updatedEvento });
    } catch (error) {
        console.error("❌ Errore nell'aggiornamento dell'evento:", error);
        res.status(500).json({ error: 'Errore interno del server' });
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


const http = require('http');

// Configura il server HTTP
http.createServer(app).listen(3003, () => {
  console.log('Server HTTP in esecuzione su http://localhost:3003');
});

// Configura il server HTTPS
https.createServer(options, app).listen(3004, () => {
    console.log('Server HTTPS in esecuzione su https://localhost:3004');
});
  
