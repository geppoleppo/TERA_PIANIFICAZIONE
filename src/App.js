import React, { useEffect, useState } from 'react';
import './App.css';
import Scheduler from './components/Scheduler';  // Importa Scheduler da Scheduler.js
import Gantt from './components/Gantt';  // Importa Gantt da Gantt.js
import Sidebar from './sidebar/Sidebar';
import {
  handleCollaboratoreChange,
  handleCommesseChange,
  handleColorChange,
  removeCommessa,
  fetchProjectResources,
  fetchCategoryResources,
  fetchEvents,
  saveSelectedCommesse,
  saveEvent,
  deleteEvent,
  updateEvent
} from './functions/Functions';

const App = () => {
  const [events, setEvents] = useState([]);
  const [projectResources, setProjectResources] = useState([]);
  const [categoryResources, setCategoryResources] = useState([]);
  const [uniqueCollaborators, setUniqueCollaborators] = useState([]); // Collaboratori unici per il menu
  const [selectedCollaboratori, setSelectedCollaboratori] = useState([]); // Inizializza come array vuoto
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [filteredProjectResources, setFilteredProjectResources] = useState(projectResources);
  
  
  const handleSaveSelectedCommesse = () => {
    saveSelectedCommesse(
      projectResources,
      setProjectResources,
      selectedCollaboratori,
      selectedCommesse,
      fetchCategoryResources,
      fetchEvents
    );
  };

  // Usa la funzione updateEvent quando necessario, passandole fetchEvents come parametro
  const handleUpdateEvent = (eventData) => {
   // console.log('eventi spediti dal gantt:', eventData);
  
    let completeEventData;
  
    if (eventData.ganttProperties) {
      // Logica per eventi dal Gantt
      const commessaName = eventData.CommessaName || eventData.taskData?.CommessaName;
      const projectId = projectResources.find(p => p.text.toLowerCase() === commessaName.toLowerCase())?.id || eventData.taskData?.ProjectId;
      const collaboratoreId = Array.isArray(eventData.CollaboratoreId) ? eventData.CollaboratoreId[0] : eventData.IncaricatoId || eventData.taskData?.CollaboratoreId;
  
      completeEventData = {
        ...eventData,
        ProjectId: projectId,
        CommessaName: commessaName,
        CollaboratoreId: [collaboratoreId], // Array di collaboratori
      };
    } else {
      // Logica per eventi dallo Scheduler
      completeEventData = {
        ...eventData,
        ProjectId: eventData.ProjectId,
        CollaboratoreId: Array.isArray(eventData.CollaboratoreId) ? eventData.CollaboratoreId : [eventData.CollaboratoreId],
      };
    }
  
    //console.log("Dati evento completi per l'aggiornamento:", completeEventData);
  
    // Aggiorna l'evento nel database
    updateEvent(completeEventData, fetchEvents);
  };
  


// Passa `projectResources` e `fetchEvents` come argomenti a `saveEvent`
const handleSaveEvent = (eventData) => {
  //console.log("eventDataEEEEE", eventData); // Log per verifica

  let completeEventData;

  if (eventData.ganttProperties) {
    // Logica per eventi dal Gantt
    const commessaName = eventData.CommessaName || eventData.taskData?.CommessaName;

    // Confronto case-insensitive tra `CommessaName` e `projectResources`
    const commessa = projectResources.find(p => p.text.toLowerCase() === commessaName.toLowerCase());
    const projectId = commessa ? commessa.id : null;
    const collaboratoreId = eventData.IncaricatoId || eventData.taskData?.CollaboratoreId;

      // Trova il collaboratore associato
    const incaricato = categoryResources.find(c => c.id === collaboratoreId);

    completeEventData = {
      ...eventData,
      ProjectId: projectId, // Deriva ProjectId da CommessaName
      CommessaName: commessaName || '', // Usa il nome della commessa
      IncaricatoId: incaricato ? incaricato.id : collaboratoreId || '', // ID dell'incaricato
      CollaboratoreId: Array.isArray(eventData.CollaboratoreId) ? eventData.CollaboratoreId : [collaboratoreId], // Array di collaboratori
    };
  } else {
    // Logica per eventi dallo Scheduler
    const commessa = projectResources.find(p => p.id === eventData.ProjectId);
    const incaricato = categoryResources.find(c => c.id === eventData.CollaboratoreId);

    completeEventData = {
      ...eventData,
      ProjectId: eventData.ProjectId,
      CommessaName: commessa ? commessa.text : eventData.CommessaName || '', // Nome della commessa
      IncaricatoId: incaricato ? incaricato.id : eventData.CollaboratoreId || '', // ID dell'incaricato
    };
  }

  console.log("Salvataggio di un nuovo evento con dati completi:", completeEventData); // Log per verifica

  // Salva l'evento nel database
  saveEvent(completeEventData, projectResources, fetchEvents);
};






const handleDeleteEvent = (eventId) => {
  console.log("Eliminazione evento con ID:", eventId); // Log per verifica
  deleteEvent(eventId, loadAllData);
};

 // Funzione per caricare gli eventi dal database
 const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/eventi');
    const data = await response.json();

    const mappedEvents = data.map(event => {
      const commessa = projectResources.find(p => p.id === event.ProjectId);

      return {
        ...event,
        ProjectId: parseInt(event.ProjectId),
        // Assicurati che `CollaboratoreId` sia sempre un array di numeri
        CollaboratoreId: Array.isArray(event.CollaboratoreId)
          ? event.CollaboratoreId.map(id => parseInt(id))
          : [],
        Color: commessa ? commessa.color : '#FF0000',  // Assegna il colore della commessa
        CommessaName: commessa ? commessa.text : '',    // Nome della commessa
        IncaricatoId: Array.isArray(event.CollaboratoreId)
          ? event.CollaboratoreId.map(id => parseInt(id)) // Usa tutto l'array di ID collaboratori
          : []
      };
    });

    setEvents(mappedEvents);
  } catch (error) {
    console.error('Errore durante il caricamento degli eventi:', error);
  }
};



  // Funzione per caricare le commesse dal database
  const fetchProjectResources = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/commesse');
      const data = await response.json();

      const formattedData = data.map(commessa => ({
        text: commessa.text,
        id: commessa.Id,
        color: commessa.color || '#FF0000' // Imposta colore rosso se non definito
      }));

      //console.log("Commesse caricate con colore:", formattedData);
      setProjectResources(formattedData);
    } catch (error) {
      console.error('Errore durante il caricamento delle commesse:', error);
    }
  };

  // Funzione per caricare i collaboratori e duplicarli per il `Scheduler`
  const fetchCategoryResources = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/collaboratori');
      const data = await response.json();

      const uniqueCollaborators = data.map(collaboratore => ({
        text: collaboratore.Nome,
        id: collaboratore.Id,
        groupIds: collaboratore.groupIds,
        color: collaboratore.Colore || '#FF0000' // Colore rosso di default se non specificato
      }));

      const duplicatedData = data.flatMap(collaboratore =>
        collaboratore.groupIds.map(groupId => ({
          text: collaboratore.Nome,
          id: collaboratore.Id,
          groupId: groupId,
          color: collaboratore.Colore || '#00D084',
          Immagine: collaboratore.Immagine  // Aggiungi il campo immagine qui
        }))
      );

      setUniqueCollaborators(uniqueCollaborators);
      setCategoryResources(duplicatedData);
      //console.log("Duplicated Category Resources:", duplicatedData);
    } catch (error) {
      console.error('Errore durante il caricamento dei collaboratori:', error);
    }
  };
  // Funzione per visualizzare l’immagine e il nome del collaboratore
  const resourceHeaderTemplate = (props) => {
    //console.log("props.resourceData:", props.resourceData);

    // Verifica se l'elemento è una commessa o un collaboratore
    const isCommessa = props.resourceData && !props.resourceData.groupId; // Supponiamo che le commesse non abbiano `groupId`

    if (isCommessa) {
      // Se `props.resourceData` è una commessa, mostriamo solo il nome della commessa
      return (
        <div className="template-wrap">
          <div className="commessa-name">{props.resourceData.text}</div>
        </div>
      );
    } else {
      // Altrimenti, trattiamo `props.resourceData` come un collaboratore e cerchiamo l'immagine
      const collaborator = categoryResources.find(
        resource => resource.id === props.resourceData.id && resource.groupId === props.resourceData.groupId
      );

      //console.log("collaborator trovato:", collaborator);
      return (
        <div className="template-wrap">
          {collaborator && collaborator.Immagine && (
            <img src={collaborator.Immagine} alt={collaborator.text} className="resource-image" />
          )}
          <div className="resource-details">
            <div className="resource-name">{collaborator ? collaborator.text : ''}</div>
          </div>
        </div>
      );
    }
  };

  const onEventRendered = (args) => {
    const event = args.data;
    const commessa = projectResources.find(p => p.id === event.ProjectId);
    if (commessa && commessa.color) {
      args.element.style.backgroundColor = commessa.color;
    }
  };

    // Carica eventi, commesse e collaboratori una volta al montaggio del componente
    useEffect(() => {
      loadAllData();
    }, [])
  
  // Funzione per caricare tutti i dati
  const loadAllData = async () => {
    const eventsData = await fetchEvents();
    const projectData = await fetchProjectResources();
    const categoryData = await fetchCategoryResources();


    //setEvents(eventsData);
    //setProjectResources(projectData);
    //setCategoryResources(categoryData);
  };

