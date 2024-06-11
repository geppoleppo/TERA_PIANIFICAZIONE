import React, { useEffect, useState } from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject as GanttInject, Edit, Selection, Toolbar, RowDD, Filter } from '@syncfusion/ej2-react-gantt';

const Gantt = ({ data, onDataChange, commessaColors, commesse }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    console.log('Gantt data:', data);
    setFilteredData(data);
  }, [data]);

  const taskbarTemplate = (props) => {
    const commessaColor = props.Color || '#000000';
    return (
      <div style={{ backgroundColor: commessaColor, width: '100%', height: '100%' }}>
        {props.TaskName}
      </div>
    );
  };

  const onActionComplete = (args) => {
    console.log('Gantt action complete:', args);
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
    progress: 'Progress',
    color: 'Color',
    CommessaId: 'CommessaId'
  };

  const staticData = [
    {
      TaskID: 1,
      TaskName: 'Task 1',
      StartDate: new Date('2024-06-01'),
      EndDate: new Date('2024-06-02'),
      Predecessor: '',
      Duration: 1,
      Progress: 50,
      Color: '#ff5733',
      CommessaId: 1
    },
    {
      TaskID: 2,
      TaskName: 'Task 2',
      StartDate: new Date('2024-06-03'),
      EndDate: new Date('2024-06-04'),
      Predecessor: '',
      Duration: 1,
      Progress: 75,
      Color: '#33ff57',
      CommessaId: 2
    }
  ];

  return (
    <GanttComponent
      dataSource={filteredData.length > 0 ? filteredData : staticData}
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
      allowSelection={true}
    >
      <ColumnsDirective>
        <ColumnDirective field='TaskID' visible={false} />
        <ColumnDirective field='CommessaName' headerText='Commessa' width='100' allowFiltering={true} />
        <ColumnDirective field='TaskName' headerText='Task' width='250' allowFiltering={true} />
        <ColumnDirective field='StartDate' headerText='Start Date' width='150' format='dd/MM/yyyy' allowFiltering={true} />
        <ColumnDirective field='EndDate' headerText='End Date' width='150' format='dd/MM/yyyy' allowFiltering={true} />
        <ColumnDirective field='Progress' headerText='Progress' width='150' textAlign='Right' allowFiltering={true} />
        <ColumnDirective field='Predecessor' headerText='Predecessore' width='150' />
        <ColumnDirective field='CommessaId' headerText='Commessa ID' width='150' visible={false} />
        <ColumnDirective field='Color' visible={false} />
      </ColumnsDirective>
      <GanttInject services={[Edit, Selection, Toolbar, RowDD, Filter]} />
    </GanttComponent>
  );
};

export default Gantt;
