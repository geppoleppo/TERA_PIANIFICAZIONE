import React, { useEffect } from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar, RowDD } from '@syncfusion/ej2-react-gantt';
import axios from 'axios';
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

  const onActionComplete = async (args) => {
    console.log('Action Start:', args);
  
    if (args.requestType === 'save' || args.requestType === 'delete') {
      let endpoint = '';
      let method = '';
      let data = {};
  
      // Determina l'endpoint e il metodo in base al tipo di azione
      if (args.requestType === 'save') {
        const taskData = args.data; // Assicurati che args.data contenga i dati corretti
        endpoint = taskData.TaskID ? `/eventi/${taskData.TaskID}` : '/eventi';
        method = taskData.TaskID ? 'put' : 'post';
  
        // Preparazione dei dati per la richiesta, con conversione di isAllDay
        data = {
          subject: taskData.TaskName,
          startTime: taskData.StartDate,
          endTime: taskData.EndDate,
          isAllDay: taskData.isAllDay ? 1 : 0, // Converti booleano in intero
          commessaId: taskData.CommessaId,
          color: taskData.Color
        };
      } else if (args.requestType === 'delete') {
        endpoint = `/eventi/${args.data.TaskID}`;
        method = 'delete';
      }
  
      // Effettua la chiamata API se necessario
      if (endpoint) {
        try {
          const response = await axios({
            method: method,
            url: `http://localhost:3001${endpoint}`,
            data: method !== 'delete' ? data : {}
          });
          console.log('API response:', response);
          onDataChange({ ...args, data: response.data }); // Pass updated data to onDataChange
        } catch (error) {
          console.error('Failed to interact with API:', error);
        }
      }
    }
  
    console.log('Action End:', args);
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
