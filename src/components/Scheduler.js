import React, { useState, useEffect } from 'react';
import { ScheduleComponent, Day, Week, WorkWeek, Month, Agenda, TimelineViews, Inject, TimelineMonth, ResourcesDirective, ResourceDirective } from '@syncfusion/ej2-react-schedule';
import Select from 'react-select';
import axios from 'axios';
import '../index.css';

const Scheduler = ({ data = [], onDataChange, commessaColors, commesse, resources }) => {
  const [modifiedData, setModifiedData] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);


// Scheduler.js
useEffect(() => {
  if (Array.isArray(data)) {
      const newData = data.map(event => {
          // Log di controllo per ogni evento
          console.log("Evento nel Scheduler:", event);

          return {
              ...event,
              StartTime: new Date(event.StartTime),
              EndTime: new Date(event.EndTime),
              Subject: event.Subject || 'Nessun titolo',
              CollaboratoreId: event.CollaboratoreId // Usa l'array dei collaboratori ID
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
      </div>

      {/* Scheduler component */}
      <ScheduleComponent
        height='650px'
        selectedDate={new Date()}
        eventSettings={{ dataSource: modifiedData }}
        group={{ resources: ['Collaboratori'] }}
        actionComplete={(args) => onDataChange(args)}
      >
<ResourcesDirective>
    <ResourceDirective
        field='CollaboratoreId'
        title='Collaboratori'
        name='Collaboratori'
        CommessaName ='CommessaName'
        allowMultiple={true}
        dataSource={resources.map(resource => ({
            Id: resource.Id,
            Nome: resource.Nome,
            Colore: resource.Colore,
            Immagine: resource.Immagine,
            CommessaName:resource.CommessaName
        }))}
        textField='Nome'
        idField='Id'
        colorField='Colore'
    />
</ResourcesDirective>

        <Inject services={[Day, Week, WorkWeek, Month, Agenda, TimelineViews, TimelineMonth]} />
      </ScheduleComponent>
    </div>
  );
};

export default Scheduler;
