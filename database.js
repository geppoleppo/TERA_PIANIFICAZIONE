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
            Colore TEXT NOT NULL
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
        console.log("aggiungi", evento);

        const query = `
            INSERT INTO Eventi (Descrizione, Inizio, Fine, CommessaName, IncaricatoId, Colore, Progresso, Dipendenza, ParentID, info)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const incaricatoId = Array.isArray(evento.resources) && evento.resources.length > 0
            ? evento.resources.map(res => res.resourceId).join(',')
            : '1';

        const params = [
            evento.Subject || 'No Description',
            evento.StartTime || new Date().toISOString(),
            evento.EndTime || new Date().toISOString(),
            evento.CommessaName || 'COMMESSA DA ASSEGNARE',
            incaricatoId, // Assicura che il valore sia corretto
            evento.CategoryColor || '#abb8c3',
            evento.Progress || 0,
            evento.Predecessors || '',
            evento.parentID,
            evento.info
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
    console.log('🔄 Aggiornamento ParentID e ordine per evento ID', JSON.stringify(evento));

    try {
        // **Verifichiamo se l'oggetto evento contiene SOLO parentID e orderIndex**
        const isDragDropUpdate = Object.keys(evento).length === 2 &&
            (evento.hasOwnProperty("parentID") || evento.hasOwnProperty("orderIndex"));

        if (isDragDropUpdate) {
            console.log(`🔄 Aggiornamento SOLO ParentID e OrderIndex per evento ID ${id}`);

            const query = `
                UPDATE Eventi
                SET ParentID = ?, orderIndex = ?
                WHERE Id = ?
            `;

            db.prepare(query).run(evento.parentID, evento.orderIndex, id);
            return { Id: id, parentID: evento.parentID, orderIndex: evento.orderIndex };
        }

        // **Altrimenti aggiorniamo l'intero evento**
        console.log('📊 Aggiornamento completo dell\'evento ID', id);
        console.log('📊 Aggiornamento completo dell\'evento...');

        // **Correzione del campo IncaricatoId per evitare virgole in eccesso**
        const incaricatiIds = Array.isArray(evento.taskData?.resources) && evento.taskData.resources.length > 0
            ? evento.taskData.resources.map(res => res.resourceId).join(',')
            : '1';

        const query = `
            UPDATE Eventi
            SET Descrizione = ?, Inizio = ?, Fine = ?, CommessaName = ?, Colore = ?, Progresso = ?, IncaricatoId = ?, Dipendenza = ?, ParentID = ?, orderIndex = ?, info=?
            WHERE Id = ?
        `;

        const params = [
            evento.taskData?.Subject || evento.Subject || 'No Description',
            evento.taskData?.StartTime || new Date().toISOString(),
            evento.taskData?.EndTime || new Date().toISOString(),
            evento.taskData?.CommessaName,
            evento.taskData?.CategoryColor || '',
            evento.taskData?.Progress || 0,
            incaricatiIds, // ✅ Assicura che non abbia virgole in eccesso
            evento.taskData?.Predecessors || '',
            evento.taskData?.parentID,
            evento.taskData?.orderIndex,
            evento.taskData?.info,
            id
        ];

        console.log('📝 Parametri aggiornamento evento:', params);

        db.prepare(query).run(...params);
        return { ...evento.taskData, Id: id };

    } catch (error) {
        console.error("❌ Errore nel database:", error);
        throw new Error("Failed to update event.");
    }
};




;

const deleteEvento = (id) => {
    try {
        const query = `DELETE FROM Eventi WHERE Id = ?`;
        db.prepare(query).run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Failed to delete event.");
    }
};

const updateCommesse = (commesse) => {
    try {
        console.log("🔄 Updating commesse with:", commesse);
        
        const insert = db.prepare(`
            INSERT INTO Commesse (CommessaName, Descrizione, Colore) 
            VALUES (?, ?, ?)
        `);

        const checkExist = db.prepare(`
            SELECT COUNT(*) AS count FROM Commesse WHERE CommessaName = ?
        `);

        const insertMany = db.transaction((commesse) => {
            for (const commessa of commesse) {
                const exists = checkExist.get(commessa.NOME);
                if (exists.count === 0) { // Se non esiste, la inseriamo
                    insert.run(
                        commessa.NOME,             // ✅ Usa `NOME` invece di `descrizione`
                        commessa.Descrizione,      // ✅ Usa `Descrizione` corretto
                        commessa.Colore || "#FFFFFF"  // ✅ Default a bianco se `NULL`
                    );
                    console.log(`✅ Aggiunta commessa: ${commessa.NOME}`);
                } else {
                    console.log(`⚠️ Commessa già presente, ignorata: ${commessa.NOME}`);
                }
            }
        });

        insertMany(commesse);
        console.log("✅ Commesse aggiornate correttamente!");
    } catch (error) {
        console.error("❌ Database error:", error);
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
