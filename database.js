const Database = require('better-sqlite3');
const db = new Database('TERA_GESTIONALE_DB.db', { verbose: console.log });

const createTables = () => {
    const queryCollaboratori = `
        CREATE TABLE IF NOT EXISTS Collaboratori (
            Id INTEGER PRIMARY KEY,
            Nome TEXT NOT NULL,
            Colore TEXT NOT NULL,
            Immagine TEXT
        );
    `;

    const queryCommesse = `
CREATE TABLE IF NOT EXISTS Commesse (
  CommessaName TEXT PRIMARY KEY,
  Descrizione TEXT NOT NULL,
  Colore TEXT NOT NULL,
  Collaboratori TEXT
);
    `;

    const queryEventi = `
        CREATE TABLE IF NOT EXISTS Eventi (
            Id INTEGER PRIMARY KEY,
            Descrizione TEXT NOT NULL,
            Inizio TEXT NOT NULL,
            Fine TEXT NOT NULL,
            CommessaName TEXT,
            IncaricatoId TEXT,
            Colore TEXT,
            Progresso INTEGER,
            Dipendenza TEXT
        );
    `;

    db.prepare(queryCollaboratori).run();
    db.prepare(queryCommesse).run();
    db.prepare(queryEventi).run();
};

createTables();

const verifyTables = () => {
    try {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log("Tables in the database:", tables);
    } catch (error) {
        console.error("Error verifying tables:", error);
    }
};

verifyTables();

const getAllCollaboratori = () => {
    try {
        const query = `SELECT * FROM Collaboratori`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve collaborators.");
    }
};

const getAllCommesse = () => {
    try {
        const query = `SELECT * FROM Commesse`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve projects.");
    }
};

const getAllEventi = () => {
    try {
        const query = `SELECT * FROM Eventi`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve events.");
    }
};

const createEvento = (evento) => {
    try {
        const query = `
            INSERT INTO Eventi (Descrizione, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            evento.Descrizione,
            evento.Inizio,
            evento.Fine,
            evento.CommessaName,
            evento.IncaricatoId,
            evento.Colore || '',
            evento.Progresso || 0,
            evento.Dipendenza || ''
        ];
        console.log('Create Event Params:', params);
        const result = db.prepare(query).run(params);
        return { ...evento, Id: result.lastInsertRowid };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to create event.");
    }
};

const updateEvento = (id, evento) => {
    try {
        const query = `
            UPDATE Eventi
            SET Descrizione = ?, Inizio = ?, Fine = ?, CommessaName = ?, Colore = ?, Progresso = ?, IncaricatoId = ?, Dipendenza = ?
            WHERE Id = ?
        `;
        const params = [
            evento.Descrizione || evento.Subject || 'No Description',
            evento.Inizio || new Date().toISOString(),
            evento.Fine || new Date().toISOString(),
            evento.CommessaName,
            evento.Colore || '',
            evento.Progresso || 0,
            evento.IncaricatoId,
            evento.Dipendenza || '',
            id
        ];
        console.log('Update Event Params:', params);
        const result = db.prepare(query).run(params);
        return { ...evento, Id: id };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to update event.");
    }
};

const deleteEvento = (id) => {
    try {
        const query = `DELETE FROM Eventi WHERE Id = ?`;
        db.prepare(query).run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete event.");
    }
};

const updateCommesse = (commesseSelezionate) => {
    try {
        const existingCommesse = db.prepare(`SELECT * FROM Commesse`).all();

        const insertOrUpdate = db.prepare(`
            INSERT INTO Commesse (CommessaName, Descrizione, Colore, Collaboratori)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(CommessaName) DO UPDATE SET
                Descrizione = excluded.Descrizione,
                Colore = excluded.Colore,
                Collaboratori = excluded.Collaboratori;
        `);

        const insertMany = db.transaction(() => {
            for (const commessaSelezionata of commesseSelezionate) {
                // Log per controllo
                console.log("COLLABORATORI:", commessaSelezionata.collaboratori);

                // Gestisci diversi tipi di 'collaboratori'
                let collaboratori;
                if (Array.isArray(commessaSelezionata.collaboratori)) {
                    collaboratori = commessaSelezionata.collaboratori.join(',');
                } else if (typeof commessaSelezionata.collaboratori === 'string') {
                    collaboratori = commessaSelezionata.collaboratori;
                } else {
                    // Se 'collaboratori' è un numero o un altro tipo, lo convertiamo in stringa
                    collaboratori = String(commessaSelezionata.collaboratori);
                }

                console.log("COLLABORATORI2:", collaboratori);

                // Inserisci o aggiorna la commessa in base al conflitto sul nome
                insertOrUpdate.run(
                    commessaSelezionata.descrizione,
                    commessaSelezionata.descrizione,
                    commessaSelezionata.colore,
                    collaboratori
                );
            }
        });

        insertMany();
        console.log("Commesse aggiornate correttamente");
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to update commesse.");
    }
};




  

const getSelectedCommesse = () => {
    try {
        const query = `SELECT * FROM Commesse`;
        return db.prepare(query).all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to retrieve selected commesse.");
    }
};

module.exports = {
    getAllCollaboratori,
    getAllCommesse,
    getAllEventi,
    createEvento,
    updateEvento,
    deleteEvento,
    updateCommesse,
    getSelectedCommesse
};
