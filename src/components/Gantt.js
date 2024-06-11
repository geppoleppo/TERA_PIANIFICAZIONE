import React, { useEffect, useState } from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar, RowDD, Filter } from '@syncfusion/ej2-react-gantt';

const Gantt = ({ data, onDataChange, commessaColors, commesse }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    console.log('Gantt component mounted');
    console.log('commessaColors in Gantt:', commessaColors);
    console.log('data in Gantt:', data);

    // Verifica la corrispondenza tra i campi dei dati e taskFields
    const verifyData = data.map(event => {
      const startDate = new Date(event.StartTime);
      const endDate = new Date(event.EndTime);
      
      // Verifica se le date sono valide
      const isValidStartDate = !isNaN(startDate.getTime());
      const isValidEndDate = !isNaN(endDate.getTime());

      return {
        ...event,
        Id: event.Id || '',
        TaskName: event.Subject,
        StartDate: isValidStartDate ? startDate : null,
        EndDate: isValidEndDate ? endDate : null,
        Predecessor: event.Predecessor || '',
        Duration: event.Duration || 1,
        Progress: event.Progress || 0,
        Color: event.Color || commessaColors[event.CommessaId] || '#000000',
        CommessaId: event.CommessaId || ''
      };
    });
    console.log('Verified Data for Gantt:', verifyData);
    setFilteredData(verifyData);
  }, [data, commessaColors]);

  const taskbarTemplate = (props) => {
    const commessaColor = props.Color || '#000000';
    console.log('taskbarTemplate props:', props); // Stampa tutte le proprietà di `props`
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
    id: 'Id',
    name: 'TaskName',
    startDate: 'StartDate',
    endDate: 'EndDate',
    dependency: 'Predecessor',
    duration: 'Duration',
    progress: 'Progress',
    color: 'Color',
    CommessaId: 'CommessaId'
  };

  return (
    <GanttComponent
      dataSource={filteredData}
      taskFields={taskFields}
      height='650px'
      allowSelection={true}
      allowSorting={true}
      allowFiltering={true}
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
      actionComplete={onActionComplete}
      allowRowDragAndDrop={true}
      filterSettings={{ type: 'Menu', hierarchyMode: 'Parent' }}
      highlightWeekends={true}
    >
      <ColumnsDirective>
        <ColumnDirective field='Id' visible={false} />
        <ColumnDirective field='CommessaName' headerText='Commessa' width='100' allowFiltering={true} />
        <ColumnDirective field='TaskName' headerText='Task' width='250' allowFiltering={true} />
        <ColumnDirective field='StartDate' headerText='Start Date' width='150' format='dd/MM/yyyy' allowFiltering={true} visible={false} />
        <ColumnDirective field='EndDate' headerText='End Date' width='150' format='dd/MM/yyyy' allowFiltering={true} visible={false}/>
        <ColumnDirective field='Progress' headerText='Progress' width='150' textAlign='Right' allowFiltering={true} visible={false}/>
        <ColumnDirective field='Predecessor' headerText='Predecessore' width='150' visible={false} />
        <ColumnDirective field='CommessaId' headerText='Commessa ID' width='150' visible={false} />
        <ColumnDirective field='Color' visible={false} />
      </ColumnsDirective>
      <GanttInject services={[Edit, Selection, Toolbar, RowDD, Filter]} />
    </GanttComponent>
  );
};

export default Gantt;
