import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { TwitterPicker } from 'react-color';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, TimelineViews, Inject, TimelineMonth } from '@syncfusion/ej2-react-schedule';
import './App.css';

const App = () => {
  const [resources, setResources] = useState([]); // Collaboratori
  const [commesse, setCommesse] = useState([]);   // Commesse dal DB
  const [selectedCollaboratore, setSelectedCollaboratore] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [scheduleData, setScheduleData] = useState([]);  // Dati per lo scheduler
  const [ganttData, setGanttData] = useState([]);        // Dati per il Gantt


  // Carica collaboratori e commesse dal DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collaboratoriResponse = await axios.get('http://localhost:4443/api/collaboratori');
        setResources(collaboratoriResponse.data);
  
        const commesseResponse = await axios.get('http://localhost:4443/api/commesse');
        setCommesse(commesseResponse.data);
  
        const eventiResponse = await axios.get('http://localhost:4443/api/eventi');
        const eventiData = eventiResponse.data.map(evento => ({
          ...evento,
          StartTime: new Date(evento.Inizio),
          EndTime: new Date(evento.Fine),
          Subject: evento.Descrizione
        }));
        setScheduleData(eventiData);
  
        console.log("Collaboratori caricati:", collaboratoriResponse.data);
        console.log("Commesse caricate:", commesseResponse.data);
        console.log("Eventi caricati:", eventiData);
  
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };
  
    fetchData();
  }, []);
  

  // Gestisce il cambio di collaboratore
  const handleCollaboratoreChange = async (selectedOptions) => {
    setSelectedCollaboratore(selectedOptions);

    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedCommesse([]);  // Nessun collaboratore selezionato, nessuna commessa
      return;
    }

    try {
      // Array di Promises per ottenere le commesse di ciascun collaboratore
      const requests = selectedOptions.map(option => axios.get(`http://localhost:4443/api/commesse/collaboratore/${option.value}`));

      // Risolviamo tutte le promesse
      const responses = await Promise.all(requests);

      // Uniamo tutte le commesse e troviamo quelle comuni
      const commesseAssociate = responses
        .map(response => response.data.map(commessa => commessa.CommessaName))
        .reduce((commune, commessaList) => {
          return commune.filter(commessa => commessaList.includes(commessa));  // Filtra le commesse comuni a tutti i collaboratori
        });

      const commesseVisualizzabili = commesseAssociate.map(commessaName => ({
        value: commessaName,
        label: commessaName
      }));

      setSelectedCommesse(commesseVisualizzabili);

    } catch (error) {
      console.error('Errore nel caricamento delle commesse per i collaboratori selezionati:', error);
    }
  };

  // Gestisce il cambio di colore
  const handleColorChange = (color, commessaName) => {
    setCommessaColors(prevColors => ({
      ...prevColors,
      [commessaName]: color.hex
    }));
  };

  // Salva le commesse e i colori per il collaboratore selezionato
  const saveSelectedCommesse = async () => {
    try {
      const commesseToSave = selectedCommesse.map(option => ({
        commessaName: option.value,
        colore: commessaColors[option.value] || '#000000'
      }));

      await Promise.all(selectedCollaboratore.map(collaboratore => 
        axios.post('http://localhost:4443/api/associate-commesse-collaboratore', {
          collaboratoreId: collaboratore.value,
          commesse: commesseToSave
        })
      ));

      alert('Commesse associate e salvate con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio delle commesse:', error);
      alert('Errore nel salvataggio delle commesse');
    }
  };

  // Definisci la funzione handleSchedulerDataChange
  const handleSchedulerDataChange = (args) => {
    // Controlla se args è valido
    if (!args) {
      console.error('Nessun argomento fornito:', args);
      return;
    }
  
    // Controlla il tipo di richiesta
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
      if (!args.data) {
        console.error('Dati dello scheduler non validi:', args);
        return;
      }
  
      // Gestisci i dati dell'evento creato, modificato o eliminato
      console.log('Dati dello scheduler aggiornati:', args.data);
      
      setScheduleData((prevData) => {
        // Se args.data è un array, potrebbe essere un elenco di eventi da aggiungere o aggiornare
        if (Array.isArray(args.data)) {
          return args.data;
        }
  
        // Se è un singolo evento, aggiorna o aggiungi l'evento nel set di dati
        const updatedData = prevData.map((event) =>
          event.Id === args.data.Id ? args.data : event
        );
  
        // Se non è stato trovato, aggiungi l'evento
        if (!updatedData.some((event) => event.Id === args.data.Id)) {
          updatedData.push(args.data);
        }
  
        return updatedData;
      });
    } else {
      // Ignora altri tipi di azioni, come 'dateNavigate', 'viewNavigate', ecc.
      console.log('Azione dello scheduler non richiede aggiornamento dei dati:', args.requestType);
    }
  };
  
    // Debug dei dati prima del rendering
    console.log("Risorse per Scheduler:", resources);
    console.log("Commesse per Scheduler:", selectedCommesse);
    console.log("Dati degli eventi per Scheduler:", scheduleData);

  return (
    <div className="app-container">
      {/* Prima sezione: Associazione commesse ai collaboratori */}
      <div className="menu-container">
        <h3>Associa commesse ai collaboratori</h3>

        {/* Seleziona il collaboratore */}
        <Select
  isMulti
  options={resources
    .filter(resource => resource && resource.Id && resource.Nome) // Filtra solo collaboratori validi
    .map(collaboratore => ({
      value: collaboratore.Id,
      label: collaboratore.Nome
    }))}
  value={selectedCollaboratore}
  onChange={handleCollaboratoreChange}
  placeholder="Seleziona collaboratori"
/>


        {/* Seleziona le commesse per il collaboratore */}
        <Select
  isMulti
  options={commesse
    .filter(commessa => commessa && commessa.CommessaName && commessa.Descrizione) // Filtra solo commesse valide
    .map(commessa => ({
      value: commessa.CommessaName,
      label: commessa.CommessaName
    }))}
  value={selectedCommesse}
  onChange={setSelectedCommesse}
  placeholder="Seleziona commesse"
/>


        {/* Seleziona il colore per ogni commessa */}
        {selectedCommesse.map((commessa, index) => (
          <div key={index}>
            <span>{commessa.label}</span>
            <TwitterPicker
              color={commessaColors[commessa.value] || '#000000'}
              onChangeComplete={(color) => handleColorChange(color, commessa.value)}
            />
          </div>
        ))}

        {/* Salva le commesse e i colori */}
        <button onClick={saveSelectedCommesse}>Salva</button>
      </div>

      {/* Scheduler Syncfusion */}
      <ScheduleComponent
  height='650px'
  selectedDate={new Date()}
  eventSettings={{ dataSource: scheduleData }}
  group={{ 
    allowGroupEdit: true, // Verifica questa impostazione
    byGroupID: false, // Verifica se hai bisogno di questa opzione
    resources: ['Collaboratori', 'Commesse'] // Controlla i nomi dei gruppi
  }}
  resources={[
    {
      field: 'CollaboratoreId',
      title: 'Collaboratori',
      name: 'Collaboratori',
      allowMultiple: true,
      dataSource: resources.map(resource => ({
        Id: resource.Id,
        Nome: resource.Nome,
        Colore: resource.Colore || '#000000',
        Immagine: resource.Immagine // Aggiungi tutti i campi necessari
      })),
      textField: 'Nome',
      idField: 'Id',
      colorField: 'Colore'
    },
    {
      field: 'CommessaName',
      title: 'Commesse',
      name: 'Commesse',
      allowMultiple: true,
      dataSource: selectedCommesse.map(commessa => ({
        CommessaName: commessa.value,
        Descrizione: commessa.label,
        Colore: commessaColors[commessa.value] || '#000000'
      })),
      textField: 'Nome',
      idField: 'Id',
      colorField: 'Colore'
    }
  ]}
  eventSettings={{ dataSource: scheduleData }}
  actionComplete={handleSchedulerDataChange}
>
  <Inject services={[TimelineViews, Day, Week, WorkWeek, Month, Agenda, TimelineMonth]} />
</ScheduleComponent>

    </div>
  );
};

export default App;
