import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ onSyncCommesse }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
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
            </div>
        </>
    );
};

export default Sidebar;
