// Scheduler.js
import React, { useState, useEffect } from 'react';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, TimelineViews, Inject, TimelineMonth, ResourcesDirective, ResourceDirective } from '@syncfusion/ej2-react-schedule';
import Select from 'react-select';
import axios from 'axios';
import '../index.css';

const Scheduler = ({ data = [], onDataChange, commessaColors, commesse, resources }) => {
  const [modifiedData, setModifiedData] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const newData = data.map(event => {
        // Verifica che StartTime e EndTime siano definiti, altrimenti imposta un valore di default
        const startTime = event.StartTime ? new Date(event.StartTime) : new Date();
        const endTime = event.EndTime ? new Date(event.EndTime) : new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minuti dopo

        return {
          ...event,
          StartTime: startTime,
          EndTime: endTime,
          Subject: event.Subject || 'Nessun titolo',
          CollaboratoreId: Array.isArray(event.CollaboratoreId)
            ? event.CollaboratoreId
            : event.CollaboratoreId ? [parseInt(event.CollaboratoreId, 10)] : [],
        };
      });

      setModifiedData(newData);
    } else {
      console.error("Data non è un array:", data);
      setModifiedData([]);
    }
  }, [data]);

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
    // Chiama la funzione che filtra i dati del Gantt qui, se necessario.
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
        //group={{ resources: ['Collaboratori', 'Commesse'] }}
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
