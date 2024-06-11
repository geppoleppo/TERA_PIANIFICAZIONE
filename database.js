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
        Inizio DATETIME NOT NULL,
        Fine DATETIME NOT NULL,
        CommessaId INTEGER,
        IncaricatoId INTEGER,
        Colore TEXT NOT NULL,
        Progresso INTEGER,
        FOREIGN KEY (CommessaId) REFERENCES Commesse(Id),
        FOREIGN KEY (IncaricatoId) REFERENCES Collaboratori(Id)
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
    const query = 'SELECT * FROM Eventi';
    return db.prepare(query).all();
};

const addEvento = (evento) => {
    const query = 'INSERT INTO Eventi (Descrizione, Inizio, Fine, CommessaId, IncaricatoId, Colore, Progresso) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.prepare(query).run(evento.Descrizione, evento.Inizio, evento.Fine, evento.CommessaId, evento.IncaricatoId, evento.Colore, evento.Progresso);
};

const updateEvento = (evento) => {
    const query = 'UPDATE Eventi SET Descrizione = ?, Inizio = ?, Fine = ?, CommessaId = ?, IncaricatoId = ?, Colore = ?, Progresso = ? WHERE Id = ?';
    db.prepare(query).run(evento.Descrizione, evento.Inizio, evento.Fine, evento.CommessaId, evento.IncaricatoId, evento.Colore, evento.Progresso, evento.Id);
};

const deleteEvento = (id) => {
    const query = 'DELETE FROM Eventi WHERE Id = ?';
    db.prepare(query).run(id);
};


module.exports = {

    getAllEventi,
    addEvento,
    updateEvento,
    deleteEvento ,
    getAllCollaboratori,
    getAllCommesse,

};
