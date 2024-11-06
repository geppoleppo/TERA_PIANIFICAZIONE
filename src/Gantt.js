// Gantt.js
import React, { useRef, useEffect } from 'react';
import { GanttComponent, Inject, Selection, Toolbar, DayMarkers, Edit, Filter, Sort } from '@syncfusion/ej2-react-gantt';
import '@syncfusion/ej2-base/styles/material.css';

const Gantt = ({ ganttData, schedulerData, updateScheduler }) => {
  const ganttRef = useRef(null);

  useEffect(() => {
    if (ganttRef.current) {
      // Esempio: aggiorna Gantt quando cambia schedulerData
      ganttRef.current.dataSource = ganttData;
    }
  }, [ganttData]);

  return (
    <div>
      <GanttComponent
        ref={ganttRef}
        dataSource={ganttData}
        allowSelection={true}
        allowSorting={true}
        taskFields={{
          id: 'TaskId',
          name: 'TaskName',
          startDate: 'StartDate',
          endDate: 'EndDate',
          duration: 'Duration',
          progress: 'Progress',
          dependency: 'Predecessor',
        }}
        height="500px"
        toolbar={['ExpandAll', 'CollapseAll']}
      >
        <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
      </GanttComponent>
    </div>
  );
};

export default Gantt;
