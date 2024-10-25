import React, { useEffect, useState } from 'react';
import './App.css';
import { ScheduleComponent, TimelineViews, TimelineMonth, Agenda, DragAndDrop, Inject, Resize } from '@syncfusion/ej2-react-schedule';
import { extend } from '@syncfusion/ej2-base';

const App = () => {
  //const [events, setEvents] = useState([]);
  const [events, setEvents] = useState([
    {
      Id: 1,
      Subject: "Riunione Progetto",
      Location: "Sala Riunioni",
      StartTime: "2023-01-04T10:00:00.000Z",
      EndTime: "2023-01-04T11:30:00.000Z",
      ProjectId: 1,           // Associa all'ID di un progetto in `projectResources`
      TaskId: [1, 3],          // Associa agli ID di categorie in `categoryResources`
      CategoryColor: "#1aaa55" // Colore della categoria
    },
    {
      Id: 2,
      Subject: "Sviluppo Codice",
      Location: "Studio",
      StartTime: "2023-01-04T13:00:00.000Z",
      EndTime: "2023-01-04T15:00:00.000Z",
      ProjectId: 2,
      TaskId: [2, 4],
      CategoryColor: "#56ca85"
    },
    {
      Id: 3,
      Subject: "Aggiornamento Cliente",
      Location: "Sala Conferenze",
      StartTime: "2023-01-05T09:00:00.000Z",
      EndTime: "2023-01-05T10:30:00.000Z",
      ProjectId: 3,
      TaskId: [3, 5],
      CategoryColor: "#56ca85"
      

    }
  ]);
  



  // Funzione per caricare gli eventi dal database
  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/eventi');
      const data = await response.json();
  
      // Assumi che `ProjectId` e `TaskId` siano stati definiti per ogni evento
      const mappedEvents = data.map(event => ({
        ...event,
        ProjectId: event.ProjectId || 1, // Usa un valore predefinito o mappa da DB
        TaskId: event.TaskId || [1],      // Usa un valore predefinito o mappa da DB
      }));
  
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Errore durante il caricamento degli eventi:', error);
    }
  };
  
  
  
  
  
  // Funzione per salvare un nuovo evento nel database
  const saveEvent = async (eventData) => {
    try {
      const response = await fetch('http://localhost:3001/api/eventi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData) 
      });
      const data = await response.json();
      console.log(data.message);
      fetchEvents(); // Ricarica gli eventi dopo il salvataggio
    } catch (error) {
      console.error("Errore durante il salvataggio dell'evento:", error);
    }
  };
  
  // Funzione per eliminare un evento dal database
  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${eventId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      console.log(data.message);
      fetchEvents(); // Ricarica gli eventi dopo l'eliminazione
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'evento:", error);
    }
  };
  
  // Effettua il caricamento degli eventi quando il componente è montato
  useEffect(() => {
    console.log('Eventi caricati:', events);
    console.log('Progetti:', projectResources);
    console.log('Categorie:', categoryResources);
    fetchEvents();
  }, []);

  const projectResources = [
    { text: 'PROJECT 1', id: 1, color: '#cb6bb2' },
    { text: 'PROJECT 2', id: 2, color: '#56ca85' },
    { text: 'PROJECT 3', id: 3, color: '#df5286' }
  ];

  const categoryResources = [
    { text: 'Nancy', id: 1, groupId: 1, color: '#df5286' },
    { text: 'Steven', id: 2, groupId: 1, color: '#7fa900' },
    { text: 'Robert', id: 3, groupId: 2, color: '#ea7a57' },
    { text: 'Smith', id: 4, groupId: 2, color: '#5978ee' },
    { text: 'Micheal', id: 5, groupId: 3, color: '#df5286' },
    { text: 'Root', id: 6, groupId: 3, color: '#00bdae' }
  ];

  // Gestisce il completamento delle azioni di creazione e rimozione eventi
  function onActionComplete(args) {
    if (args.requestType === 'eventCreated') {
      args.addedRecords.forEach(event => saveEvent(event));
    } else if (args.requestType === 'eventRemoved') {
      args.deletedRecords.forEach(event => deleteEvent(event.Id));
    }
  }

  console.log('Eventi passati al Scheduler:', events);

  return (
    <div className="App">
      <ScheduleComponent
        actionComplete={onActionComplete}
        width="100%"
        height="650px"
        selectedDate={new Date(2023, 0, 4)}
        views={['TimelineDay', 'TimelineWeek', 'TimelineWorkWeek', 'TimelineMonth', 'Agenda']}
        currentView="TimelineWeek"
        workDays={[0, 1, 2, 3, 4, 5]}
        group={{ resources: ['Projects', 'Categories'] }}
        resources={[
          {
            field: 'ProjectId', title: 'Choose Project', name: 'Projects',
            dataSource: projectResources,
            textField: 'text', idField: 'id', colorField: 'color'
          },
          {
            field: 'TaskId', title: 'Category', name: 'Categories', allowMultiple: true,
            dataSource: categoryResources,
            textField: 'text', idField: 'id', groupIDField: 'groupId', colorField: 'color'
          }
        ]}
        eventSettings={{ dataSource: events }}
      >
        <Inject services={[TimelineViews, TimelineMonth, Agenda, DragAndDrop, Resize]} />
      </ScheduleComponent>
    </div>
  );
  
};

export default App;
