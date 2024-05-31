import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import { extend } from '@syncfusion/ej2-base';
//import commesse, { getCommessaColor } from './components/commesse';


const initialData = []; // Rimuovi le attività predefinite

const App = () => {
  const [scheduleData, setScheduleData] = useState(extend([], initialData, null, true));
  const [ganttData, setGanttData] = useState(initialData);

  useEffect(() => {
    console.log('Initial Gantt Data:', ganttData);
  }, []);

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    let updatedScheduleData = [...scheduleData];
  
    const updateData = (data, isCreation = false) => {
      return data.map(item => {
        if (isCreation || item.Id === args.data.Id) {
          return { ...item, ...args.data };
        }
        return item;
      });
    };
  
    switch (args.requestType) {
      case 'eventCreated':
        updatedScheduleData = updateData(updatedScheduleData, true);
        break;
      case 'eventChanged':
        updatedScheduleData = updateData(updatedScheduleData);
        break;
      case 'eventRemoved':
        updatedScheduleData = updatedScheduleData.filter(event => !args.data.map(data => data.Id).includes(event.Id));
        break;
      default:
        break;
    }
  
    setScheduleData(updatedScheduleData);
  
    const updatedGanttData = updatedScheduleData.map(event => ({
      TaskID: event.Id,
      TaskName: event.Subject,
      StartDate: event.StartTime,
      EndDate: event.EndTime,
      CommessaId: event.CommessaId
    }));
  
    setGanttData(updatedGanttData);
  };
  
  const handleGanttDataChange = (args) => {
    console.log('Gantt Data Change:', args);
    let updatedGanttData = [...ganttData];
  
    const updateData = (data, isCreation = false) => {
      return data.map(task => {
        if (isCreation || task.TaskID === args.data.TaskID) {
          return { ...task, ...args.data };
        }
        return task;
      });
    };
  
    switch (args.requestType) {
      case 'save':
        updatedGanttData = updateData(updatedGanttData, true);
        break;
      case 'delete':
        updatedGanttData = updatedGanttData.filter(task => !args.data.map(data => data.TaskID).includes(task.TaskID));
        break;
      default:
        break;
    }
  
    setGanttData(updatedGanttData);
  
    const updatedScheduleData = updatedGanttData.map(task => ({
      Id: task.TaskID,
      Subject: task.TaskName,
      StartTime: task.StartDate,
      EndDate: task.EndDate,
      CommessaId: task.CommessaId
    }));
  
    setScheduleData(updatedScheduleData);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={handleSchedulerDataChange} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} />
    </div>
  );
};

export default App;
