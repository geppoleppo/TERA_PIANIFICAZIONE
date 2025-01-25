const express = require('express');
const { getRecords, runQuery } = require('./database');
const cors = require('cors'); // Importa il pacchetto cors
const app = express();
const mysql = require('mysql2');
const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
  rejectUnauthorized: false // Disabilita la verifica del certificato SSL
};


app.use(cors({
  origin: ['http://localhost:3000', 'http://93.49.98.201:666'], // Lista delle origini consentite
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Middleware per leggere JSON dal body


// Funzione per ottenere i collaboratori duplicati in base ai loro groupIds
app.get('/api/collaboratori', async (req, res) => {
  try {
    const { email } = req.query;

    // Logga i parametri della richiesta
    console.log("Richiesta ricevuta per /api/collaboratori con parametri:", { email });

    let query = 'SELECT * FROM Collaboratori';
    let params = [];

    // Se viene fornita un'email, aggiungi un filtro alla query
    if (email) {
      query += ' WHERE Email = ?';
      params.push(email);
    }

    // Logga la query e i parametri
    console.log("Esecuzione della query:", query, "con parametri:", params);

    const collaboratori = await getRecords(query, params);

    // Logga i risultati grezzi
    console.log("Risultati della query:", collaboratori);

    const formattedCollaboratori = collaboratori.map(collaboratore => ({
      Id: collaboratore.Id,
      Nome: collaboratore.Nome,
      Colore: collaboratore.Colore,
      Immagine: collaboratore.Immagine,
      groupIds: collaboratore.groupIds ? collaboratore.groupIds.split(',').map(id => parseInt(id, 10)) : [],
      Email:collaboratore.Email
    }));

    // Logga i risultati formattati
    console.log("Collaboratori formattati:", formattedCollaboratori);

    res.json(formattedCollaboratori);
  } catch (error) {
    console.error("Errore nel recupero dei collaboratori:", error);
    res.status(500).json({ error: "Errore nel recupero dei collaboratori" });
  }
});




app.use(cors()); // Abilita CORS per tutte le richieste
app.use(express.json());



// Aggiorna commesse e colori nel database quando vengono aggiunti ai collaboratori
app.put('/api/collaboratori/:id/aggiungi-commesse', async (req, res) => {
  const { id } = req.params;
  const { commesseIds } = req.body;

  try {
    const collaboratore = await getRecords('SELECT * FROM Collaboratori WHERE Id = ?', [id]);
    if (collaboratore.length === 0) return res.status(404).json({ error: 'Collaboratore non trovato' });

    const groupIds = collaboratore[0].groupIds ? collaboratore[0].groupIds.split(',').map(Number) : [];
    const updatedGroupIds = Array.from(new Set([...groupIds, ...commesseIds.map(commessa => commessa.id)])); // Evita duplicati

    // Aggiorna solo il campo `groupIds` nei collaboratori
    await runQuery('UPDATE Collaboratori SET groupIds = ? WHERE Id = ?', [updatedGroupIds.join(','), id]);

    // Aggiorna il colore della commessa solo nella tabella Commesse
    for (const commessa of commesseIds) {
      await runQuery('UPDATE Commesse SET Colore = ? WHERE Id = ?', [commessa.color, commessa.id]);
    }

    res.json({ message: 'Commesse e colori aggiunti con successo.' });
  } catch (error) {
    console.error("Errore durante l'aggiornamento delle commesse del collaboratore:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento delle commesse del collaboratore." });
  }
});

// Modifica l’endpoint di DELETE
app.delete('/api/eventi/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM Eventi WHERE Id = ?`;

  runQuery(query, [id])
    .then(() => {
      res.status(200).json({ message: 'Evento eliminato con successo.' });
    })
    .catch(err => {
      res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'evento.' });
    });
});
;
    
