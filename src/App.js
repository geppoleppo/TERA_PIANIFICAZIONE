import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import { extend } from '@syncfusion/ej2-base';

const App = () => {
  const [scheduleData, setScheduleData] = useState(extend([], [], null, true));
  const [ganttData, setGanttData] = useState([]);

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

  const handleSchedulerDataChange = (args) => {
    console.log('Scheduler Data Change:', args);
    let updatedScheduleData = [...scheduleData];
    const eventData = Array.isArray(args.data) ? args.data : [args.data];

    switch (args.requestType) {
      case 'eventCreated':
      case 'eventChanged':
        updatedScheduleData = updateData(updatedScheduleData, eventData);
        break;
      case 'eventRemoved':
        updatedScheduleData = updatedScheduleData.filter(event => !eventData.map(data => data.Id).includes(event.Id));
        break;
      default:
        break;
    }

    setScheduleData(updatedScheduleData);
  };

  const handleGanttDataChange = (args) => {
    console.log('Gantt Data Change:', args);
    let updatedGanttData = [...ganttData];
    const taskData = Array.isArray(args.data) ? args.data : [args.data];

    switch (args.requestType) {
      case 'save':
      case 'delete':
        updatedGanttData = updateData(updatedGanttData, taskData, true);
        break;
      default:
        break;
    }

    setGanttData(updatedGanttData);
  };

  return (
    <div className="app-container">
      <Scheduler data={scheduleData} onDataChange={handleSchedulerDataChange} />
      <Gantt data={ganttData} onDataChange={handleGanttDataChange} />
    </div>
  );
};

const updateData = (data, changes, isTaskData = false) => data.map(item => {
  const itemId = isTaskData ? item.TaskID : item.Id;
  const changedItem = changes.find(change => change.Id === itemId);
  return changedItem ? { ...item, ...changedItem } : item;
});

export default App;
