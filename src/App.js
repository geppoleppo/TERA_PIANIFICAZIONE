import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';
import { extend } from '@syncfusion/ej2-base';

const App = () => {
  const [scheduleData, setScheduleData] = useState(extend([], [], null, true));
  const [ganttData, setGanttData] = useState([]);
  const [commessaList, setCommessaList] = useState([]);

  // Fetch commessa list from the server
  const fetchCommesse = async () => {
    try {
      const response = await axios.get('http://localhost:3001/commesse');
      setCommessaList(response.data);
    } catch (error) {
      console.error('Error fetching commesse:', error);
    }
  };

  useEffect(() => {
    fetchCommesse();
  }, []);

  // Effetto per sincronizzare i dati iniziali o gli aggiornamenti tra Gantt e Scheduler
  useEffect(() => {
    const ganttDataFromScheduler = scheduleData.map(event => ({
      TaskID: event.Id,
      TaskName: event.Subject,
      StartDate: event.StartTime,
      EndDate: event.EndTime,
      CommessaId: event.CommessaId
    }));
    setGanttData(ganttDataFromScheduler);
  }, [scheduleData]);

  const updateData = (data, changes, isTaskData = false) => data.map(item => {
    const itemId = isTaskData ? item.TaskID : item.Id;
    const changedItem = changes.find(change => change.TaskID === itemId || change.Id === itemId);
    return changedItem ? { ...item, ...changedItem } : item;
  });

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    let updatedScheduleData = [...scheduleData];

    switch (args.requestType) {
      case 'eventCreated':
      case 'eventChanged':
        updatedScheduleData = updateData(updatedScheduleData, Array.isArray(args.data) ? args.data : [args.data]);
        break;
      case 'eventRemoved':
        updatedScheduleData = updatedScheduleData.filter(event => !args.data.map(data => data.Id).includes(event.Id));
        break;
      default:
        break;
    }

    setScheduleData(updatedScheduleData);
  };

  const handleGanttDataChange = (args) => {
    console.log('Gantt Data Change:', args);
    let updatedGanttData = [...ganttData];

    switch (args.requestType) {
      case 'save':
        updatedGanttData = updateData(updatedGanttData, Array.isArray(args.data) ? args.data : [args.data], true);
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
      EndTime: task.EndDate,
      CommessaId: task.CommessaId
    }));

    setScheduleData(updatedScheduleData);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={handleSchedulerDataChange} commessaList={commessaList} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} commessaList={commessaList} />
    </div>
  );
};

export default App;
