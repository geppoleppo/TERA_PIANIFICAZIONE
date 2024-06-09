import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ScheduleComponent, Day, WorkWeek, Month, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
import '../index.css';

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

const Scheduler = ({ data, onDataChange, commessaColors }) => {
  const [resources, setResources] = useState([]);
  const [commesse, setCommesse] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [currentView, setCurrentView] = useState('Month'); // Set default view to 'Month'

  useEffect(() => {
    // Simulate fetching static data for resources and commesse
    setResources([
      { Id: 1, Nome: 'Risorsa 1', Colore: '#ff0000', Immagine: '' },
      { Id: 2, Nome: 'Risorsa 2', Colore: '#00ff00', Immagine: '' },
    ]);
    setCommesse([
      { Id: 1, Descrizione: 'Commessa 1', Colore: '#ff0000' },
      { Id: 2, Descrizione: 'Commessa 2', Colore: '#00ff00' },
    ]);
  }, []);

  const handleResourceChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.some(option => option.value === 'select-all')) {
      if (selectedOptions.length === 1) {
        setSelectedResources(resources.map(resource => resource.Id));
      } else {
        setSelectedResources([]);
      }
    } else {
      setSelectedResources(selectedOptions ? selectedOptions.map(option => option.value) : []);
    }
  };

  const handleCommessaChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.some(option => option.value === 'select-all')) {
      if (selectedOptions.length === 1) {
        setSelectedCommesse(commesse.map(commessa => commessa.Id));
      } else {
        setSelectedCommesse([]);
      }
    } else {
      setSelectedCommesse(selectedOptions ? selectedOptions.map(option => option.value) : []);
    }
  };

  const getFilteredResources = () => {
    if (selectedResources.length === 0) return [];
    return resources.filter(resource => selectedResources.includes(resource.Id));
  };

  const getFilteredCommesse = () => {
    if (selectedCommesse.length === 0) return [];
    return commesse.filter(commessa => selectedCommesse.includes(commessa.Id));
  };

  const onActionComplete = (args) => {
    console.log('Action Start: ', args);
  
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
      if (args.data) {
        if (Array.isArray(args.data)) {
          args.data.forEach(event => {
            if (args.requestType === 'eventCreated') {
              // Quando un evento viene creato
              event.CommessaId = Array.isArray(event.CommessaId) ? event.CommessaId[0] : event.CommessaId; // Assicurati che CommessaId non venga perso
            } else if (args.requestType === 'eventChanged') {
              // Quando un evento viene trascinato o modificato
              event.CommessaId = Array.isArray(event.CommessaId) ? event.CommessaId[0] : event.CommessaId; // Assicurati che CommessaId non venga perso
            }
            event.Color = commessaColors[event.CommessaId] || '#000000';
            console.log('Event After Change: ', event);
          });
        } else {
          if (args.requestType === 'eventCreated') {
            // Quando un evento viene creato
            args.data.CommessaId = Array.isArray(args.data.CommessaId) ? args.data.CommessaId[0] : args.data.CommessaId; // Assicurati che CommessaId non venga perso
          } else if (args.requestType === 'eventChanged') {
            // Quando un evento viene trascinato o modificato
            args.data.CommessaId = Array.isArray(args.data.CommessaId) ? args.data.CommessaId[0] : args.data.CommessaId; // Assicurati che CommessaId non venga perso
          }
          args.data.Color = commessaColors[args.data.CommessaId] || '#000000';
          console.log('Event After Change: ', args.data);
        }
      }
      onDataChange(args);
    }
    console.log('Action End: ', args);
  };
  
  const resourceHeaderTemplate = (props) => {
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

  const monthEventTemplate = (props) => {
    console.log('Event props:', props);
    console.log('Commesse array:', commesse);

    // Controlla se props.CommessaId è un array o un singolo valore e gestiscilo di conseguenza
    const commessaId = Array.isArray(props.CommessaId) ? props.CommessaId[0] : props.CommessaId;
    const commessa = commesse.find(commessa => commessa.Id === commessaId);

    const commessaText = commessa ? commessa.Descrizione : 'Nessuna commessa selezionata'; 
    const subjectText = props.Subject ? props.Subject : '';
    const color = commessaColors[commessaId] || '#000000'; // Use color from state

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
    resources: ['Conferences', 'Commesse']
  };

  const resourceOptions = [{ value: 'select-all', label: 'Select All' }, ...resources.map(resource => ({
    value: resource.Id,
    label: resource.Nome
  }))];

  const commessaOptions = [{ value: 'select-all', label: 'Select All' }, ...commesse.map(commessa => ({
    value: commessa.Id,
    label: commessa.Descrizione
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
          options={commessaOptions}
          onChange={handleCommessaChange}
          placeholder="Select Commesse"
          className="filter-dropdown"
        />
      </div>
      <div className="scroll-container"> {/* Aggiungi la classe per lo scorrimento */}
        <ScheduleComponent
          cssClass='group-editing'
          width='100%'
          height='650px'
          selectedDate={new Date()}
          currentView={currentView} // Set default view to 'Month'
          locale='it'  // Set locale to Italian
          dateFormat='dd/MM/yyyy'  // Set date format
          resourceHeaderTemplate={resourceHeaderTemplate}
          eventSettings={{
            dataSource: data, // Usa i dati passati come props
            fields: {
              subject: { title: 'Task', name: 'Subject', default: '' },
              description: { title: 'Summary', name: 'Description' },
              startTime: { title: 'From', name: 'StartTime' },
              endTime: { title: 'To', name: 'EndTime' },
              color: { name: 'Color' },
              IncaricatoId: { title: 'Incaricato', name: 'IncaricatoId', validation: { required: true } },
              commessaId: { title: 'Commessa', name: 'CommessaId', validation: { required: true } }
            },
            template: monthEventTemplate, // Aggiunto qui per assicurarsi che il template sia usato
          }}
          rowAutoHeight={true} // Enable row auto height
          group={group}
          actionComplete={onActionComplete}
          viewChanged={handleViewChange}
        >
          <ViewsDirective>
            <ViewDirective option='Day' allowVirtualScrolling={true} />
            <ViewDirective option='WorkWeek' allowVirtualScrolling={true} />
            <ViewDirective option='Month' allowVirtualScrolling={true} eventTemplate={monthEventTemplate} />
            <ViewDirective option='TimelineMonth' allowVirtualScrolling={true} interval={3} /> {/* Copre 3 mesi */}
          </ViewsDirective>
          <ResourcesDirective>
            <ResourceDirective
              field='IncaricatoId'
              title='Attendees'
              name='Conferences'
              allowMultiple={true}
              dataSource={getFilteredResources()}
              textField='Nome'
              idField='Id'
              colorField='Colore'
            />
            <ResourceDirective
              field='CommessaId'
              title='Commessa'
              name='Commesse'
              allowMultiple={false}
              dataSource={getFilteredCommesse()}
              textField='Descrizione'
              idField='Id'
              colorField='Colore'
            />
          </ResourcesDirective>
          <Inject services={[Day, WorkWeek, Month, TimelineViews, TimelineMonth, Resize, DragAndDrop]} />
        </ScheduleComponent>
      </div>
    </div>
  );
};

export default Scheduler;
