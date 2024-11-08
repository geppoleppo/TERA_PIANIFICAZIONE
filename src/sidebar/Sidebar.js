import React, { useState } from 'react';
import './Sidebar.css';
import { TwitterPicker } from 'react-color';

const Sidebar = ({ onSyncCommesse, filteredProjectResources, setProjectResources }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleColorChange = (color, commessaId) => {
        // Aggiorna localmente `filteredProjectResources`
        const updatedProjectResources = filteredProjectResources.map(commessa =>
            commessa.id === commessaId ? { ...commessa, color: color.hex } : commessa
        );
        setProjectResources(updatedProjectResources);
    
        // Invia una richiesta PUT al backend per aggiornare il colore della commessa nel database
        fetch(`http://localhost:3001/api/commesse/${commessaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ color: color.hex }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore durante l'aggiornamento del colore per la commessa con ID ${commessaId}: ${response.statusText}`);
            }
            console.log('Colore aggiornato con successo nel database per la commessa con ID', commessaId);
        })
        .catch(error => {
            console.error("Errore durante l'aggiornamento del colore nel database:", error);
        });
    };
    

    return (
        <>
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isOpen ? '⟩' : '☰'}
            </button>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={toggleSidebar}>✕</button>
                <div className="sidebar-buttons">
                    <button onClick={onSyncCommesse}>Sincronizza Commesse</button>
                </div>
                <div className="commesse-color-section">
    <h4>Assegna Colori Alle Commesse</h4>
    {filteredProjectResources && filteredProjectResources.length > 0 ? (
        filteredProjectResources.map((commessa, index) => (
            <div key={index}>
                <span>{commessa.text}</span>
                <TwitterPicker
                    color={commessa.color || '#000000'}
                    onChangeComplete={(color) => handleColorChange(color, commessa.id)}
                />
            </div>
        ))
    ) : (
        <p>Nessuna commessa disponibile</p>
    )}
</div>
            </div>
        </>
    );
};



export default Sidebar;
