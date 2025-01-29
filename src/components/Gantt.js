import React, { useRef, useEffect, useState, forwardRef } from 'react';
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
import { DataManager, WebApiAdaptor, Query } from '@syncfusion/ej2-data';
import { DropDownList } from '@syncfusion/ej2-dropdowns';

const Gantt = forwardRef(({ ganttData = [], onUpdateEvent, onSaveEvent, onDeleteEvent }, ref) => {
  const ganttRef = useRef(null);
  const [resources, setResources] = useState([]); // Stato per i dati delle risorse

  // Configura il DataManager per leggere i collaboratori
  const resourceDataManager = new DataManager({
    url: 'http://localhost:4443/api/collaboratori', // Endpoint API REST
    adaptor: new WebApiAdaptor(),
    crossDomain: true,
  });

  // Carica i dati delle risorse
  useEffect(() => {
    console.log("USE EFFECT 1")
    const query = new Query();
    resourceDataManager.executeQuery(query).then((response) => {
      setResources(response.result || []); // Salva i risultati nello stato
      console.log('Risorse caricate:', response.result);
    }).catch((error) => {
      console.error('Errore durante il caricamento delle risorse:', error);
    });
  }, []);

  useEffect(() => {
    console.log("USE EFFECT 2")
    if (ref) {
      ref.current = ganttRef.current;
    }
    if (ganttRef.current) {
      ganttRef.current.fitToProject();
    }
  }, [ref]);

  useEffect(() => {
    console.log("USE EFFECT 3")
    if (ganttRef.current && resources.length > 0) {
      console.log('Aggiorno risorse nel Gantt.');
      ganttRef.current.resources = resources; // Passa le risorse direttamente al Gantt
      ganttRef.current.dataBind();
    }
  }, [resources]);

  const refreshGantt = () => {
    if (ganttRef.current) {
      console.log('Forzando il refresh completo del Gantt');
      ganttRef.current.dataBind();
      ganttRef.current.refresh();
    }
  };
console.log("resourceDataManager: ",resources)
  return (
    <div>
      <GanttComponent
        id="ganttChart"
        ref={ganttRef}
        dataSource={ganttData}
        resources={resources} // Usa le risorse caricate nello stato
        resourceFields={{
          id: 'resourceId',
          name: 'resourceName',
          unit: 'unit',
          group: 'resourceGroup',
        }}
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
          parentId: 'parentId',
        }}
        toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 'Search']}
        columns={[
          { field: 'Id', visible: false },
          { field: 'Subject', headerText: 'Task Name', width: '250' },
          { field: 'isManual', headerText: 'Manual Task', width: '150', editType: 'booleanedit' },
          { field: 'resources', headerText: 'Resources', width: '200', editType: 'dropdownedit' },
          {
            field: 'parentId',
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
                  ...ganttData.map((task) => ({
                    value: task.Id,
                    text: task.Subject,
                  })),
                ];

                const dropdown = new DropDownList({
                  dataSource: parentOptions,
                  fields: { text: 'text', value: 'value' },
                  value: args.rowData.parentId || null,
                  placeholder: 'Select Parent Task',
                  change: (e) => {
                    args.rowData.parentId = e.value;
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
        actionBegin={(args) => {
          console.log("AZIONE",args.requestType)
          if (args.requestType === 'beforeSave') {
            console.log('Intercepting beforeSave:', args.data);
            args.data.ganttProperties.parentId = args.data.parentId;
            // args.data.parentID = null; // Correggi parentID a null se non ha genitore
           // }
          }
        }}
        actionComplete={(args) => {
          if (args.requestType === 'save') {
            console.log('Salvataggio completato:', args.data);
           // refreshGantt(); // Forza il refresh completo
          }
        }}
      >
        <Inject services={[Edit, Toolbar, Selection, Resize, RowDD, DayMarkers, Filter]} />
      </GanttComponent>
    </div>
  );
});

export default Gantt;
