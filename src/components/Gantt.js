import React, { useEffect } from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar, RowDD } from '@syncfusion/ej2-react-gantt';

const Gantt = ({ data, onDataChange, commessaColors }) => {

  useEffect(() => {
    console.log('Gantt component mounted');
    console.log('commessaColors in Gantt:', commessaColors); // Log the commessaColors object
    console.log('data in Gantt:', data); // Log the data passed to Gantt
  }, [data, commessaColors]);

  const getCommessaColor = (commessaId) => {
    const color = commessaColors[commessaId] || '#000000'; // Default to black if not found
    console.log(`getCommessaColor: CommessaId=${commessaId}, Color=${color}`);
    console.log(`commessaColors[${commessaId}]:`, commessaColors[commessaId]); // Log specifico per commessaColors[commessaId]
    return color;
  };
  const taskbarTemplate = (props) => {
    return (
        <div style={{ backgroundColor: props.Color, width: '100%', height: '100%' }}>
            {props.TaskName}
        </div>
    );
};

const onActionComplete = (args) => {
    console.log('Action completed with args:', args);
    if (args.requestType === 'save' || args.requestType === 'delete') {
        let updatedEvents = [...data];
        args.data.forEach(event => {
            const updatedEvent = {
                ...event,
                Color: commessaColors[event.CommessaId] || '#000000'
            };
            if (args.requestType === 'save') {
                updatedEvents = updatedEvents.map(e => e.TaskID === event.TaskID ? updatedEvent : e);
            } else {
                updatedEvents = updatedEvents.filter(e => e.TaskID !== event.TaskID);
            }
        });
        onDataChange(updatedEvents);
    }
};

  return (
    <GanttComponent
      dataSource={data}
      taskFields={{ id: 'TaskID', name: 'TaskName', startDate: 'StartDate', endDate: 'EndDate', dependency: 'Predecessor', CommessaId: 'CommessaId' }}
      height='650px'
      allowSelection={true}
      allowSorting={true}
      editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, allowTaskbarEditing: true }}
      taskbarTemplate={taskbarTemplate}
      timelineSettings={{
        timelineViewMode: 'Month',
        topTier: {
          unit: 'Month',
          count: 1,
          format: 'MMM yyyy'
        },
        bottomTier: {
          unit: 'Week',
          count: 1,
          format: 'dd MMM'
        }
      }}
      actionComplete={onActionComplete}
      allowRowDragAndDrop={true}
    >
      <ColumnsDirective>
        <ColumnDirective field='TaskID' visible={false} />
        <ColumnDirective field='TaskName' headerText='Nome Compito' width='250' />
        <ColumnDirective field='StartDate' headerText='Data Inizio' width='150' />
        <ColumnDirective field='EndDate' headerText='Data Fine' width='150' />
        <ColumnDirective field='Predecessor' headerText='Predecessore' width='150' />
        <ColumnDirective field='CommessaId' headerText='Commessa ID' width='150' />
      </ColumnsDirective>
      <GanttInject services={[Edit, Selection, Toolbar, RowDD]} />
    </GanttComponent>
  );
};

export default Gantt;
