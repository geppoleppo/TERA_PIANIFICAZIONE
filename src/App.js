// App.js - Sincronizzazione con tasto per aggiornare dati tra Gantt
import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './App.css';
import Gantt from './components/Gantt';
import IndicatorModal from './components/indicators';
//import Gantt2 from './components/Gantt2';
import Sidebar from './sidebar/Sidebar';
//import '@syncfusion/ej2-icons/styles/material.css'; // Stili Syncfusion Icons
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GanttResourceView from './components/GanttResourceView';

const indirizzo_url='https://localhost:3004'

const ToggleViewButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggleView = () => {
    if (location.pathname === "/") {
      navigate("/resource-view");
    } else {
      navigate("/");
    }
  };

  return (
    <button onClick={handleToggleView} style={{ margin: '10px', padding: '10px' }}>
      {location.pathname === "/" ? "📊 Visualizza Risorse" : "📅 Torna al Gantt"}
    </button>
  );
};



const App = () => {
  const [events, setEvents] = useState([]); // Stato per gli eventi del Gantt
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);


  const handleAddIndicator = (indicator) => {
    console.log("📢 handleAddIndicator chiamato con:", indicator);

    setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
            event.Id === indicator.taskId
                ? {
                    ...event,
                    Indicators: [...(event.Indicators || []), {
                        date: indicator.date,
                        name: indicator.name,
                        tooltip: indicator.tooltip,
                        iconClass: indicator.iconClass,
                    }]
                }
                : event
        );

        console.log("📢 Eventi aggiornati con gli indicatori:", updatedEvents);

        // Forza aggiornamento del Gantt
        if (ganttRef1.current) {
            console.log("🔄 Aggiornamento forzato del Gantt con i nuovi indicatori!");
            ganttRef1.current.dataSource = updatedEvents;
            ganttRef1.current.refresh();
        }

        return updatedEvents;
    });

    setShowIndicatorModal(false);
};

  
  


  // Funzione per ricevere eventi aggiornati dal Gantt
  const handleEventsUpdate = (updatedEvents) => {
    console.log("Aggiornamento eventi ricevuto:", updatedEvents);
    setEvents(updatedEvents);
  };




  const ganttRef1 = useRef(null);
  const ganttRef2 = useRef(null);

  const handleUpdateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.Id === updatedEvent.Id ? { ...event, ...updatedEvent } : event))
    );
    if (ganttRef1.current) ganttRef1.current.refresh();
    if (ganttRef2.current) ganttRef2.current.refresh();
  };



  const handleSaveEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, { ...newEvent, Id: prevEvents.length + 1 }]);
    if (ganttRef1.current) ganttRef1.current.refresh();
    if (ganttRef2.current) ganttRef2.current.refresh();
  };


  const syncCommesse = async () => {
    console.log("Sincronizzazione delle commesse in corso...");
    try {
      const response = await fetch( indirizzo_url+'/api/sync-commesse');
      const data = await response.json();
      console.log("Risultato sincronizzazione:", data.message);

      if (ganttRef1.current) ganttRef1.current.refresh();
      if (ganttRef2.current) ganttRef2.current.refresh();
    } catch (error) {
      console.error("Errore nella sincronizzazione delle commesse:", error);
    }
  };

  console.log("📢 Controllo IndicatorModal - onSave:", handleAddIndicator);
  console.log("📢 handleAddIndicator è definito:", typeof handleAddIndicator);
  console.log("📢 EVENTI:", events);

  return (
    <Router>
      <div className="App">
        <Sidebar />
        <ToggleViewButton />

        <button onClick={() => setShowIndicatorModal(true)} style={{ margin: '10px', padding: '10px' }}>
          ✨ Aggiungi Indicatore
        </button>

        <button onClick={syncCommesse} style={{ margin: '10px', padding: '10px' }}>
        🔄 Sincronizza Commesse (MySQL → SQLite)
      </button>
        {showIndicatorModal && (
          <IndicatorModal
            tasks={events}
            onSave={(indicator) => {
              console.log("📢 Indicatore aggiunto:", indicator);
              setShowIndicatorModal(false);
            }}
            onClose={() => setShowIndicatorModal(false)}
          />
        )}

        <Routes>
        <Route path="/" element={<Gantt ref={ganttRef1} indirizzo_url={indirizzo_url} onEventsUpdate={handleEventsUpdate} />} />
          <Route path="/resource-view" element={<GanttResourceView 
          indirizzo_url={indirizzo_url}/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;