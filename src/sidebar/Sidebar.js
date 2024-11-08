import React, { useState } from 'react';
import './Sidebar.css';
import { TwitterPicker } from 'react-color';

const Sidebar = ({ onSyncCommesse, filteredProjectResources, setProjectResources }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleColorChange = (color, commessaId) => {
        const updatedProjectResources = filteredProjectResources.map(commessa =>
            commessa.id === commessaId ? { ...commessa, color: color.hex } : commessa
        );
        setProjectResources(updatedProjectResources);
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
