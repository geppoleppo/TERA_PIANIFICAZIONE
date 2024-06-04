import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';

const App = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [commesse, setCommesse] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        console.log("Fetching data from server...");
        try {
            const [commesseResponse, schedulerResponse, resourcesResponse] = await Promise.all([
                axios.get('http://localhost:3001/commesse'),
                axios.get('http://localhost:3001/schedulerData'), // Ecco dove viene chiamata la route
                axios.get('http://localhost:3001/collaboratori')
            ]);

            console.log("Data received from /commesse:", commesseResponse.data);
            console.log("Data received from /schedulerData:", schedulerResponse.data);
            console.log("Data received from /collaboratori:", resourcesResponse.data);

            const colors = commesseResponse.data.reduce((acc, commessa) => {
                acc[commessa.Id] = commessa.Colore;
                return acc;
            }, {});

            setCommesse(commesseResponse.data);
            setCommessaColors(colors);
            setScheduleData(schedulerResponse.data);
            setResources(resourcesResponse.data);
            // Assicurati di aggiornare i dati di Gantt corrispondenti
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchData();
}, []);


  const handleSchedulerDataChange = async (args) => {
    console.log('Scheduler Data Change:', args);
    let updatedScheduleData = [...scheduleData];

    if (args.requestType === 'eventCreated') {
      const newEvents = Array.isArray(args.data) ? args.data : [args.data];
      newEvents.forEach(async (newEvent) => {
        newEvent.Color = commessaColors[newEvent.CommessaId] || '#000000';
        updatedScheduleData = [...updatedScheduleData.filter(event => event.Id !== newEvent.Id), newEvent];
        setScheduleData(updatedScheduleData);
        updateGanttData(updatedScheduleData, resources);
      });
    } else if (args.requestType === 'eventChanged') {
      const updatedEvents = Array.isArray(args.data) ? args.data : [args.data];
      updatedEvents.forEach(async (updatedEvent) => {
        updatedEvent.Color = commessaColors[updatedEvent.CommessaId] || '#000000';
        updatedScheduleData = updatedScheduleData.map(event =>
          event.Id === updatedEvent.Id ? updatedEvent : event
        );
        setScheduleData(updatedScheduleData);
        updateGanttData(updatedScheduleData, resources);
      });
    } else if (args.requestType === 'eventRemoved') {
      const removedEventIds = Array.isArray(args.data) ? args.data.map(event => event.Id) : [args.data.Id];
      updatedScheduleData = updatedScheduleData.filter(event => !removedEventIds.includes(event.Id));
      setScheduleData(updatedScheduleData);
      updateGanttData(updatedScheduleData, resources);
    }
  };

  const handleGanttDataChange = async (args) => {
    console.log('Gantt Data Change:', args);
    let updatedGanttData = [...ganttData];
  
    if (args.requestType === 'save' || args.requestType === 'delete') {
      const updatedTasks = Array.isArray(args.data) ? args.data : [args.data];
  
      for (const updatedTask of updatedTasks) {
        if (typeof updatedTask === 'object' && updatedTask !== null) {
          if (args.requestType === 'save') {
            updatedTask.Color = commessaColors[updatedTask.CommessaId] || '#000000';
            console.log('Updated Task:', updatedTask);
            updatedGanttData = updatedGanttData.map(task =>
              task.TaskID === updatedTask.TaskID ? { ...task, ...updatedTask } : task
            );
          } else if (args.requestType === 'delete') {
            updatedGanttData = updatedGanttData.filter(task => task.TaskID !== updatedTask.TaskID);
          }
        }
      }
  
      setGanttData(updatedGanttData);
      updateScheduleData(updatedGanttData, resources);
    }
  };
  

  const updateGanttData = (scheduleData, resources) => {
    const updatedGanttData = scheduleData.map(event => {
      const commessa = commesse.find(c => c.Id === event.CommessaId);
      const resourceIds = event.ResourceIDs;
      const resourceNames = resourceIds ? resourceIds.map(id => resources.find(r => r.Id === id)?.Nome).filter(name => name) : [];
      return {
        TaskID: event.Id,
        TaskName: event.Subject,
        StartDate: event.StartTime,
        EndDate: event.EndTime,
        Predecessor: event.Predecessor || '',
        CommessaId: event.CommessaId,
        CommessaName: commessa ? commessa.Descrizione : 'N/A',
        Color: event.Color,
        ResourceIDs: resourceIds,
        ResourceNames: resourceNames.join(', ') // Join resource names for display
      };
    });
    console.log('Updated Gantt Data:', updatedGanttData);
    setGanttData(updatedGanttData);
  };

  const updateScheduleData = (ganttData, resources) => {
    const updatedScheduleData = ganttData.map(task => {
      const commessa = commesse.find(c => c.Id === task.CommessaId);
      return {
        Id: task.TaskID,
        Subject: task.TaskName,
        StartTime: task.StartDate,
        EndTime: task.EndDate,
        Predecessor: task.Predecessor,
        CommessaId: task.CommessaId,
        CommessaName: commessa ? commessa.Descrizione : 'N/A',
        Color: task.Color,
        ResourceIDs: task.ResourceIDs
      };
    });

    console.log('Updated Schedule Data from Gantt:', updatedScheduleData);

    const finalScheduleData = updatedScheduleData.map(task => {
      const scheduleEvent = scheduleData.find(event => event.Id === task.Id);
      return scheduleEvent ? { ...scheduleEvent, ...task } : task;
    });

    updatedScheduleData.forEach(task => {
      if (!finalScheduleData.find(event => event.Id === task.Id)) {
        finalScheduleData.push(task);
      }
    });

    console.log('Final Schedule Data:', finalScheduleData);
    setScheduleData(finalScheduleData);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={handleSchedulerDataChange} commessaColors={commessaColors} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} commessaColors={commessaColors} commesse={commesse} resources={resources} />
    </div>
  );
};

export default App;
