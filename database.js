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
            Id INTEGER PRIMARY KEY,
            Descrizione TEXT NOT NULL,
            Colore TEXT NOT NULL
        );
    `;

    const queryEventi = `
        CREATE TABLE IF NOT EXISTS Eventi (
            Id INTEGER PRIMARY KEY,
            Descrizione TEXT NOT NULL,
            Inizio TEXT NOT NULL,
            Fine TEXT NOT NULL,
            CommessaId INTEGER,
            IncaricatoId TEXT,
            Colore TEXT,
            Progresso INTEGER,
            FOREIGN KEY (CommessaId) REFERENCES Commesse(Id)
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
            INSERT INTO Eventi (Descrizione, Inizio, Fine, CommessaId, IncaricatoId, Colore, Progresso)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            evento.Descrizione,
            evento.Inizio,
            evento.Fine,
            evento.CommessaId,
            evento.IncaricatoId,
            evento.Colore || '',
            evento.Progresso || 0
        ];
        console.log('Create Event Params:', params);
        const interpolatedQuery = query.replace(/\?/g, (_, i) => `'${params[i]}'`);
        console.log('Interpolated Create Event Query:', interpolatedQuery);
        const result = db.prepare(query).run(params);
        return { ...evento, Id: result.lastInsertRowid };
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to create event.");
    }
};

const updateEvento = (id, evento) => {
    console.log('EVENTOOO:', evento);
    try {
        // Base query
        let query = `
            UPDATE Eventi
            SET Descrizione = ?, Inizio = ?, Fine = ?, CommessaId = ?, Colore = ?, Progresso = ?
        `;
        const params = [
            evento.Descrizione,
            evento.Inizio,
            evento.Fine,
            Array.isArray(evento.CommessaId) ? evento.CommessaId.join(',') : evento.CommessaId,
            evento.Colore || '',
            evento.Progresso || 0,
            id
        ];

        // Aggiungi IncaricatoId alla query e ai parametri se è presente
        if (evento.IncaricatoId !== undefined) {
            query = query.replace('Colore = ?', 'IncaricatoId = ?, Colore = ?');
            params.splice(4, 0, evento.IncaricatoId);
        }

        query += ' WHERE Id = ?';
        
        console.log('Update Event Params:', params);
        const interpolatedQuery = query.replace(/\?/g, (_, i) => `'${params[i]}'`);
        console.log('Interpolated Update Event Query:', interpolatedQuery);

        return db.prepare(query).run(params);
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

module.exports = {
    getAllCollaboratori,
    getAllCommesse,
    getAllEventi,
    createEvento,
    updateEvento,
    deleteEvento,
};
