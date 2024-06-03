import React, { useEffect } from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar, RowDD } from '@syncfusion/ej2-react-gantt';

const Gantt = ({ data, onDataChange, commessaColors }) => {

  useEffect(() => {
    console.log('Gantt component mounted');
    console.log('commessaColors in Gantt:', commessaColors); // Log the commessaColors object
    console.log('data in Gantt:', data); // Log the data passed to Gantt
  }, [data, commessaColors]);

  const taskbarTemplate = (props) => {
    const commessaColor = props.Color;
    console.log(`taskbarTemplate: TaskID=${props.TaskID}, CommessaId=${props.CommessaId}, Color=${commessaColor}`); // Log per debug
    return (
      <div style={{ backgroundColor: commessaColor, width: '100%', height: '100%' }}>
        {props.TaskName}
      </div>
    );
  };

  const onActionComplete = (args) => {
    if (args.requestType === 'save' || args.requestType === 'delete') {
      onDataChange({
        requestType: args.requestType === 'save' ? 'eventChanged' : 'eventRemoved',
        data: args.data
      });
    }
  };

  return (
    <GanttComponent
      dataSource={data}
      taskFields={{ id: 'TaskID', name: 'TaskName', startDate: 'StartDate', endDate: 'EndDate', dependency: 'Predecessor', CommessaId: 'CommessaId', color: 'Color' }}
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
        <ColumnDirective field='TaskName' headerText='TASK' width='250' />
        <ColumnDirective field='StartDate' headerText='Data Inizio' width='150'  visible={false} />
        <ColumnDirective field='EndDate' headerText='Data Fine' width='150'  visible={false} />
        <ColumnDirective field='Predecessor' headerText='Predecessore' width='150'  visible={false} />
        <ColumnDirective field='CommessaId' headerText='Commessa ID' width='150'  visible={false} />
        <ColumnDirective field='Color' visible={false} />
      </ColumnsDirective>
      <GanttInject services={[Edit, Selection, Toolbar, RowDD]} />
    </GanttComponent>
  );
};

export default Gantt;
