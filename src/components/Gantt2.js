  // Gantt.js - Correzione basata sulle demo di Syncfusion
  import React, { useRef, useEffect,forwardRef  } from 'react';
  import {
    GanttComponent,
    Inject,
    Edit,
    Toolbar,
    Selection,
    Resize,
    RowDD,
    DayMarkers,
    Filter,
  } from '@syncfusion/ej2-react-gantt';
  import { DropDownList } from '@syncfusion/ej2-dropdowns';

  const Gantt2 = forwardRef(({ ganttData = [], projectResources = [], onUpdateEvent, onSaveEvent, onDeleteEvent }) => {
    const ganttRef = useRef(null);

    // Dati di esempio per task e risorse
    const defaultGanttData = [
      { Id: 1, Subject: 'Task 1', StartTime: new Date('2025-01-02'), EndTime: new Date('2025-01-05'), resources: [1], Progress: 50 },
      { Id: 2, Subject: 'Task 2', StartTime: new Date('2025-01-06'), EndTime: new Date('2025-01-10'), parentID: 1, resources: [2], Progress: 30 },
      { Id: 3, Subject: 'Task 3', StartTime: new Date('2025-01-11'), EndTime: new Date('2025-01-15'), parentID: 1, resources: [3], Progress: 70 },
    ];

    const defaultResources = [
      { resourceId: 1, resourceName: 'Developer' },
      { resourceId: 2, resourceName: 'Tester' },
      { resourceId: 3, resourceName: 'Project Manager' },
    ];

    // Controlla che i dati siano validi
    const validatedGanttData = ganttData.length > 0 ? ganttData : defaultGanttData;
    const validatedProjectResources = projectResources.length > 0 ? projectResources : defaultResources;

    useEffect(() => {
      if (ganttRef.current) {
        console.log('Fit iniziale del Gantt');
        ganttRef.current.fitToProject(); // Fit iniziale
      }
    }, []);

    console.log("Dati del Gantt iniziali:", validatedGanttData);

    const refreshGantt = () => {
      if (ganttRef.current) {
        console.log('Forzando il refresh completo del Gantt');
        ganttRef.current.dataBind();
        ganttRef.current.refresh();
      }
    };

  console.log("risorse",projectResources)

    return (
      <div>
        <GanttComponent
          id="ganttChart"
          viewType= 'ResourceView'
          ref={ganttRef}
          dataSource={validatedGanttData}
          resources={validatedProjectResources}
          
          height="450px"
          allowSorting={true}
          enableContextMenu={true}
          highlightWeekends={true}
          allowFiltering={true}
          taskFields={{
            id: 'Id',
            name: 'Subject',
            startDate: 'StartTime',
            endDate: 'EndTime',
            duration: 'Duration',
            dependency: 'Predecessors',
            progress: 'Progress',
            resourceInfo: 'resources',
            work:'work',
            child:'subtasks'
          }}
          resourceFields={{
            id: 'resourceId',
            name: 'resourceName',
            unit: 'unit',
            group: 'resourceGroup'
          }}
          toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 'Search']}
          columns={[
            { field: 'Id', visible: false },
            { field: 'Subject', headerText: 'Task Name', width: '250' },
            { field: 'isManual', headerText: 'Manual Task', width: '150', editType: 'booleanedit' },
            { field: 'resources', headerText: 'Resources', width: '200', editType: 'dropdownedit' },
            {
              field: 'parentID',
              headerText: 'Parent Task',
              width: '200',
              edit: {
                create: () => {
                  const dropdown = document.createElement('input');
                  dropdown.className = 'e-field';
                  return dropdown;
                },
                read: (element) => {
                  return element.ej2_instances?.[0]?.value || null;
                },
                write: (args) => {
                  const parentOptions = [
                    { value: null, text: 'No Parent' },
                    ...validatedGanttData.map((task) => ({
                      value: task.Id,
                      text: task.Subject,
                    })),
                  ];

                  const dropdown = new DropDownList({
                    dataSource: parentOptions,
                    fields: { text: 'text', value: 'value' },
                    value: args.rowData.parentID || null,
                    placeholder: 'Select Parent Task',
                    change: (e) => {
                      args.rowData.parentID = e.value;
                      console.log('Parent ID aggiornato:', e.value);
                    },
                  });

                  dropdown.appendTo(args.element);
                  args.column.dropdownInstance = dropdown;
                },
                destroy: (args) => {
                  if (args?.column?.dropdownInstance) {
                    args.column.dropdownInstance.destroy();
                    args.column.dropdownInstance = null;
                  }
                },
              },
            },
          ]}
          editSettings={{
            allowAdding: true,
            allowEditing: true,
            allowDeleting: true,
            allowTaskbarEditing: true,
            showDeleteConfirmDialog: true,
          }}
          labelSettings={{
            leftLabel: 'Subject',
            rightLabel: 'resources',
          }}
          splitterSettings={{
            position: '35%',
          }}
          //projectStartDate={new Date('2025-01-01')}
          //projectEndDate={new Date('2025-03-30')}
          actionBegin={(args) => {
            if (args.requestType === 'beforeSave') {
              console.log('Intercepting beforeSave:', args.data);
              if (args.data.parentID === 0) {
                args.data.parentID = null; // Correggi parentID a null se non ha genitore
              }
            }
          }}
          actionComplete={(args) => {
            if (args.requestType === 'save') {
              console.log('Salvataggio completato:', args.data);
              refreshGantt(); // Forza il refresh completo
            }
          }}
        >
          <Inject services={[Edit, Toolbar, Selection, Resize, RowDD, DayMarkers, Filter]} />
        </GanttComponent>
      </div>
    );
  });


  export default Gantt2;
