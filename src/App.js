import React, { useEffect, useState } from 'react';
import './App.css';
import { ScheduleComponent, TimelineViews, TimelineMonth, Agenda, DragAndDrop, Inject, Resize } from '@syncfusion/ej2-react-schedule';
import { extend } from '@syncfusion/ej2-base';

const App = () => {
  const [events, setEvents] = useState([]);
  const [projectResources, setProjectResources] = useState([]);
  /**const projectResources = [
    { text: 'PROJECT 1', id: 1, color: '#cb6bb2' },
    { text: 'PROJECT 2', id: 2, color: '#56ca85' },
    { text: 'PROJECT 3', id: 3, color: '#df5286' }
  ];**/
  
  /**const [events, setEvents] = useState([
    {
      Id: 1,
      Subject: "Riunione Progetto",
      Location: "Sala Riunioni",
      StartTime: "2023-01-04T10:00:00.000Z",
      EndTime: "2023-01-04T11:30:00.000Z",
      ProjectId: 1,           // Associa all'ID di un progetto in `projectResources`
      CollaboratoreId: [1, 3],          // Associa agli ID di categorie in `categoryResources`
      CategoryColor: "#1aaa55" // Colore della categoria
    },
    {
      Id: 2,
      Subject: "Sviluppo Codice",
      Location: "Studio",
      StartTime: "2023-01-04T13:00:00.000Z",
      EndTime: "2023-01-04T15:00:00.000Z",
      ProjectId: 2,
      CollaboratoreId: [2, 4],
      CategoryColor: "#56ca85"
    },
    {
      Id: 3,
      Subject: "Aggiornamento Cliente",
      Location: "Sala Conferenze",
      StartTime: "2023-01-05T09:00:00.000Z",
      EndTime: "2023-01-05T10:30:00.000Z",
      ProjectId: 3,
      CollaboratoreId: [3, 5],
      CategoryColor: "#56ca85"
      

    }
  ]);**/
  // Funzione per caricare gli eventi dal database
// Funzione per caricare gli eventi dal database
const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/eventi');
    const data = await response.json();
    const mappedEvents = data.map(event => ({
      ...event,
      ProjectId: parseInt(event.ProjectId),
      CollaboratoreId: typeof event.CollaboratoreId === 'string' 
        ? event.CollaboratoreId.split(',').map(id => parseInt(id))
        : Array.isArray(event.CollaboratoreId)
        ? event.CollaboratoreId
        : [] // Imposta un array vuoto se non è né stringa né array
    }));
    setEvents(mappedEvents);
  } catch (error) {
    console.error('Errore durante il caricamento degli eventi:', error);
  }
};

  
  
  
  
  
  // Funzione per salvare un nuovo evento nel database
  const saveEvent = async (eventData) => {
    const collaboratorIds = Array.isArray(eventData.CollaboratoreId)
        ? eventData.CollaboratoreId.join(',')
        : eventData.CollaboratoreId;
    try {
        const response = await fetch('http://localhost:3001/api/eventi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...eventData, CollaboratoreId: collaboratorIds })
        });
        const data = await response.json();
        console.log(data.message);
        fetchEvents();
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
    //console.log('Eventi caricati:', events);
    //console.log('Progetti:', projectResources);
    console.log('Categorie:', categoryResources);
     fetchEvents();
  }, []);



  const [categoryResources, setCategoryResources] = useState([]);

  
const fetchProjectResources = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/commesse');
      const data = await response.json();
      console.log('XXXXXXXXX',data)

      // Mappa i dati ricevuti dal database nel formato richiesto
      const formattedData = data.map(commessa => ({
        text: commessa.text,  // Assegna il nome della commessa a "text"
        id: commessa.Id,              // Assegna l'ID della commessa a "id"
        color: commessa.color        // Assegna il colore della commessa a "color"
      }));

      //{ text: 'PROJECT 1', id: 1, color: '#cb6bb2' },

      // Imposta lo stato con i dati formattati
      setProjectResources(formattedData);
      console.log("Project Resources caricati:", formattedData); // Stampa per verificare
    } catch (error) {
      console.error("Errore durante il caricamento delle commesse:", error);
    }
  };

  const fetchCategoryResources = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/collaboratori');
      const data = await response.json();
      console.log("Dati grezzi dei collaboratori:", data); // Log per verificare i dati ricevuti
  
      // Creiamo un array duplicato per ogni valore in `groupIds`
      const formattedData = data.flatMap(collaboratore =>
        collaboratore.groupIds.map(groupId => ({
          text: collaboratore.Nome,
          id: collaboratore.Id,
          groupId: groupId,  // Usa ogni valore di `groupIds` come `groupId` singolo
          color: collaboratore.Colore
        }))
      );
  
      setCategoryResources(formattedData);
      console.log("Category Resources formattati per Scheduler:", formattedData);
    } catch (error) {
      console.error('Errore durante il caricamento delle risorse dei collaboratori:', error);
    }
  };
  
  


useEffect(() => {
  fetchProjectResources();
  fetchCategoryResources();
  fetchEvents();
}, []);

useEffect(() => {
  console.log("Project Resources passati al Scheduler:", projectResources);
  console.log("Category Resources passati al Scheduler:", categoryResources);
  console.log("Eventi passati al Scheduler:", events);
}, [projectResources, categoryResources, events]);
  
  useEffect(() => {
    console.log("Commesse (Projects) caricate:", projectResources);
  }, [projectResources]);

  // Gestisce il completamento delle azioni di creazione e rimozione eventi
  function onActionComplete(args) {
    if (args.requestType === 'eventCreated') {
      args.addedRecords.forEach(event => saveEvent(event));
    } else if (args.requestType === 'eventRemoved') {
      args.deletedRecords.forEach(event => deleteEvent(event.Id));
    } else if (args.requestType === 'eventChanged') {
      args.changedRecords.forEach(event => updateEvent(event)); // Aggiungi gestione aggiornamento
    }
  }
  
  // Funzione per aggiornare un evento
  const updateEvent = async (eventData) => {
    // Se CollaboratoreId è un array, lo convertiamo in una stringa separata da virgole
    const collaboratorId = Array.isArray(eventData.CollaboratoreId) ? eventData.CollaboratoreId.join(',') : eventData.CollaboratoreId;
  
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${eventData.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          CollaboratoreId: collaboratorId,  // Passiamo il CollaboratoreId come stringa corretta
        })
      });
      const data = await response.json();
      console.log(data.message);
      fetchEvents(); // Ricarica gli eventi
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'evento:", error);
    }
  };
  
    console.log('Eventi passati al Scheduler:', events);
    console.log("Project Resources passati al Scheduler:", projectResources);
    console.log("Category Resources passati al Scheduler:", categoryResources);
    
    
  return (
    <div className="App">
<ScheduleComponent
    actionComplete={onActionComplete}
    width="100%"
    height="650px"
    selectedDate={new Date()}
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
            field: 'CollaboratoreId', title: 'Category', name: 'Categories', allowMultiple: true,
            dataSource: categoryResources,
            textField: 'text', idField: 'id', groupIDField: 'groupId', colorField: 'color'
        }
    ]}
    eventSettings={{
        dataSource: events,
        allowOverlap: true
    }}
    rowAutoHeight={true}
>
    <Inject services={[TimelineViews, TimelineMonth, Agenda, DragAndDrop, Resize]} />
</ScheduleComponent>




    </div>
  );
  
};

export default App;
