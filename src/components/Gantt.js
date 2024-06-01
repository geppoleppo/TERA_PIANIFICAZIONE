import React from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar, RowDD } from '@syncfusion/ej2-react-gantt';
import axios from 'axios';

const Gantt = ({ data, onDataChange, commessaList }) => {
  console.log('Gantt data received:', data); // Log dei dati ricevuti

  const taskbarTemplate = (props) => {
    const commessa = commessaList.find(c => c.Id === props.CommessaId);
    const color = commessa ? commessa.Colore : '#000000';
    console.log(`taskbarTemplate: TaskID=${props.TaskID}, CommessaId=${props.CommessaId}, Color=${color}`);
    return (
      <div style={{ backgroundColor: color, width: '100%', height: '100%' }}>
        {props.TaskName}
      </div>
    );
  };
  const saveDataToDB = async (task) => {
    try {
        await axios.put(`http://localhost:3001/gantttasks/${task.TaskID}`, task);
        console.log('Task updated:', task);
    } catch (error) {
        console.error('Error saving task:', error);
    }
};

const onActionComplete = (args) => {
  console.log('Gantt Action Complete:', args);
  if (args.requestType === 'save' || args.requestType === 'delete') {
      onDataChange({
          requestType: args.requestType === 'save' ? 'eventChanged' : 'eventRemoved',
          data: args.data
      });
      if (args.requestType === 'save') {
          saveDataToDB(args.data);
      }
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
      allowRowDragAndDrop={true} // Abilita il drag and drop delle righe
    >
      <ColumnsDirective>
        <ColumnDirective field='TaskID' visible={false} />
        <ColumnDirective field='TaskName' headerText='Nome Compito' width='250' />
        <ColumnDirective field='StartDate' headerText='Data Inizio' width='150' />
        <ColumnDirective field='EndDate' headerText='Data Fine' width='150' />
        <ColumnDirective field='Predecessor' headerText='Predecessore' width='150' />
        <ColumnDirective field='CommessaId' headerText='Commessa ID' width='150' /> {/* Aggiungi questa colonna per debug */}
      </ColumnsDirective>
      <GanttInject services={[Edit, Selection, Toolbar, RowDD]} />
    </GanttComponent>
  );
};

export default Gantt;
