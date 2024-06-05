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
                axios.get('http://localhost:3001/Eventi'), // Ecco dove viene chiamata la route
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
        console.log("Schedule Data set:", scheduleData);
        console.log("Gantt Data set:", ganttData);
    };

    fetchData();
}, []);

useEffect(() => {
  console.log("Updated Scheduler Data:", scheduleData);
}, [scheduleData]);

const handleSchedulerDataChange = async (args) => {
  console.log('Scheduler Data Change:', args);
  let updatedScheduleData = [...scheduleData];

  args.data.forEach(async (eventData) => {
    const { Id, Subject, StartTime, EndTime, IsAllDay, CommessaId, Color, ResourceIDs } = eventData;
    const url = Id ? `/eventi/${Id}` : '/eventi';
    const method = Id ? 'put' : 'post';
    const data = {
      subject: Subject,
      startTime: StartTime,
      endTime: EndTime,
      isAllDay: IsAllDay ? 1 : 0, // Converte il booleano in intero
      commessaId: CommessaId,
      color: Color || '#000000',
      resourceIDs: ResourceIDs ? ResourceIDs.join(',') : ''
    };

    try {
      const response = await axios({ method, url: `http://localhost:3001${url}`, data });
      console.log('API response:', response);
      if (method === 'post') {
        eventData.Id = response.data.id; // Assume new ID is returned
      }
      updateSchedulerDataOnSuccess(eventData, args.requestType);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  });
};


const updateSchedulerDataOnSuccess = (updatedEvent, requestType) => {
  let updatedEvents = [...scheduleData];
  if (requestType === 'eventCreated') {
    updatedEvents.push(updatedEvent);
  } else if (requestType === 'eventChanged') {
    updatedEvents = updatedEvents.map(event => event.Id === updatedEvent.Id ? updatedEvent : event);
  }
  setScheduleData(updatedEvents);
  updateGanttData(updatedEvents, resources);
};


const handleGanttDataChange = async (args) => {
  console.log('Gantt Data Change:', args);
  let updatedGanttData = [...ganttData];

  args.data.forEach(async (taskData) => {
    const { TaskID, TaskName, StartDate, EndDate, isAllDay, CommessaId, Color, ResourceIDs } = taskData;
    const url = TaskID ? `/eventi/${TaskID}` : '/eventi';
    const method = TaskID ? 'put' : 'post';
    const data = {
      subject: TaskName,
      startTime: StartDate,
      endTime: EndDate,
      isAllDay: IsAllDay ? 1 : 0, // Converte il booleano in intero
      commessaId: CommessaId,
      color: Color || '#000000',
      resourceIDs: ResourceIDs ? ResourceIDs.join(',') : ''
    };

    try {
      const response = await axios({ method, url: `http://localhost:3001${url}`, data });
      console.log('API response:', response);
      if (method === 'post') {
        taskData.TaskID = response.data.id;
      }
      updateGanttDataOnSuccess(taskData, args.requestType);
    } catch (error) {
      console.error('Failed to update Gantt:', error);
    }
  });
};

const updateGanttDataOnSuccess = (updatedTask, requestType) => {
  let updatedTasks = [...ganttData];
  if (requestType === 'save') {
    updatedTasks = updatedTasks.map(task => task.TaskID === updatedTask.TaskID ? updatedTask : task);
  } else if (requestType === 'delete') {
    updatedTasks = updatedTasks.filter(task => task.TaskID !== updatedTask.TaskID);
  }
  setGanttData(updatedTasks);
  updateScheduleData(updatedTasks, resources);
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
