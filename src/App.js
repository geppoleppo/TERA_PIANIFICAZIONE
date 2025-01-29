// App.js - Sincronizzazione con tasto per aggiornare dati tra Gantt
import React, { useState, useRef } from 'react';
import './App.css';
import Gantt from './components/Gantt';
//import Gantt2 from './components/Gantt2';
import Sidebar from './sidebar/Sidebar';

const App = () => {
  const [projectResources, setProjectResources] = useState([
    { resourceId: 1, resourceName: 'Pluto 1', color: '#FF0000', resourceGroup: 'Group A' },
    { resourceId: 2, resourceName: 'Pippo 2', color: '#00FF00', resourceGroup: 'Group B' },
    { resourceId: 3, resourceName: 'Unico 3', color: '#00FF00', resourceGroup: 'Group B' },
  ]);

  const [events, setEvents] = useState([
    {
      Id: 1,
      Subject: 'Evento 1',
      StartTime: new Date('2025-01-01'),
      EndTime: new Date('2025-01-02'),
      CommessaId: 1,
      CategoryColor: '#FF0000',
      Progress: 30,
      work: 16,
      //parentID: 2,
     // resources: [1, 2],
      
      
    },
    {
      Id: 2,
      Subject: 'Evento 2',
      StartTime: new Date('2025-01-03'),
      EndTime: new Date('2025-01-04'),
      CommessaId: 2,
      CategoryColor: '#00FF00',
      Progress: 30,
      work: 16,
      //resources: [3],
      
    },
    {
      Id: 3,
      Subject: 'Evento 3',
      StartTime: new Date('2025-01-03'),
      EndTime: new Date('2025-01-04'),
      CommessaId: 2,
      CategoryColor: '#00FF00',
      Progress: 30,
      work: 16,
      //parentID:2
    },
  ]);

  const ganttRef1 = useRef(null);
  const ganttRef2 = useRef(null);

  const handleUpdateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.Id === updatedEvent.Id ? { ...event, ...updatedEvent } : event))
    );
    if (ganttRef1.current) ganttRef1.current.refresh();
    if (ganttRef2.current) ganttRef2.current.refresh();
  };

  const handleDeleteEvent = (eventId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.Id !== eventId));
    if (ganttRef1.current) ganttRef1.current.refresh();
    if (ganttRef2.current) ganttRef2.current.refresh();
  };

  const handleSaveEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, { ...newEvent, Id: prevEvents.length + 1 }]);
    if (ganttRef1.current) ganttRef1.current.refresh();
    if (ganttRef2.current) ganttRef2.current.refresh();
  };

  const syncGanttData = () => {
    console.log("ci provo...")
    if (ganttRef1.current && ganttRef2.current) {
      const dataFromGantt1 = ganttRef1.current.dataSource;
      ganttRef2.current.dataSource = [...dataFromGantt1];
      ganttRef2.current.refresh();
      console.log('Dati sincronizzati dal Gantt 1 al Gantt 2');
    }
  };

  return (
    <div className="App">
      <Sidebar
        setProjectResources={setProjectResources}
        projectResources={projectResources}
      />

      <button onClick={syncGanttData} style={{ margin: '20px', padding: '10px' }}>
        Sincronizza Gantt 1 -> Gantt 2
      </button>

      <Gantt
        ganttData={events}
        projectResources={projectResources}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        onSaveEvent={handleSaveEvent}
        ref={ganttRef1}
      />

      {/* <Gantt2
        ganttData={events}
        projectResources={projectResources}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        onSaveEvent={handleSaveEvent}
        ref={ganttRef2}
      /> */}
    </div>
  );
};

export default App;
