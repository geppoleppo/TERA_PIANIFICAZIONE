import React from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar } from '@syncfusion/ej2-react-gantt';
import commesse, { getCommessaColor } from './commesse'; // Importa le commesse e la funzione

const Gantt = ({ data, onDataChange }) => {
  const taskbarTemplate = (props) => {
    const commessaColor = getCommessaColor(props.CommessaId);
    return (
      <div style={{ backgroundColor: commessaColor, width: '100%', height: '100%' }}>
        {props.TaskName}
      </div>
    );
  };

  const onActionComplete = (args) => {
    console.log('Gantt Action Complete:', args);
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
      taskFields={{ id: 'TaskID', name: 'TaskName', startDate: 'StartDate', endDate: 'EndDate', dependency: 'Predecessor', color: 'Color' }}
      height='650px'
      allowSelection={true}
      allowSorting={true}
      editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, allowTaskbarEditing: true }}
      taskbarTemplate={taskbarTemplate}
      actionComplete={onActionComplete}
    >
      <ColumnsDirective>
        <ColumnDirective field='TaskID' visible={false} />
        <ColumnDirective field='TaskName' headerText='Nome Compito' width='250' />
        <ColumnDirective field='StartDate' headerText='Data Inizio' width='150' />
        <ColumnDirective field='EndDate' headerText='Data Fine' width='150' />
        <ColumnDirective field='Predecessor' headerText='Predecessore' width='150' />
      </ColumnsDirective>
      <GanttInject services={[Edit, Selection, Toolbar]} />
    </GanttComponent>
  );
};

export default Gantt;
