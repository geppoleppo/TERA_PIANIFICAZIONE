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
  const ganttRef = useRef(null);
  
  
  
  const handleUpdateEvent = async (updatedEvent) => {
    console.log("[DEBUG - handleUpdateEvent] Evento prima dell'aggiornamento:", updatedEvent);
  
    try {
      const response = await fetch(`http://localhost:3001/api/eventi/${updatedEvent.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
  
      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento: ${response.statusText}`);
      }
  
      const updatedData = await response.json();
      console.log("[DEBUG - handleUpdateEvent] Evento aggiornato dal server:", updatedData);
  
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.Id === updatedData.Id
            ? { ...event, ...updatedData }
            : event
        )
      );
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
    console.log("[DEBUG  000000 - Stato Events] Stato corrente degli eventi:", events);
  }, [events]);


  useEffect(() => {
    console.log('[DEBUG - USE EFFECT 1] Stato originale degli eventi:', events);
  
    const enrichedEvents = events.map((event) => {
      const commessa = filteredProjectResources.find((res) => res.id === event.ProjectId);
      return {
        ...event,
        CommessaName: commessa ? commessa.text : "Non assegnata",
      };
    });
  
    console.log('[DEBUG - USE EFFECT 1] Eventi arricchiti:', enrichedEvents);
    setFilteredEventsForGantt(enrichedEvents);
  }, [events, filteredProjectResources]);
  

  useEffect(() => {
    console.log("[DEBUG - USE EFFECT 2] Inizio caricamento dati...");
  
    const loadData = async () => {
      try {
        const projects = await fetchProjectResources(); // Commesse
        console.log("[DEBUG - USE EFFECT 2] Commesse caricate:", projects);
        setProjectResources(projects);
  
        const categories = await fetchCategoryResources(); // Collaboratori
        console.log("[DEBUG - USE EFFECT 2] Collaboratori caricati:", categories);
        setCategoryResources(categories);
  
        const rawEvents = await fetchEvents(projects, categories); // Passa categories
        console.log("[DEBUG - USE EFFECT 2] Eventi originali:", rawEvents);
  
        const enrichedEvents = JSON.parse(JSON.stringify(rawEvents)).map((event) => {
          const incaricatoIds = Array.isArray(event.IncaricatoId)
            ? event.IncaricatoId.filter((id) => typeof id === "number" && id > 0)
            : [];
        
          console.log("[DEBUG - Trasformazione Evento] IncaricatoId Originale:", event.IncaricatoId);
          console.log("[DEBUG - Trasformazione Evento] IncaricatoId Filtrato:", incaricatoIds);
        
          const incaricatoNames = incaricatoIds
            .map((id) => categories.find((c) => c.id === id)?.text)
            .filter(Boolean)
            .join(", ");
        
          return {
            ...event,
            IncaricatoId: incaricatoIds,
            IncaricatoName: incaricatoNames,
          };
        });
        console.log("[DEBUG - Prima di setEvents] Eventi arricchiti:", enrichedEvents);
console.log("[DEBUG - Dopo filtro finale] Eventi filtrati:", enrichedEvents.map((event) => ({
  ...event,
  IncaricatoId: Array.isArray(event.IncaricatoId)
    ? event.IncaricatoId.filter((id) => typeof id === "number")
    : [],
})));

        
  
        console.log("[DEBUG - USE EFFECT 2] Eventi arricchiti per il Gantt:", enrichedEvents.map((event) => ({
          ...event,
          IncaricatoId: Array.isArray(event.IncaricatoId)
            ? event.IncaricatoId.filter((id) => typeof id === "number")
            : [],
        })));
        setEvents(
          enrichedEvents.map((event) => ({
            ...event,
            IncaricatoId: Array.isArray(event.IncaricatoId)
              ? event.IncaricatoId.filter((id) => typeof id === "number")
              : [],
          }))
        );
        setFilteredEventsForGantt(enrichedEvents.map((event) => ({
          ...event,
          IncaricatoId: Array.isArray(event.IncaricatoId)
            ? event.IncaricatoId.filter((id) => typeof id === "number")
            : [],
        })));
      } catch (error) {
        console.error("[DEBUG - USE EFFECT 2] Errore nel caricamento dati:", error);
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
    console.log('[DEBUG - USE EFFECT 3] Stato originale degli eventi:', events);
  
    const filteredEvents = events.filter((event) => {
      const incaricatoIdArray = Array.isArray(event.IncaricatoId)
        ? event.IncaricatoId
        : [];
      console.log('[DEBUG - USE EFFECT 3] IncaricatoId Analizzato:', incaricatoIdArray);
  
      const isCollaboratorMatch =
        selectedCollaboratori.length === 0 ||
        incaricatoIdArray.some((id) => selectedCollaboratori.includes(id));
  
      const isCommessaMatch =
        selectedCommesse.length === 0 || selectedCommesse.includes(event.ProjectId);
  
      return isCollaboratorMatch && isCommessaMatch;
    });
  
    console.log('[DEBUG - USE EFFECT 3] Eventi filtrati:', filteredEvents);
    setFilteredEventsForGantt(filteredEvents);
  }, [selectedCollaboratori, selectedCommesse, events]);
  
  
  

  useEffect(() => {
    console.log('USE EFFECT 4', events);
  
    const filteredEvents = events.filter((event) => {
      const incaricatoIdArray = Array.isArray(event.IncaricatoId)
        ? event.IncaricatoId
        : typeof event.IncaricatoId === "string"
        ? event.IncaricatoId.split(',').map(Number)
        : []; // Converte stringhe in array e gestisce null/undefined
  
      const isCollaboratorMatch =
        selectedCollaboratori.length === 0 ||
        incaricatoIdArray.some((id) => selectedCollaboratori.includes(id)); // Controlla tutti gli ID
  
      const isCommessaMatch =
        selectedCommesse.length === 0 || selectedCommesse.includes(event.ProjectId);
  
      return isCollaboratorMatch && isCommessaMatch;
    });
  
    setFilteredEventsForGantt(filteredEvents);
  }, [selectedCollaboratori, selectedCommesse, events]);
  

  const handleCommesseSelection = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setSelectedCommesse(selectedIds);
  };

  const handleSaveEvent = async (newEvent) => {
    try {
      console.log("Salvataggio del nuovo evento:", newEvent);
  
      const response = await fetch('http://localhost:3001/api/eventi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
  
      if (!response.ok) {
        throw new Error('Errore durante il salvataggio del nuovo evento.');
      }
  
      const savedEvent = await response.json();
      console.log("Nuovo evento salvato:", savedEvent);
  
      // Aggiungi il nuovo evento allo stato locale
      setEvents((prevEvents) => [...prevEvents, { ...newEvent, Id: savedEvent.Id }]);
    } catch (error) {
      console.error('Errore durante il salvataggio del nuovo evento:', error);
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
      </div>


      {/* Sidebar e Gantt */}
      <Sidebar
        setProjectResources={setProjectResources}
        filteredProjectResources={filteredProjectResources}
      />
<Gantt
 ganttData={JSON.parse(
  JSON.stringify(
    filteredEventsForGantt.map((event) => ({
      ...event,
      IncaricatoId: Array.isArray(event.IncaricatoId)
        ? event.IncaricatoId.filter((id) => typeof id === "number")
        : [],
    }))
  )
)}


  projectResources={projectResources} // Per il menu delle commesse
  selectedCommesse={selectedCommesse} // Per gli ID delle commesse selezionabili
  //categoryResources={categoryResources} // Per il menu collaboratori
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
