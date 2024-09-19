import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ScheduleComponent, Day, WorkWeek, Month, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
import '../index.css';
import axios from 'axios';

// Load the required CLDR data
import { loadCldr, L10n } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/main/it/numbers.json';
import * as gregorian from 'cldr-data/main/it/ca-gregorian.json';
import * as timeZoneNames from 'cldr-data/main/it/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, timeZoneNames, weekData);

// Load Italian locale
L10n.load({
  'it': {
    'schedule': {
      'day': 'Giorno',
      'week': 'Settimana',
      'workWeek': 'Settimana lavorativa',
      'month': 'Mese',
      'agenda': 'Agenda',
      'today': 'Oggi',
      'noEvents': 'Nessun evento',
      'allDay': 'Tutto il giorno',
      'start': 'Inizio',
      'end': 'Fine',
      'more': 'di più',
      'close': 'Chiudi',
      'cancel': 'Annulla',
      'noTitle': '(Nessun titolo)',
    },
  }
});

const Scheduler = ({ data, onDataChange, commessaColors, commesse, resources,applyGanttFilter }) => {
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [currentView, setCurrentView] = useState('Month'); 
  const [modifiedData, setModifiedData] = useState([]);

  // Nuovo stato per il collaboratore selezionato e le commesse filtrate
  const [selectedCollaboratore, setSelectedCollaboratore] = useState(null);
  const [filteredCommesse, setFilteredCommesse] = useState([]);


  useEffect(() => {
    const newData = data.map(event => ({
      ...event,
      IncaricatoId: Array.isArray(event.IncaricatoId) ? event.IncaricatoId.map(id => parseInt(id)) : event.IncaricatoId,
      StartTime: new Date(event.Inizio), // Assicurati che Inizio sia nel formato corretto
      EndTime: new Date(event.Fine), // Assicurati che Fine sia nel formato corretto
      Subject: event.Descrizione || 'Nessuna descrizione',
    }));
    setModifiedData(newData);
  }, [data]);
  
  const resources = [
    {
      field: 'CollaboratoreId',
      title: 'Collaboratori',
      name: 'Collaboratori',
      allowMultiple: true,
      dataSource: resources.map(resource => ({
        Id: resource.Id,
        Nome: resource.Nome,
        Colore: resource.Colore || '#000000',
        Immagine: resource.Immagine
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
      dataSource: commesse.map(commessa => ({
        Id: commessa.CommessaName,
        Nome: commessa.Descrizione,
        Colore: commessaColors[commessa.CommessaName] || '#000000'
      })),
      textField: 'Nome',
      idField: 'Id',
      colorField: 'Colore'
    }
  ];


  const handleResourceChange = async (selectedResources) => {
    setSelectedResources(selectedResources);
  
    if (selectedResources && selectedResources.length > 0) {
      const resourceIds = selectedResources.map(option => option.value);
  
      try {
        const response = await axios.post('http://localhost:4443/api/commesse-comuni', {
          collaboratoriIds: resourceIds
        });
        console.log('Risposta da commesse comuni:', response.data);
        const commesseComuni = response.data.map(commessa => ({
          value: commessa.CommessaName,
          label: commessa.CommessaName
        }));
        setSelectedCommesse(commesseComuni);  // Aggiorna solo con le commesse comuni
      } catch (error) {
        console.error('Errore nel caricamento delle commesse comuni:', error);
      }
    } else {
      setSelectedCommesse([]);
    }
  };
  
  
  const handleCommessaChange = (selectedOptions) => {
    setSelectedCommesse(selectedOptions);
  
    // Applica il filtro per il Gantt e lo Scheduler
    applyGanttFilter(selectedOptions);
    handleSchedulerDataChange(selectedOptions);
  };
  
  
  


  const getFilteredResources = () => {
    if (selectedResources.length === 0) return [];
    return resources.filter(resource => selectedResources.includes(resource.Id));
  };

  const getFilteredCommesse = () => {
    if (selectedCommesse.length === 0) return [];
    return commesse.filter(commessa => selectedCommesse.includes(commessa.CommessaName));
    console.log('Commesse filtrate per Scheduler:', getFilteredCommesse());
  };
  

  const onActionComplete = async (args) => {
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged') {
      const eventData = Array.isArray(args.data) ? args.data[0] : args.data;
      try {
        const response = await axios.post('http://localhost:4443/api/eventi', eventData);
        console.log('Evento salvato nel DB:', response.data);
      } catch (error) {
        console.error('Errore nel salvataggio dell\'evento:', error);
      }
    }
  };
  ;

  const resourceHeaderTemplate = (props) => {
    if (!props.resourceData) return null;
    const commessa = props.resourceData.Descrizione;
    if (commessa) {
      return (
        <div className="template-wrap">
          <div className="commessa-details">
            <div className="commessa-name">{commessa}</div>
          </div>
        </div>
      );
    }

    const resource = resources.find(resource => resource.Id === props.resourceData.Id);
    return (
      <div className="template-wrap">
        {resource && <img src={resource.Immagine} alt={resource.Nome} className="resource-image" />}
        <div className="resource-details">
          <div className="resource-name">{resource ? resource.Nome : ''}</div>
        </div>
      </div>
    );
  };

  const handleActionComplete = async (args) => {
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged') {
      const event = Array.isArray(args.data) ? args.data[0] : args.data;
      
      const newEvent = {
        Descrizione: event.Subject || 'No Description',
        Inizio: event.StartTime.toISOString(), // Converte in stringa per il DB
        Fine: event.EndTime.toISOString(), // Converte in stringa per il DB
        CommessaName: selectedCommesse[0]?.value || '', // Verifica che questo sia corretto
        IncaricatoId: selectedCollaboratore.map(c => c.value).join(','), // Deve essere una stringa separata da virgole
        Colore: commessaColors[selectedCommesse[0]?.value] || '#000000',
        Progresso: event.Progresso || 0,
        Dipendenza: event.Dipendenza || ''
      };
  
      try {
        const response = await axios.post('http://localhost:4443/api/eventi', newEvent);
        console.log('Evento salvato nel DB:', response.data);
      } catch (error) {
        console.error('Errore nel salvataggio dell\'evento:', error);
      }
    }
  };
  
  


  const monthEventTemplate = (props) => {
    const commessaName = Array.isArray(props.CommessaName) ? props.CommessaName[0] : props.CommessaName;
    const commessa = commesse.find(commessa => commessa.CommessaName === commessaName);

    const commessaText = commessa ? commessa.Descrizione : 'Nessuna commessa selezionata';
    const subjectText = props.Subject ? props.Subject : '';
    const color = commessaColors[commessaName] || '#000000';

    return (
      <div className="template-wrap" style={{ backgroundColor: color }}>
        <div className="subject">{`${commessaText} - ${subjectText}`}</div>
      </div>
    );
  };

  const handleViewChange = (args) => {
    setCurrentView(args.currentView);
  };

  const group = {
    allowGroupEdit: true,
    byGroupID: false,
    resources: ['Collaboratori', 'Commesse'], // Verifica che i nomi siano corretti
    groupOrder: 'Nome' // Rimuovi o verifica che esista nei dati delle risorse
  };
  

  const resourceOptions = [{ value: 'select-all', label: 'Select All' }, ...resources.map(resource => ({
    value: resource.Id,
    label: resource.Nome
  }))];

  const commessaOptions = [{ value: 'select-all', label: 'Select All' }, ...commesse.map(commessa => ({
    value: commessa.CommessaName,
    label: commessa.CommessaName
  }))];

  return (
    <div>
      <div className="filter-selectors">
        <Select
          isMulti
          options={resourceOptions}
          onChange={handleResourceChange}
          placeholder="Select Resources"
          className="filter-dropdown"
        />
<Select
  isMulti
  options={selectedCommesse}  // Dati delle commesse filtrate
  onChange={handleCommessaChange}  // Funzione di gestione della selezione
  placeholder="Select Commesse"
  className="filter-dropdown"
/>

      </div>
      <div className="scroll-container">
      <ScheduleComponent
  height='650px'
  selectedDate={new Date()}
  eventSettings={{ dataSource: scheduleData }}
  group={{ resources: ['Collaboratori'] }}
  resources={resources.map(collaboratore => ({
    text: collaboratore.Nome,
    id: collaboratore.Id,
    color: collaboratore.Colore,
    image: collaboratore.Immagine
  }))}
  onActionComplete={onActionComplete}
>
  <Inject services={[TimelineViews, Day, Week, WorkWeek, Month, Agenda]} />
</ScheduleComponent>

      </div>
    </div>
  );
};

export default Scheduler;
