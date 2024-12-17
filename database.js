const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Imposta il percorso del file del database
const dbPath = path.resolve(__dirname, 'TERA_GESTIONALE_DB.db');

// Crea la connessione al database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore di connessione a SQLite:', err.message);
  } else {
    console.log('Connesso al database SQLite.');
  }
});

// Funzione per eseguire una query di lettura
function getRecords(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Funzione per eseguire una query di inserimento/aggiornamento/eliminazione
function runQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}



module.exports = {
    db,         // Esporta la connessione al database
    getRecords, // Esporta la funzione per ottenere i dati
    runQuery    // Esporta la funzione per eseguire query di inserimento/aggiornamento/eliminazione
  };
  
