import React, { useEffect } from 'react';
import {
  GanttComponent,
  Inject,
  Selection,
  Toolbar,
  DayMarkers,
  Edit,
  Filter,
  Sort
} from '@syncfusion/ej2-react-gantt';
import '@syncfusion/ej2-base/styles/material.css';

const Gantt = ({ ganttData, reloadEvents }) => {
  useEffect(() => {
    // Carica dati ogni volta che ganttData cambia
    console.log("Dati aggiornati per il Gantt:", ganttData);
  }, [ganttData]);

  return (
    <div>
      <GanttComponent
        dataSource={ganttData}
        allowSelection={true}
        allowSorting={true}
        taskFields={{
          id: 'Id',
          name: 'Subject',
          startDate: 'StartTime',
          endDate: 'EndTime',
          progress: 'Progress'
        }}
        editSettings={{
          allowAdding: 'true',
          allowEditing: 'true',
          allowDeleting: 'true',
          allowTaskbarEditing: 'true',
          showDeleteConfirmDialog: 'true'
      }}
      toolbar={ ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent']}
            
        height="500px"
      
      >
        <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
      </GanttComponent>
    </div>
  );
};

export default Gantt;
