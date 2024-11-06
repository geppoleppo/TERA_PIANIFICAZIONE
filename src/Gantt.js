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
    if (args.requestType === 'save') {
      // Se l'evento esiste già, aggiorniamo. Altrimenti, aggiungiamo un nuovo evento
      if (args.action === 'edit') {
        onUpdateEvent(args.data);
      } else if (args.action === 'add') {
        onSaveEvent(args.data);
      }
    } else if (args.requestType === 'delete') {
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
        height="500px"
        toolbar={['ExpandAll', 'CollapseAll']}
      >
        <Inject services={[Selection, Toolbar, DayMarkers, Edit, Filter, Sort]} />
      </GanttComponent>
    </div>
  );
};

export default Gantt;