app.get('/api/eventi', async (req, res) => {
  const userEmail = req.query.email; // Recupera l'email dall'utente corrente

  try {
    // Se l'email non è specificata, restituisci tutti gli eventi
    if (!userEmail) {
      const eventiQuery = 'SELECT * FROM Eventi';
      const eventi = await getRecords(eventiQuery);
      return res.json(eventi);
    }

    // Recupera l'ID del collaboratore corrispondente all'email
    const queryCollaboratore = 'SELECT Id FROM Collaboratori WHERE Email = ?';
    const collaboratore = await getRecords(queryCollaboratore, [userEmail]);

    if (collaboratore.length === 0) {
      return res.status(404).json({ error: 'Collaboratore non trovato.' });
    }

    const collaboratoreId = collaboratore[0].Id;

    // Recupera gli eventi in cui `IncaricatoId` contiene l'ID del collaboratore
    const eventiQuery = 'SELECT * FROM Eventi';
    const eventi = await getRecords(eventiQuery);

    const filteredEventi = eventi.filter((evento) => {
      const incaricatoIds = evento.IncaricatoId
        ? evento.IncaricatoId.split(',').map((id) => parseInt(id.trim(), 10))
        : [];
      return incaricatoIds.includes(collaboratoreId);
    });

    res.json(filteredEventi);
  } catch (error) {
    console.error('Errore durante il recupero degli eventi:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli eventi.' });
  }
});





