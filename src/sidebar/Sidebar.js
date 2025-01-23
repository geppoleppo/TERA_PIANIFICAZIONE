import React, { useState } from 'react';
import './Sidebar.css';
import { TwitterPicker } from 'react-color';
import MarkerForm from '../components/MarkerForm';

const Sidebar = ({ onSyncCommesse, filteredProjectResources, setProjectResources, markers, setMarkers, events, onSaveMarker, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMarkerForm, setShowMarkerForm] = useState(false); // Dichiarazione corretta dello stato
    const [isSelectingMarker, setIsSelectingMarker] = useState(false); // Modalità selezione marker
    const [selectedMarkerId, setSelectedMarkerId] = useState(null); // ID del marker selezionato


    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleColorChange = (color, commessaId) => {
        const updatedProjectResources = filteredProjectResources.map(commessa =>
            commessa.id === commessaId ? { ...commessa, color: color.hex } : commessa
        );
        setProjectResources(updatedProjectResources);

        fetch(`https://93.49.98.201:3004/api/commesse/${commessaId}`, {
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


    const handleDeleteMarker = async (markerId) => {
        try {
            await fetch(`https://93.49.98.201:3004/api/markers/${markerId}`, { method: 'DELETE' });
            setMarkers(markers.filter(marker => marker.Id !== markerId));
            setIsSelectingMarker(false); // Esci dalla modalità di selezione
        } catch (error) {
            console.error('Errore durante l\'eliminazione del marker:', error);
        }
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


                    <button onClick={() => setShowMarkerForm(!showMarkerForm)}>
                        {showMarkerForm ? 'Chiudi Form Marker' : 'Aggiungi Marker'}
                    </button>

                    <button onClick={() => setIsSelectingMarker(!isSelectingMarker)}>
                        {isSelectingMarker ? 'Annulla' : 'Elimina Marker'}
                    </button>
                </div>
                {showMarkerForm && (
                    <MarkerForm
                        onSaveMarker={(newMarker) => {
                            onSaveMarker(newMarker); // Chiama la funzione passata da App.js
                            setShowMarkerForm(false); // Chiudi il form
                        }}
                        events={events}
                    />
                )}

                {isSelectingMarker && (
                    <div className="marker-select-list">
                        {markers.map((marker) => (
                            <div key={marker.Id} className="marker-item">
                                <span>{marker.Label} - {marker.Day}</span>
                                <button onClick={() => handleDeleteMarker(marker.Id)}>
                                    Seleziona per Eliminare
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </>
    );
};

export default Sidebar;
