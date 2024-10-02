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

const Scheduler = ({ data, onDataChange, commessaColors, commesse, resources, selectedResources = [], selectedCommesse = [] }) => {
  console.log("Scheduler inizializzato con i seguenti dati:");
  console.log("Data:", data);
  console.log("Resources:", resources);
  console.log("Selected Resources:", selectedResources);
  console.log("Selected Commesse:", selectedCommesse);
  console.log("Commesse ricevute dal componente Scheduler:", commesse);


  //const [selectedResources, setSelectedResources] = useState([]);
  //const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [currentView, setCurrentView] = useState('Month'); 
  const [modifiedData, setModifiedData] = useState([]);

  useEffect(() => {
    const newData = data.map(event => ({
      ...event,
      IncaricatoId: Array.isArray(event.IncaricatoId) ? event.IncaricatoId.map(id => parseInt(id)) : event.IncaricatoId
    }));
    setModifiedData(newData);
  }, [data]);

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
        setSelectedCommesse(commesse.map(commessa => commessa.CommessaName));
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
  
  console.log("Selected Commesse:", selectedCommesse);
  console.log("Tutte le Commesse:", commesse);
  
  const getFilteredCommesse = () => {
    if (commesse.length === 0) return [];
  
    // Verifica se esiste il campo corretto nelle commesse
    return commesse.filter(commessa => {
      console.log("Commessa analizzata:", commessa);  // Mostra la struttura della commessa
      const commessaName = commessa.label;  // Prova altri nomi comuni
      return selectedCommesse.some(sel => {
        const selValueNormalized = sel.value.trim().toLowerCase();
        const commessaNameNormalized = commessaName ? commessaName.trim().toLowerCase() : "";
        console.log(`Comparazione normalizzata: ${selValueNormalized} === ${commessaNameNormalized}`);
        return selValueNormalized === commessaNameNormalized;
      });
    });
  };
  
  console.log("Commesse filtrate:", getFilteredCommesse());

  const onActionComplete = (args) => {
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
      if (args.data) {
        const events = Array.isArray(args.data) ? args.data : [args.data];
        events.forEach(event => {
          event.CommessaName = Array.isArray(event.CommessaName) ? event.CommessaName[0] : event.CommessaName;
          event.Color = commessaColors[event.CommessaName] || '#000000';
        });
      }
      onDataChange(args);
    }
  };

  const resourceHeaderTemplate = (props) => {
    if (!props.resourceData) return null;
  
    // Se la commessa ha un campo 'label', mostralo
    const commessaName = props.resourceData.label;
  
    if (commessaName) {
      return (
        <div className="template-wrap">
          <div className="commessa-details">
            <div className="commessa-name">{commessaName}</div>
          </div>
        </div>
      );
    }
  
    // Visualizza i collaboratori (risorse)
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
    const commessaName = Array.isArray(props.CommessaName) ? props.CommessaName[0] : props.CommessaName;
  
    // Trova la commessa nel tuo array di commesse
    const commessa = commesse.find(c => c.value === commessaName);
  
    const commessaText = commessa ? commessa.label : 'Nessuna commessa selezionata';
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
    resources: ['Resources', 'Commesse']
    
  };

  console.log("Risorse passate al Scheduler:", getFilteredResources());
  console.log("Commesse passate al Scheduler:", getFilteredCommesse());

  const resourceOptions = [{ value: 'select-all', label: 'Select All' }, ...resources.map(resource => ({
    value: resource.Id,
    label: resource.Nome
  }))];

  const commessaOptions = [{ value: 'select-all', label: 'Select All' }, ...commesse.map(commessa => ({
    value: commessa.CommessaName,
    label: commessa.Descrizione
  }))];

  return (
    <div>
      <div className="filter-selectors">


      </div>
      <div className="scroll-container">
        <ScheduleComponent
          cssClass='group-editing'
          width='100%'
          height='650px'
          selectedDate={new Date()}
          currentView={currentView}
          locale='it'
          dateFormat='dd/MM/yyyy'
          resourceHeaderTemplate={resourceHeaderTemplate}
          
          eventSettings={{
            dataSource: modifiedData,
            fields: {
              id: 'Id',
              subject: { title: 'Task', name: 'Subject', default: '' },
              description: { title: 'Summary', name: 'Description' },
              startTime: { title: 'From', name: 'StartTime' },
              endTime: { title: 'To', name: 'EndTime' },
              color: { name: 'Color' },
              IncaricatoId: { title: 'Incaricato', name: 'IncaricatoId', validation: { required: true } },
              commessaName: { title: 'Commessa', name: 'CommessaName', validation: { required: true } }
            },
            template: monthEventTemplate,
          }}
          rowAutoHeight={true}
          group={group}
          actionComplete={onActionComplete}
          viewChanged={handleViewChange}
          
        >
          <ViewsDirective>
            <ViewDirective option='Day' allowVirtualScrolling={true} />
            <ViewDirective option='WorkWeek' allowVirtualScrolling={true} />
            <ViewDirective option='Month' allowVirtualScrolling={true} eventTemplate={monthEventTemplate} />
            <ViewDirective option='TimelineMonth' allowVirtualScrolling={true} interval={3} />
          </ViewsDirective>
          <ResourcesDirective>
  <ResourceDirective
    field='IncaricatoId'
    title='Attendees'
    name='Resources'
    allowMultiple={true}
    dataSource={getFilteredResources()}  // Usa i collaboratori filtrati
    textField='Nome'
    idField='Id'
    colorField='Colore'
  />
  <ResourceDirective
  field='CommessaName'
  title='Commessa'
  name='Commesse'
  allowMultiple={false}
  dataSource={getFilteredCommesse()}  // Usa le commesse filtrate
  textField='label'                   // Usa il campo 'label' per mostrare il nome della commessa
  idField='value'                     // Usa il campo 'value' come identificatore della commessa
  colorField='color'                  // Colore della commessa
/>
</ResourcesDirective>

          <Inject services={[Day, WorkWeek, Month, TimelineViews, TimelineMonth, Resize, DragAndDrop]} />
        </ScheduleComponent>
      </div>
    </div>
  );
};

export default Scheduler;
