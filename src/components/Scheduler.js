import React, { useState, useEffect } from 'react';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, TimelineViews, Inject, TimelineMonth, ResourcesDirective, ResourceDirective } from '@syncfusion/ej2-react-schedule';
import Select from 'react-select';
import axios from 'axios';
import '../index.css';

const Scheduler = ({ data, onDataChange, commessaColors, commesse, resources, applyGanttFilter }) => {
  const [modifiedData, setModifiedData] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);

  useEffect(() => {
    // Assicuriamoci che i dati degli eventi siano formattati correttamente
    const newData = data.map(event => ({
      ...event,
      StartTime: new Date(event.StartTime),
      EndTime: new Date(event.EndTime),
      Subject: event.Subject || 'Nessun titolo',
    }));
    setModifiedData(newData);
  }, [data]);

  // Funzione per il cambio di risorsa
  const handleResourceChange = async (selectedResources) => {
    setSelectedResources(selectedResources);

    if (selectedResources && selectedResources.length > 0) {
      const resourceIds = selectedResources.map(option => option.value);

      try {
        const response = await axios.post('http://localhost:4443/api/commesse-comuni', {
          collaboratoriIds: resourceIds
        });
        const commesseComuni = response.data.map(commessa => ({
          value: commessa.CommessaName,
          label: commessa.CommessaName
        }));
        setSelectedCommesse(commesseComuni);
      } catch (error) {
        console.error('Errore nel caricamento delle commesse comuni:', error);
      }
    } else {
      setSelectedCommesse([]);
    }
  };

  const handleCommessaChange = (selectedOptions) => {
    setSelectedCommesse(selectedOptions);
    applyGanttFilter(selectedOptions);
  };

  return (
    <div>
      {/* Filtri per selezione risorse e commesse */}
      <div className="filter-selectors">
        <Select
          isMulti
          options={resources.map(resource => ({ value: resource.Id, label: resource.Nome }))}
          onChange={handleResourceChange}
          placeholder="Seleziona Collaboratori"
          className="filter-dropdown"
        />
        <Select
          isMulti
          options={commesse.map(commessa => ({ value: commessa.CommessaName, label: commessa.CommessaName }))}
          onChange={handleCommessaChange}
          placeholder="Seleziona Commesse"
          className="filter-dropdown"
        />
      </div>

      {/* Scheduler component */}
      <ScheduleComponent
        height='650px'
        selectedDate={new Date()}
        eventSettings={{ dataSource: modifiedData }}
        group={{ resources: ['Collaboratori', 'Commesse'] }}
        actionComplete={(args) => onDataChange(args)}
      >
        <ResourcesDirective>
          <ResourceDirective
            field='CollaboratoreId'
            title='Collaboratori'
            name='Collaboratori'
            allowMultiple={true}
            dataSource={resources.map(resource => ({
              Id: resource.Id,
              Nome: resource.Nome,
              Colore: resource.Colore,
              Immagine: resource.Immagine
            }))}
            textField='Nome'
            idField='Id'
            colorField='Colore'
          />
          <ResourceDirective
            field='CommessaName'
            title='Commesse'
            name='Commesse'
            allowMultiple={true}
            dataSource={commesse.map(commessa => ({
              CommessaName: commessa.CommessaName,
              Descrizione: commessa.Descrizione,
              Colore: commessaColors[commessa.CommessaName] || '#000000'
            }))}
            textField='CommessaName'
            idField='CommessaName'
            colorField='Colore'
          />
        </ResourcesDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, TimelineViews, TimelineMonth]} />
      </ScheduleComponent>
    </div>
  );
};

export default Scheduler;
