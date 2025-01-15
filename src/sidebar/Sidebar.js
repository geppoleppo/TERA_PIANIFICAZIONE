import React, { useState } from 'react';
import './Sidebar.css';
import { TwitterPicker } from 'react-color';
import MarkerForm from '../components/MarkerForm';

const Sidebar = ({ onSyncCommesse, filteredProjectResources, setProjectResources, markers, setMarkers, events,onSaveMarker, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMarkerForm, setShowMarkerForm] = useState(false); // Dichiarazione corretta dello stato

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

    const handleDeleteMarker = async (markerId) => {
        try {
            await fetch(`http://localhost:3001/api/markers/${markerId}`, { method: 'DELETE' });
            setMarkers(markers.filter(marker => marker.id !== markerId));
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

                <div className="marker-list">
                    <h4>Marker</h4>
                    {markers.length > 0 ? (
                        markers.map(marker => (
                            <div key={marker.id} className="marker-item">
                                <span>{marker.label} - {marker.day}</span>
                                <button onClick={() => handleDeleteMarker(marker.id)}>Elimina</button>
                            </div>
                        ))
                    ) : (
                        <p>Nessun marker disponibile</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
