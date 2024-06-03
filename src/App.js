import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';

const App = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});

  useEffect(() => {
    const fetchCommesse = async () => {
      try {
        const response = await axios.get('http://localhost:3001/commesse');
        const colors = response.data.reduce((acc, commessa) => {
          acc[commessa.Id] = commessa.Colore;
          return acc;
        }, {});
        setCommessaColors(colors);
        console.log('commessaColors:', colors); // Log the commessaColors object
      } catch (error) {
        console.error('Error fetching commesse:', error);
      }
    };

    fetchCommesse();
  }, []);

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    let updatedScheduleData = [...scheduleData];

    // Gestione della creazione e modifica degli eventi
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged') {
      args.data.forEach(event => {
        event.Color = commessaColors[event.CommessaId] || '#000000';  // Imposta il colore basato su CommessaId
        if (args.requestType === 'eventCreated' && !updatedScheduleData.find(e => e.Id === event.Id)) {
          updatedScheduleData.push(event);  // Aggiungi l'evento se è nuovo
        } else {
          updatedScheduleData = updatedScheduleData.map(e => e.Id === event.Id ? {...e, ...event} : e);
        }
      });
    } else if (args.requestType === 'eventRemoved') {
      // Rimozione degli eventi
      const idsToRemove = args.data.map(event => event.Id);
      updatedScheduleData = updatedScheduleData.filter(event => !idsToRemove.includes(event.Id));
    }

    console.log('Updated Schedule Data:', updatedScheduleData);
    setScheduleData(updatedScheduleData);
    setGanttData(updatedScheduleData.map(event => ({...event, TaskID: event.Id})));  // Mappa gli eventi di Schedule per Gantt
};

const handleGanttDataChange = (args) => {
    console.log('Gantt Data Change:', args);
    let updatedGanttData = [...ganttData];

    // Gestione della creazione e modifica degli eventi
    args.data.forEach(event => {
      event.Color = commessaColors[event.CommessaId] || '#000000';  // Imposta il colore basato su CommessaId
      if (args.requestType === 'save' && !updatedGanttData.find(e => e.TaskID === event.TaskID)) {
        updatedGanttData.push(event);  // Aggiungi l'evento se è nuovo
      } else {
        updatedGanttData = updatedGanttData.map(e => e.TaskID === event.TaskID ? {...e, ...event} : e);
      }
    });

    if (args.requestType === 'delete') {
      // Rimozione degli eventi
      const idsToRemove = args.data.map(event => event.TaskID);
      updatedGanttData = updatedGanttData.filter(event => !idsToRemove.includes(event.TaskID));
    }

    console.log('Updated Gantt Data after change:', updatedGanttData);
    setGanttData(updatedGanttData);
    setScheduleData(updatedGanttData.map(event => ({...event, Id: event.TaskID})));  // Mappa gli eventi di Gantt per Schedule
};


  const onDataChange = (args) => {
    console.log('Data Change:', args);
    if (args.requestType === 'eventChanged') {
      if (Array.isArray(args.data)) {
        args.data.forEach(event => {
          if (!event.CommessaId && event.PreviousData) {
            event.CommessaId = event.PreviousData.CommessaId;
            console.log(`Reassigned CommessaId for Event: ${JSON.stringify(event)}`);
          }
        });
      } else {
        if (!args.data.CommessaId && args.data.PreviousData) {
          args.data.CommessaId = args.data.PreviousData.CommessaId;
          console.log(`Reassigned CommessaId for Event: ${JSON.stringify(args.data)}`);
        }
      }
    }
    handleSchedulerDataChange(args);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={onDataChange} commessaColors={commessaColors} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} commessaColors={commessaColors} />
    </div>
  );
};

export default App;
