const express = require('express');
const { getRecords, runQuery } = require('./database');
const cors = require('cors'); // Importa il pacchetto cors
const app = express();
const mysql = require('mysql2');




app.use(cors({
  origin: 'http://localhost:3000', // Imposta l'origine del frontend
  methods: ['GET', 'POST', 'DELETE','PUT'], // Limita i metodi consentiti
  allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Middleware per leggere JSON dal body




// Funzione per ottenere i collaboratori duplicati in base ai loro groupIds
app.get('/api/collaboratori', async (req, res) => {
  try {
    const query = 'SELECT * FROM Collaboratori';
    const collaboratori = await getRecords(query);

    const formattedCollaboratori = collaboratori.map(collaboratore => ({
      Id: collaboratore.Id,
      Nome: collaboratore.Nome,
      Colore: collaboratore.Colore,
      Immagine: collaboratore.Immagine,
      groupIds: collaboratore.groupIds ? collaboratore.groupIds.split(',').map(id => parseInt(id, 10)) : []
    }));

    res.json(formattedCollaboratori);
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero dei collaboratori" });
  }
});


app.use(cors()); // Abilita CORS per tutte le richieste
app.use(express.json());



// Aggiungi un nuovo evento
app.post('/api/eventi', async (req, res) => {
  const {
    Subject,
    StartTime,
    EndTime,
    ProjectId,
    CollaboratoreId,
    CategoryColor,
    Description,
    parentID,
  } = req.body;

  try {
    const query = `
      INSERT INTO Eventi 
      (Titolo, Inizio, Fine, CommessaName, IncaricatoId, Colore, Descrizione, parentID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await runQuery(query, [
      Subject,
      StartTime,
      EndTime,
      ProjectId || null,
      Array.isArray(CollaboratoreId) ? CollaboratoreId.join(',') : null,
      CategoryColor || '#000000',
      Description || '',
      parentID || null,
    ]);

    res.json({ message: 'Evento salvato con successo!', Id: result.insertId });
  } catch (error) {
    console.error('Errore durante il salvataggio del nuovo evento:', error);
    res.status(500).json({ error: 'Errore durante il salvataggio del nuovo evento.' });
  }
});





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
  try {
    // Query per recuperare gli eventi
    const eventiQuery = 'SELECT * FROM Eventi';
    const eventi = await getRecords(eventiQuery);

    // Query per recuperare i collaboratori
    const collaboratoriQuery = 'SELECT Id, Nome FROM Collaboratori';
    const collaboratori = await getRecords(collaboratoriQuery);

    console.log("Collaboratori caricati:", collaboratori);

    // Mappatura degli eventi
    const mappedEventi = eventi.map(evento => {
      // Converti IncaricatoId in array di numeri
      const incaricatoIds = evento.IncaricatoId
        ? evento.IncaricatoId.split(',').map(id => parseInt(id.trim(), 10))
        : [];

      // Mappa gli ID ai nomi usando i collaboratori dal database
      const incaricatoNames = incaricatoIds
        .map(id => {
          const collaboratore = collaboratori.find(collab => collab.Id === id);
          return collaboratore ? collaboratore.Nome : null;
        })
        .filter(Boolean) // Rimuove eventuali valori null o undefined
        .join(", "); // Concatena i nomi con virgole

      return {
        Id: evento.Id,
        Subject: evento.Titolo,
        StartTime: evento.Inizio,
        EndTime: evento.Fine,
        ProjectId: parseInt(evento.CommessaName, 10) || null,
        IncaricatoId: incaricatoIds, // Array di ID
        IncaricatoName: incaricatoNames || "Nessuno", // Stringa con nomi
        CategoryColor: evento.Colore || "#000000",
        parentID: evento.parentID ? parseInt(evento.parentID, 10) : null,
        CommessaName: evento.CommessaName
      };
    });

    console.log("EVENTI MAPPATI:", mappedEventi);
    res.json(mappedEventi);
  } catch (error) {
    console.error('Errore durante il recupero degli eventi:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli eventi.' });
  }
});


app.put('/api/eventi/:id', async (req, res) => {
  const { Subject, StartTime, EndTime, taskData, CategoryColor, Description, parentID } = req.body;

  console.log("Dati ricevuti per l'aggiornamento:", req.body);

  try {
    const collaboratorIds = Array.isArray(taskData.IncaricatoId)
  ? taskData.IncaricatoId // È già un array
  : taskData.IncaricatoId
      ? taskData.IncaricatoId.split(',').map((id) => Number(id.trim())) // Converte la stringa in un array di numeri
      : [];

    const collaboratorNames = taskData.IncaricatoName || "Nessuno";
    const id = taskData.Id;

    console.log("ID ricevuto per l'aggiornamento:", collaboratorIds);

    const query = `
      UPDATE Eventi
      SET Titolo = ?, Inizio = ?, Fine = ?, CommessaName = ?,
          IncaricatoId = ?, IncaricatoName = ?, Colore = ?, Descrizione = ?, parentID = ?
      WHERE Id = ?
    `;

    const params = [
      Subject,
      StartTime,
      EndTime,
      taskData.ProjectId || null,
      collaboratorIds.join(','),
      collaboratorNames,
      CategoryColor || "#000000",
      Description || "",
      parentID,
      id,
    ];

    console.log("Query UPDATE:", query);
    console.log("Parametri:", params);

    const result = await runQuery(query, params);
    console.log("Righe aggiornate:", result.changes);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Evento non trovato per l'aggiornamento." });
    }

    // Recupera l'evento aggiornato
    console.log("Tipo di ID prima della SELECT:", typeof id, id);
    const updatedEvent = await runQuery('SELECT * FROM Eventi WHERE Id = ?', [Number(id)]);

    console.log("Evento aggiornato:", updatedEvent);
   

    if (updatedEvent.length > 0) {
      res.json(updatedEvent[0]);
    } else {
      console.error("Nessun evento trovato con ID:", id);
      res.status(404).json({ error: "Evento non trovato dopo l'aggiornamento." });
    }
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'evento:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'evento." });
  }
}


);






app.get('/api/commesse', async (req, res) => {
  try {
    const query = 'SELECT Id, CommessaName AS text, Colore AS color FROM Commesse';
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


  
  const port = 3001; // Assicurati che questa sia la porta corretta e non in conflitto
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
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
      ProjectId: parseInt(evento[0].CommessaName, 10),
      CollaboratoreId: evento[0].IncaricatoId.split(',').map(id => parseInt(id, 10)),
      CategoryColor: evento[0].Colore || "#000000",
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
  const queryMySQL = 'SELECT NOME AS CommessaName, Descrizione, "#FFFFFF" AS Colore FROM COMMESSE';

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
app.post('/api/markers', (req, res) => {
  const { label, day } = req.body;

  const query = 'INSERT INTO Markers (Label, Day) VALUES (?, ?)';
  runQuery(query, [label, day])
    .then((result) => {
      console.log("Risultato dell'inserimento:", result); // Log utile per il debug
      if (!result.insertId) {
        return res.status(500).json({ error: "Id non generato durante l'inserimento." });
      }
      res.status(201).json({ id: result.insertId, label, day });
    })
    .catch((err) => {
      console.error("Errore durante il salvataggio del marker:", err);
      res.status(500).json({ error: "Errore durante il salvataggio del marker." });
    });
});


// Recupera tutti i marker
app.get('/api/markers', (req, res) => {
  const query = 'SELECT * FROM Markers';
  getRecords(query)
    .then((markers) => res.json(markers))
    .catch((err) => {
      console.error("Errore durante il recupero dei marker:", err);
      res.status(500).json({ error: "Errore durante il recupero dei marker." });
    });
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

