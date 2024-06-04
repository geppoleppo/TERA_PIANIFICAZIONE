import React, { useEffect } from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar, RowDD } from '@syncfusion/ej2-react-gantt';

const Gantt = ({ data, onDataChange, commessaColors, commesse, resources }) => {

  useEffect(() => {
    console.log('Gantt component mounted');
    console.log('commessaColors in Gantt:', commessaColors); // Log the commessaColors object
    console.log('data in Gantt:', data); // Log the data passed to Gantt
    console.log('resources in Gantt:', resources); // Log the resources passed to Gantt
  }, [data, commessaColors, resources]);

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

  const taskFields = {
    id: 'TaskID',
    name: 'TaskName',
    startDate: 'StartDate',
    endDate: 'EndDate',
    dependency: 'Predecessor',
    duration: 'Duration',
    resourceInfo: 'ResourceIDs', // Mappa i dati delle risorse
    color: 'Color',
    CommessaId: 'CommessaId'
  };

  const resourceFields = {
    id: 'resourceId',
    name: 'resourceName'
  };

  return (
    <GanttComponent
      dataSource={data}
      resources={resources}
      taskFields={taskFields}
      resourceFields={resourceFields}
      height='650px'
      allowSelection={true}
      allowSorting={true}
      editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, allowTaskbarEditing: true, mode: 'Dialog' }}
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
      labelSettings={{
        rightLabel: 'ResourceNames',
        taskLabel: 'Progress'
      }}
      actionComplete={onActionComplete}
      allowRowDragAndDrop={true}
    >
      <ColumnsDirective>
        <ColumnDirective field='TaskID' visible={false} />
        <ColumnDirective field='CommessaId' headerText='Commessa ID' width='150' visible={false} />
        <ColumnDirective field='Color' visible={false} />
        <ColumnDirective field='CommessaName' headerText='Commessa' width='250' />
        <ColumnDirective field='TaskName' headerText='Task' width='250' />
        <ColumnDirective field='StartDate' headerText='Start Date' width='150' format='dd/MM/yyyy' />
        <ColumnDirective field='EndDate' headerText='End Date' width='150' format='dd/MM/yyyy' />
        <ColumnDirective field='ResourceNames' headerText='Collaboratori' width='250' />
      </ColumnsDirective>
      <GanttInject services={[Edit, Selection, Toolbar, RowDD]} />
    </GanttComponent>
  );
};

export default Gantt;
