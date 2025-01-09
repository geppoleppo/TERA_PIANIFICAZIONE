import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Gantt from './components/Gantt';
import Sidebar from './sidebar/Sidebar';
import Select from 'react-select';
import Swal from 'sweetalert2'; // Assicurati di installare SweetAlert2 per i popup
import {
  fetchProjectResources,
  fetchCategoryResources,
  fetchEvents,
  handleCollaboratoreChange,
} from './functions/Functions';

const App = () => {
  const [projectResources, setProjectResources] = useState([]); // Tutte le commesse
  const [filteredProjectResources, setFilteredProjectResources] = useState([]); // Commesse filtrate
  const [categoryResources, setCategoryResources] = useState([]); // Collaboratori
  const [selectedCollaboratori, setSelectedCollaboratori] = useState([]); // Collaboratori selezionati
  const [selectedCommesse, setSelectedCommesse] = useState([]); // Commesse selezionate
  const [events, setEvents] = useState([]); // Eventi originali
  const [filteredEventsForGantt, setFilteredEventsForGantt] = useState([]); // Eventi filtrati
  const [collaborators, setCollaborators] = useState([]); // Tutti i collaboratori
  
  
  const handleRefresh = async () => {
    try {
      const updatedEvents = await fetchEvents(projectResources);
      setEvents(updatedEvents); // Aggiorna lo stato globale degli eventi
      setFilteredEventsForGantt(updatedEvents); // Aggiorna i dati filtrati per il Gantt
      Swal.fire({
        icon: 'success',
        title: 'Aggiornato!',
        text: 'I dati sono stati aggiornati correttamente.',
      });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dei dati:', error);
      Swal.fire({
        icon: 'error',
        title: 'Errore!',
        text: 'Non è stato possibile aggiornare i dati. Riprova più tardi.',
      });
    }
  };
  


  const handleUpdateEvent = async (updatedEvent) => {
    console.log("DATI in handleUpdateEvent:", updatedEvent);
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${updatedEvent.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento: ${response.statusText}`);
      }
  
      const updatedEventData = await response.json();
  
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.Id === updatedEventData.Id ? updatedEventData : event
        )
      );
      console.log("Evento aggiornato:", updatedEventData);
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'evento:", error);
    }
  };
  
  
  
  
  


  const handleDeleteEvent = async (eventId) => {
    try {
      console.log(`Eliminazione evento con ID: ${eventId}`);

      // Chiamata alla rotta DELETE del backend
      const response = await fetch(`http://localhost:3001/api/eventi/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Errore durante l'eliminazione: ${response.statusText}`);
      }

      console.log(`Evento con ID ${eventId} eliminato con successo.`);

      // Aggiorna lo stato locale per riflettere la modifica
      setEvents((prevEvents) => prevEvents.filter((event) => event.Id !== eventId));
      setFilteredEventsForGantt((prevEvents) =>
        prevEvents.filter((event) => event.Id !== eventId)
      );
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'evento:", error);
    }
  };


  useEffect(() => {
    console.log('USE EFFECT 1', events);
    const enrichedEvents = events.map(event => ({
      ...event,
      IncaricatoId: Array.isArray(event.IncaricatoId)
        ? event.IncaricatoId
        : (event.IncaricatoId || '').split(',').map(Number), // Converte stringa in array
      IncaricatoName: event.IncaricatoName || 'Nessuno',
    }));
    setFilteredEventsForGantt(enrichedEvents);
  }, [events, filteredProjectResources]);
  
  useEffect(() => {
    console.log('USE EFFECT 2', events);
    const loadData = async () => {
      try {
        const projects = await fetchProjectResources();
        setProjectResources(projects);
  
        const collaboratorsData = await fetchCategoryResources();
        console.log("[DEBUG] Tutti i collaboratori caricati:", collaboratorsData); // Log per verifica
        setCollaborators(collaboratorsData); // Salva tutti i collaboratori
        setCategoryResources(collaboratorsData); // Popola il menu Collaboratori filtrato inizialmente
  
        const events = await fetchEvents(projects);
        setEvents(events);
  
        setFilteredEventsForGantt(events); // Inizialmente tutti gli eventi
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
      }
    };
    loadData();
  }, []);

 
  


  // Selezione collaboratori e aggiornamento delle commesse
  const handleCollaboratoreSelection = (selectedOptions) => {
    console.log("Opzioni selezionate nel menu Collaboratori:", selectedOptions);
    handleCollaboratoreChange(
      selectedOptions,
      setSelectedCollaboratori,
      categoryResources,
      setFilteredProjectResources,
      projectResources
    );
  };

  useEffect(() => {
    console.log('USE EFFECT 3 - Selezione Collaboratori aggiornata:', selectedCollaboratori);
  
    if (selectedCollaboratori.length === 0) {
      setFilteredProjectResources([]);
      setSelectedCommesse([]);
      setFilteredEventsForGantt([]); // Nessun evento mostrato se nessun collaboratore selezionato
    } else {
      // Filtra le commesse associate ai collaboratori selezionati
      const associatedCommesseFromCollaboratori = projectResources.filter((commessa) =>
        selectedCollaboratori.some((collabId) => {
          const collaboratore = categoryResources.find((c) => c.id === collabId);
          return collaboratore?.groupIds.includes(commessa.id);
        })
      );
  
      // Filtra gli eventi associati ai collaboratori selezionati
      const filteredEvents = events.filter((event) => {
        const incaricatoIds = Array.isArray(event.IncaricatoId)
          ? event.IncaricatoId
          : typeof event.IncaricatoId === 'string'
          ? event.IncaricatoId.split(',').map(Number)
          : [];
        return selectedCollaboratori.some((collabId) => incaricatoIds.includes(collabId));
      });
  
      setFilteredEventsForGantt(filteredEvents);
  
      // Aggiorna le commesse da visualizzare
      const uniqueCommesse = Array.from(
        new Set(associatedCommesseFromCollaboratori.map((c) => c.id))
      ).map((id) => associatedCommesseFromCollaboratori.find((c) => c.id === id));
  
      console.log('Commesse filtrate:', uniqueCommesse);
      setFilteredProjectResources(uniqueCommesse);
  
      const selectedIds = uniqueCommesse.map((res) => res.id);
      setSelectedCommesse(selectedIds);
    }
  }, [selectedCollaboratori, projectResources, categoryResources]);
  
  
  

  useEffect(() => {
    console.log('USE EFFECT 4 - Filtraggio Eventi Gantt', selectedCollaboratori, selectedCommesse);
  
    const filteredEvents = events.filter((event) => {
      const incaricatoIdArray = Array.isArray(event.IncaricatoId)
        ? event.IncaricatoId
        : typeof event.IncaricatoId === 'string'
        ? event.IncaricatoId.split(',').map(Number)
        : [];
  
      const isCollaboratorMatch =
        selectedCollaboratori.length === 0 ||
        incaricatoIdArray.some((id) => selectedCollaboratori.includes(id));
  
      const isCommessaMatch =
        selectedCommesse.length === 0 ||
        selectedCommesse.includes(Number(event.CommessaId));
  
      return isCollaboratorMatch && isCommessaMatch;
    });
  
    setFilteredEventsForGantt(filteredEvents); // Aggiorna solo gli eventi filtrati
  }, [selectedCollaboratori, selectedCommesse, events]);
  
  
  useEffect(() => {
    console.log('USE EFFECT - Aggiornamento Commesse Selezionate', selectedCollaboratori);
  
    if (selectedCollaboratori.length === 0) {
      setFilteredProjectResources([]);
      setSelectedCommesse([]);
    } else {
      const associatedCommesseFromCollaboratori = projectResources.filter((commessa) =>
        selectedCollaboratori.some((collabId) => {
          const collaboratore = categoryResources.find((c) => c.id === collabId);
          return collaboratore?.groupIds.includes(commessa.id);
        })
      );
  
      const uniqueCommesse = Array.from(
        new Set(associatedCommesseFromCollaboratori.map((c) => c.id))
      ).map((id) => associatedCommesseFromCollaboratori.find((c) => c.id === id));
  
      setFilteredProjectResources(uniqueCommesse);
  
      const selectedIds = uniqueCommesse.map((res) => res.id);
      setSelectedCommesse(selectedIds); // Aggiorna solo qui
    }
  }, [selectedCollaboratori, projectResources, categoryResources]);
  

  const handleCommesseSelection = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setSelectedCommesse(selectedIds);
  };

  const handleSaveEvent = async (newEvent) => {
    try {
      const response = await fetch('http://localhost:3001/api/eventi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
  
      if (!response.ok) {
        throw new Error('Errore durante il salvataggio dell\'evento.');
      }
  
      const result = await response.json();
  
      if (result.warning) {
        Swal.fire({
          icon: 'info',
          title: 'NUOVO EVENTO',
          text: result.warning,
        });
      }
  
      console.log('Evento creato:', result.message);
  
      // Ricarica gli eventi dal backend dopo aver aggiunto un nuovo evento
      const updatedEventsResponse = await fetch('http://localhost:3001/api/eventi', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!updatedEventsResponse.ok) {
        throw new Error('Errore durante il caricamento degli eventi aggiornati.');
      }
  
      const updatedEvents = await updatedEventsResponse.json();
      setEvents(updatedEvents); // Aggiorna lo stato con gli eventi aggiornati
      console.log("Eventi aggiornati ricevuti dal server:", updatedEvents);
  
    } catch (error) {
      console.error('Errore durante il salvataggio dell\'evento:', error);
      Swal.fire({
        icon: 'error',
        title: 'Errore!',
        text: 'Si è verificato un errore durante il salvataggio dell\'evento.',
      });
    }
  };
  
  // Funzione per sincronizzare le commesse con il database MySQL
  const sincronizzaCommesse = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sincronizza-commesse');
      const data = await response.json();
      console.log(data.message);
      // Aggiorna la tabella delle commesse nel frontend, se necessario
    } catch (error) {
      console.error('Errore durante la sincronizzazione delle commesse:', error);
    }
  };
  

  
  

  const handleSaveAssociations = () => {
    if (selectedCollaboratori.length !== 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Attenzione!',
        text: 'Puoi memorizzare le commesse solo per un singolo collaboratore alla volta.',
      });
      return;
    }

    const collaboratoreId = selectedCollaboratori[0]; // Collaboratore selezionato
    const commesseIds = selectedCommesse; // Commesse selezionate

    console.log("Memorizzazione in corso per il collaboratore:", collaboratoreId, "con commesse:", commesseIds);

    fetch('http://localhost:3001/api/memorizza', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collaboratoreId, commesseIds }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Errore durante la memorizzazione.');
        }
        return response.json();
      })
      .then((data) => {
        Swal.fire({
          icon: 'success',
          title: 'Memorizzazione riuscita!',
          text: data.message || 'Le commesse sono state memorizzate con successo.',
        });
      })
      .catch((error) => {
        console.error('Errore durante la memorizzazione:', error);
        Swal.fire({
          icon: 'error',
          title: 'Errore!',
          text: 'Si è verificato un errore durante la memorizzazione. Riprova più tardi.',
        });
      });
  };

  const filteredCategoryResources = categoryResources.filter((collab) =>
    selectedCollaboratori.includes(collab.id)
  );

  const parentOptions = filteredEventsForGantt.map((event) => ({
    text: event.Subject, // Nome dell'evento
    value: event.Id, // ID dell'evento
  }));
  parentOptions.unshift({ text: "Nessun Parent", value: null }); // Opzione per nessun parent
  

  return (
    <div className="App">
      {/* Menu di selezione Collaboratori */}
      <div>
        <label>Seleziona Collaboratore:</label>
        <Select
          options={categoryResources.map((collab) => ({
            value: collab.id,
            label: collab.text,
          }))}
          isMulti
          onChange={handleCollaboratoreSelection}
          placeholder="Seleziona Collaboratore"
        />
      </div>

      {/* Menu di selezione Commesse */}
      <div>
        <label>Seleziona Commesse:</label>
        <Select
          key={projectResources.map((res) => res.id).join(",")} // Forza il re-render quando le opzioni cambiano
          options={projectResources.map((project) => ({
            value: project.id,
            label: project.text,
          }))}
          isMulti
          value={projectResources
            .filter((project) => selectedCommesse.includes(project.id))
            .map((project) => ({
              value: project.id,
              label: project.text,
            }))} // Sincronizza le commesse selezionate
          onChange={handleCommesseSelection}
          placeholder="Seleziona Commesse"
        />
      </div>

      <div>
  <button onClick={handleSaveAssociations} className="btn btn-primary">
    Memorizza
  </button>
  <button onClick={handleRefresh} className="btn btn-primary" style={{ marginLeft: '10px' }}>
    Aggiorna
  </button>
</div>



      {/* Sidebar e Gantt */}
      <Sidebar
        setProjectResources={setProjectResources}
        filteredProjectResources={filteredProjectResources}
        onSyncCommesse={sincronizzaCommesse}
      />
<Gantt
  ganttData={filteredEventsForGantt}
  projectResources={projectResources} // Per il menu delle commesse
  selectedCommesse={selectedCommesse} // Per gli ID delle commesse selezionabili
  allCollaborators={collaborators} // Tutti i collaboratori
  selectedCollaboratori={selectedCollaboratori}
  parentOptions={parentOptions} // Opzioni dei parent
  categoryResources={filteredCategoryResources}
  onSaveEvent={handleSaveEvent}
  onUpdateEvent={handleUpdateEvent}
  onDeleteEvent={handleDeleteEvent}
 
/>
      
    </div>
  );
};

export default App;