import React, { useState } from 'react';
import './Sidebar.css';
import { TwitterPicker } from 'react-color';
import MarkerForm from "../components/MarkerForm";

const Sidebar = ({ onSyncCommesse, filteredProjectResources, setProjectResources, onSaveMarker }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMarkerForm, setShowMarkerForm] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleColorChange = (color, commessaId) => {
        const updatedProjectResources = filteredProjectResources.map(commessa =>
            commessa.id === commessaId ? { ...commessa, color: color.hex } : commessa
        );
        setProjectResources(updatedProjectResources);

        fetch(`http://localhost:3001/api/commesse/${commessaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
                <div className="commesse-container">
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
                <div className="marker-section">
                    {/* Pulsante per mostrare/nascondere il form */}
                    <button onClick={() => setShowMarkerForm(!showMarkerForm)}>
                        {showMarkerForm ? "Chiudi Form Marker" : "Aggiungi Marker"}
                    </button>
                    {/* Form Marker */}
                    {showMarkerForm && <MarkerForm onSaveMarker={onSaveMarker} />}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
