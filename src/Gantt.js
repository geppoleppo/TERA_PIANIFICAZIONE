import React, { useRef } from 'react';
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

const Gantt = ({ ganttData, onSaveEvent, onUpdateEvent, onDeleteEvent }) => {
  const ganttRef = useRef(null);

  const onActionComplete = (args) => {
    console.log("Azione completata nel Gantt:", args);
  
      if (args.action === 'edit') {
        console.log("Modifica evento:", args.data);
        onUpdateEvent(args.data);
      } else if (args.action === 'add') {
        console.log("Aggiunta evento:", args.data);
        onSaveEvent(args.data);
      }
    else if (args.requestType === 'delete') {
      console.log("Eliminazione evento:", args.data[0].Id);
      onDeleteEvent(args.data[0].Id);
    }
  };

  return (
    <div>
      <GanttComponent
        ref={ganttRef}
        dataSource={ganttData}
        allowSelection={true}
        allowSorting={true}
        actionComplete={onActionComplete}
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