// Aggiorna le commesse e i collaboratori filtrati ogni volta che cambia `selectedCommesse` o `selectedCollaboratori`
useEffect(() => {
  const selectedCommesseIds = selectedCommesse.map(commessa => commessa.value);
  const filteredResources = selectedCommesseIds.length
      ? projectResources.filter(resource => selectedCommesseIds.includes(resource.id))
      : [];

  setFilteredProjectResources(filteredResources);

  if (selectedCollaboratori.length > 0) {
      const filteredCollaborators = categoryResources.filter(resource =>
          selectedCollaboratori.includes(resource.id)
      );
      setFilteredCategoryResources(filteredCollaborators);
  } else {
      setFilteredCategoryResources(categoryResources);
  }
}, [selectedCommesse, selectedCollaboratori, projectResources, categoryResources]);


  // Aggiorna le commesse filtrate non appena `selectedCommesse` cambia
  useEffect(() => {
    const selectedCommesseIds = selectedCommesse.map(commessa => commessa.value);

    // Se non ci sono commesse selezionate, imposta filteredProjectResources su un array vuoto
    const filteredResources = selectedCommesseIds.length
      ? projectResources.filter(resource => selectedCommesseIds.includes(resource.id))
      : []; // Seleziona nessuna commessa se selectedCommesse è vuoto

    setFilteredProjectResources(filteredResources);
  }, [selectedCommesse, projectResources]);


  // Sincronizza lo Scheduler con il cambiamento di `filteredProjectResources`
  useEffect(() => {
    // Reimposta lo stato `events` ogni volta che `filteredProjectResources` cambia
    fetchEvents();
  }, [filteredProjectResources]);



  // Effetto per aggiornare le commesse in base ai collaboratori selezionati
  useEffect(() => {
    if (selectedCollaboratori && selectedCollaboratori.length > 0) {
      const commesseComuni = projectResources.filter(commessa =>
        selectedCollaboratori.every(collabId => {
          const collaboratore = uniqueCollaborators.find(c => c.id === collabId);
          return collaboratore?.groupIds.includes(commessa.id);
        })
      );

      setSelectedCommesse(
        commesseComuni.map(commessa => ({
          value: commessa.id,
          label: commessa.text,
          color: commessa.color // Assicura che il colore sia passato qui
        }))
      );
    } else {
      setSelectedCommesse([]);
    }
  }, [selectedCollaboratori, projectResources]);

  // Stato per risorse dei collaboratori filtrati in base ai collaboratori selezionati
  const [filteredCategoryResources, setFilteredCategoryResources] = useState(categoryResources);

  // Filtra le risorse dei collaboratori in base ai collaboratori selezionati
  useEffect(() => {
    if (selectedCollaboratori.length > 0) {
      // Filtra `categoryResources` in base a `selectedCollaboratori`
      const filteredResources = categoryResources.filter(resource =>
        selectedCollaboratori.includes(resource.id)
      );
      setFilteredCategoryResources(filteredResources);
    } else {
      // Se nessun collaboratore è selezionato, mostra tutti i collaboratori
      setFilteredCategoryResources(categoryResources);
    }
  }, [selectedCollaboratori, categoryResources]);

  // Sincronizza `filteredCategoryResources` con lo Scheduler
  useEffect(() => {
    fetchEvents();
  }, [filteredCategoryResources]);


  
  // Gestisce il completamento delle azioni di creazione e rimozione eventi
  function onActionComplete(args) {
    if (args.requestType === 'eventCreated') {
      args.addedRecords.forEach(event => handleSaveEvent (event));
    } else if (args.requestType === 'eventRemoved') {
      args.deletedRecords.forEach(event => deleteEvent(event.Id,fetchEvents));
    } else if (args.requestType === 'eventChanged') {
      args.changedRecords.forEach(event => handleUpdateEvent (event)); // Aggiungi gestione aggiornamento
    }
  }
  //console.log("categoryResources nel render di App:", categoryResources);

  return (
    <div className="App">
      {/* Altri componenti e menu come Select */}
      <Sidebar />
      {/* Passa le props necessarie a Scheduler */}
      <Scheduler
  events={events}
  onEventRendered={onEventRendered}
  resourceHeaderTemplate={resourceHeaderTemplate}
  onActionComplete={onActionComplete}
  filteredProjectResources={filteredProjectResources}
  filteredCategoryResources={filteredCategoryResources}
  uniqueCollaborators={uniqueCollaborators} // Passaggio di uniqueCollaborators
  selectedCollaboratori={selectedCollaboratori} // Passaggio di selectedCollaboratori
  setSelectedCollaboratori={setSelectedCollaboratori} // Passaggio di setSelectedCollaboratori
  selectedCommesse={selectedCommesse} // Passaggio di selectedCommesse
  setSelectedCommesse={setSelectedCommesse}
  projectResources={projectResources} // Passaggio di projectResources
  handleCollaboratoreChange={handleCollaboratoreChange} // Funzione gestione selezione collaboratori
  handleCommesseChange={handleCommesseChange} // Funzione gestione selezione commesse
  handleColorChange={handleColorChange} // Funzione gestione cambio colore
  removeCommessa={removeCommessa} // Funzione gestione rimozione commessa
  handleSaveSelectedCommesse={handleSaveSelectedCommesse} // Funzione gestione memorizzazione
/>
{categoryResources.length > 0 && (
  <Gantt
  ganttData={events.filter(event =>
    filteredProjectResources.some(resource => resource.id === event.ProjectId) &&
    event.CollaboratoreId.some(id => filteredCategoryResources.some(collab => collab.id === id))
  )}
  onSaveEvent={handleSaveEvent}
  onUpdateEvent={handleUpdateEvent}
  onDeleteEvent={handleDeleteEvent}
  categoryResources={categoryResources}
/>
    )}
    </div>
  );
};

export default App;