app.put('/api/eventi/:id', async (req, res) => {
  const {
    Subject,
    StartTime,
    EndTime,
    CommessaId,
    Duration,
    Progress,
    CategoryColor,
    Description,
    parentID,
    ganttProperties,
    info, // Proprietà aggiuntive dal Gantt
  } = req.body;

  try {
    console.log("Dati ricevuti per aggiornamento evento:", req.body);

    // Recupera il nome della commessa dal database usando l'ID
    const commessaQuery = 'SELECT CommessaName FROM Commesse WHERE Id = ?';
    const commessaResult = await getRecords(commessaQuery, [CommessaId]);

    if (commessaResult.length === 0) {
      return res.status(400).json({ error: 'Commessa non trovata' });
    }

    const CommessaName = commessaResult[0].CommessaName;

    // Gestisci il caso in cui resourceInfo sia passato direttamente o tramite taskData
    const resourceInfo = ganttProperties?.resourceInfo || req.body.taskData?.resources || [];

    // Estrarre gli ID e i nomi dei collaboratori
    const collaboratorIds = Array.isArray(resourceInfo)
      ? resourceInfo.map((resource) => resource.resourceId || resource.id)
      : [];

    const IncaricatoName = Array.isArray(resourceInfo)
      ? resourceInfo.map((resource) => resource.resourceName || resource.text).join(', ')
      : '';

    const query = `
      UPDATE Eventi SET
        Titolo = ?, 
        Inizio = ?, 
        Fine = ?, 
        CommessaId = ?, 
        CommessaName = ?, 
        Duration = ?, 
        Progress = ?, 
        IncaricatoId = ?, 
        IncaricatoName = ?, 
        Colore = ?, 
        Descrizione = ?, 
        parentID = ?,
        Info = ?
      WHERE Id = ?
    `;

    const params = [
      Subject,
      StartTime,
      EndTime,
      CommessaId,
      CommessaName, // Usa il nome recuperato
      Duration,
      Progress,
      collaboratorIds.join(','), // Concatena gli ID in una stringa
      IncaricatoName,
      CategoryColor,
      Description,
      parentID,
      info,
      req.params.id,
    ];

    await runQuery(query, params);

    res.json({ message: "Evento aggiornato con successo!" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'evento:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'evento." });
  }
});

app.post('/api/eventi', async (req, res) => {
  try {
    const {
      Subject,
      StartTime,
      EndTime,
      CommessaId,
      IncaricatoId,
      Duration,
      Progress,
      CategoryColor,
      Description,
      parentID,
      info,
      predecessorsName,
      IncaricatoName,
    } = req.body;

    console.log("Dati ricevuti per nuovo evento", req.body);


    // Imposta i valori di default
    const updatedCommessaId = CommessaId || 1; // Default CommessaId = 1
    const updatedIncaricatoId = Array.isArray(IncaricatoId) && IncaricatoId.length > 0
      ? IncaricatoId
      : [1]; // Default CollaboratoreId = 1

    // Recupera il nome della commessa e del collaboratore dal database
    const commessaQuery = 'SELECT CommessaName FROM Commesse WHERE Id = ?';
    const commessaResult = await getRecords(commessaQuery, [updatedCommessaId]);
    const updatedCommessaName = commessaResult[0]?.CommessaName || 'Commessa sconosciuta';

    const collaboratoreQuery = 'SELECT Nome FROM Collaboratori WHERE Id = ?';
    const collaboratoreResult = await getRecords(collaboratoreQuery, [updatedIncaricatoId[0]]);
    const updatedIncaricatoName = collaboratoreResult[0]?.Nome || 'Collaboratore sconosciuto';

    // Query per inserire l'evento
    const query = `
     INSERT INTO Eventi
      (Titolo, Inizio, Fine, CommessaId, CommessaName, Duration, Progress, IncaricatoId, IncaricatoName, Colore, Descrizione, parentID, Info,Dipendenza)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

    const params = [
      Subject || 'Nuovo Evento',
      StartTime || new Date(),
      EndTime || new Date(),
      updatedCommessaId,
      updatedCommessaName,
      Duration || 0,
      Progress || 0,
      updatedIncaricatoId.join(','),
      updatedIncaricatoName,
      CategoryColor || '#9889c2',
      Description || '',
      parentID || null,
      info || '',
      predecessorsName || '', // Dipendenza
    ];
  await runQuery(query, params);
  
    // Invia un messaggio di avviso se sono stati usati valori di default
    const defaultMessage =
      updatedCommessaId === 1 || updatedIncaricatoId.includes(1)
        ? 'Atenzione creato nuovo evento.'
        : null;

    res.json({
      message: 'Nuovo evento creato con successo!',
      warning: defaultMessage,
    });
  } catch (error) {
    console.error('Errore durante la creazione dell\'evento:', error);
    res.status(500).json({ error: 'Errore durante la creazione dell\'evento.' });
  }
});

app.get('/api/commesse', async (req, res) => {
  try {
    const query = 'SELECT Id, CommessaName AS text, Colore AS color FROM Commesse ORDER BY Id DESC';
    const commesse = await getRecords(query);
    res.json(commesse);
    //console.log("Commesse caricate dal database:", commesse);
  } catch (error) {
    console.error('Errore durante il caricamento delle commesse:', error);
    res.status(500).json({ error: 'Errore durante il caricamento delle commesse.' });
  }
});




// Endpoint per ottenere i dettagli di un singolo collaboratore
app.get('/api/collaboratori/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM Collaboratori WHERE Id = ?';
    const result = await getRecords(query, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Collaboratore non trovato' });
    }

    // Formatta il risultato come il resto dei collaboratori
    const collaboratore = result[0];
    const formattedCollaboratore = {
      Id: collaboratore.Id,
      Nome: collaboratore.Nome,
      Colore: collaboratore.Colore,
      Immagine: collaboratore.Immagine,
      groupIds: collaboratore.groupIds ? collaboratore.groupIds.split(',').map(id => parseInt(id, 10)) : []
    };

    res.json(formattedCollaboratore);
  } catch (error) {
    console.error("Errore nel recupero del collaboratore:", error);
    res.status(500).json({ error: "Errore nel recupero del collaboratore." });
  }
});


// Endpoint per rimuovere commesse da un collaboratore
app.put('/api/collaboratori/:id/rimuovi-commesse', async (req, res) => {
  const { id } = req.params;
  const { commesseIds } = req.body;

  try {
    const collaboratore = await getRecords('SELECT * FROM Collaboratori WHERE Id = ?', [id]);
    if (collaboratore.length === 0) return res.status(404).json({ error: 'Collaboratore non trovato' });

    // Recupera gli attuali groupIds e rimuove quelli specificati
    const groupIds = collaboratore[0].groupIds ? collaboratore[0].groupIds.split(',').map(Number) : [];
    const updatedGroupIds = groupIds.filter(gId => !commesseIds.includes(gId));

    // Aggiorna il campo groupIds del collaboratore con i nuovi valori
    await runQuery('UPDATE Collaboratori SET groupIds = ? WHERE Id = ?', [updatedGroupIds.join(','), id]);

    res.json({ message: 'Commesse rimosse dal collaboratore con successo.' });
  } catch (error) {
    console.error("Errore durante la rimozione delle commesse:", error);
    res.status(500).json({ error: "Errore durante la rimozione delle commesse dal collaboratore." });
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

  // Aggiorna il colore di una commessa
app.put('/api/commesse/:id', async (req, res) => {
  const { id } = req.params;
  const { color } = req.body;

  try {
    // Assicurati che la commessa esista nel database
    const commessa = await getRecords('SELECT * FROM Commesse WHERE Id = ?', [id]);
    if (commessa.length === 0) {
      return res.status(404).json({ error: 'Commessa non trovata' });
    }

    // Aggiorna il colore della commessa
    await runQuery('UPDATE Commesse SET Colore = ? WHERE Id = ?', [color, id]);
    res.json({ message: 'Commessa aggiornata con successo!' });
  } catch (error) {
    console.error("Errore durante l'aggiornamento della commessa:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento della commessa." });
  }
});

// Endpoint per ottenere un singolo evento tramite il suo ID
app.get('/api/eventi/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Esegui la query per ottenere l'evento con l'ID specificato
    const query = 'SELECT * FROM Eventi WHERE Id = ?';
    const evento = await getRecords(query, [id]);

    // Controlla se l'evento è stato trovato
    if (evento.length === 0) {
      return res.status(404).json({ error: 'Evento non trovato' });
    }

    // Mappa l'evento in un formato coerente con la tua risposta
    const formattedEvent = {
      Id: evento[0].Id,
      Subject: evento[0].Titolo,
      StartTime: evento[0].Inizio,
      EndTime: evento[0].Fine,
      CommessaIdId:  evento[0].CommessaId,
      CollaboratoreId: evento[0].IncaricatoId.split(',').map(id => parseInt(id, 10)),
      CategoryColor: evento[0].Colore || "#9889c2",
      Description: evento[0].Descrizione, // Includi altri campi necessari
      parentID: evento[0].parentID ? parseInt(evento[0].parentID, 10) : null // Includi e converti parentID
    };

    res.json(formattedEvent); // Rispondi con l'evento formattato
  } catch (error) {
    console.error("Errore nel recupero dell'evento:", error);
    res.status(500).json({ error: "Errore nel recupero dell'evento." });
  }
});



// Configurazione connessione MySQL
const db = mysql.createConnection({
  host: '93.49.98.201',
  port: 8085,
  user: 'geppolo',
  password: 'geppolo',
  database: 'gestionale'
});
db.connect(err => {
  if (err) {
      console.error('Errore di connessione al database MySQL:', err);
      return;
  }
  console.log('Connesso a MySQL!');
});

// Endpoint per ottenere le commesse dal database MySQL
app.get('/api/commesse-mysql', (req, res) => {
  const query = 'SELECT * FROM COMMESSE'; // Modifica il nome della tabella se necessario
  db.query(query, (err, results) => {
      if (err) {
          console.error('Errore durante la query:', err);
          res.status(500).json({ error: 'Errore nella query al database' });
          return;
      }
      res.json(results); // Ritorna i dati delle commesse come JSON
  });
});



// Endpoint per sincronizzare le commesse da MySQL a SQLite
app.get('/api/sincronizza-commesse', (req, res) => {
  const queryMySQL = 'SELECT NOME AS CommessaName, Descrizione, "#9889c2" AS Colore FROM COMMESSE';

  db.query(queryMySQL, (err, results) => {
    if (err) {
      console.error('Errore durante la query su MySQL:', err);
      res.status(500).json({ error: 'Errore nella query al database MySQL' });
      return;
    }

    // Usa INSERT solo se la commessa non esiste già
    const insertIfNotExistsQuery = `
      INSERT INTO Commesse (CommessaName, Descrizione, Colore)
      SELECT ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM Commesse WHERE CommessaName = ?
      )
    `;

    const promises = results.map(row => {
      return runQuery(insertIfNotExistsQuery, [row.CommessaName, row.Descrizione, row.Colore, row.CommessaName]);
    });

    Promise.all(promises)
      .then(() => {
        res.json({ message: 'Sincronizzazione completata con successo!' });
      })
      .catch((err) => {
        console.error('Errore durante l\'inserimento in SQLite:', err);
        res.status(500).json({ error: 'Errore durante l\'inserimento in SQLite' });
      });
  });
});

// Endpoint per aggiornare direttamente il campo groupIds di un collaboratore
app.put('/api/collaboratori/:id', async (req, res) => {
  const { id } = req.params;
  const { groupIds } = req.body;

  try {
    // Verifica che il collaboratore esista
    const collaboratore = await getRecords('SELECT * FROM Collaboratori WHERE Id = ?', [id]);
    if (collaboratore.length === 0) {
      return res.status(404).json({ error: 'Collaboratore non trovato' });
    }

    // Aggiorna il campo groupIds
    await runQuery('UPDATE Collaboratori SET groupIds = ? WHERE Id = ?', [groupIds.join(','), id]);
    res.json({ message: 'groupIds aggiornati con successo.' });
  } catch (error) {
    console.error("Errore durante l'aggiornamento dei groupIds del collaboratore:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dei groupIds del collaboratore." });
  }
});

// Aggiungi un nuovo marker
app.post('/api/markers', async (req, res) => {
  console.log("Richiesta ricevuta per creare un marker:", req.body); // Log per monitorare la richiesta
  const { label, day, severity, eventId } = req.body;

  if (!label || !day || !severity || !eventId) {
      console.error("Dati incompleti ricevuti per il marker:", req.body);
      return res.status(400).json({ error: "Dati incompleti per il marker." });
  }

  try {
      await runQuery('INSERT INTO Markers (Label, Day, Severity, EventId) VALUES (?, ?, ?, ?)', [label, day, severity, eventId]);
      res.status(201).json({ message: 'Marker creato con successo.', label, day, severity, eventId });
  } catch (error) {
      console.error('Errore durante la creazione del marker:', error);
      res.status(500).json({ error: 'Errore durante la creazione del marker.' });
  }
});







// Recupera tutti i marker
app.get('/api/markers', async (req, res) => {
  try {
    const query = 'SELECT * FROM Markers';
      const markers = await getRecords(query);
      res.json(markers);
  } catch (error) {
      res.status(500).json({ error: 'Errore durante il recupero dei marker.' });
  }
});

app.delete('/api/markers/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await runQuery('DELETE FROM Markers WHERE id = ?', [id]);
      res.json({ message: 'Marker eliminato con successo.' });
  } catch (error) {
      res.status(500).json({ error: 'Errore durante l\'eliminazione del marker.' });
  }
});


app.post('/api/memorizza', async (req, res) => {
  const { collaboratoreId, commesseIds } = req.body;

  if (!collaboratoreId || !Array.isArray(commesseIds)) {
    return res.status(400).json({ error: 'Dati non validi.' });
  }

  console.log(`Memorizzazione per Collaboratore ${collaboratoreId} con Commesse: ${commesseIds}`);

  try {
    // Converti l'array di commesse in una stringa separata da virgole
    const groupIds = commesseIds.join(',');

    // Aggiorna il campo groupIds del collaboratore
    const updateQuery = `UPDATE Collaboratori SET groupIds = ? WHERE Id = ?`;
    await runQuery(updateQuery, [groupIds, collaboratoreId]);

    res.json({ message: 'Associazioni salvate con successo!' });
  } catch (error) {
    console.error('Errore durante la memorizzazione:', error);
    res.status(500).json({ error: 'Errore durante la memorizzazione.' });
  }
});

