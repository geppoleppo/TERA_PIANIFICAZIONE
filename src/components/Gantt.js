import React, { useEffect, useRef } from 'react';
import {
  GanttComponent,
  Selection,
  DayMarkers,
  Toolbar,
  Edit,
  Resize,
  RowDD,
  Inject,
} from '@syncfusion/ej2-react-gantt';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { DropDownList } from '@syncfusion/ej2-dropdowns';


const Gantt = ({ ganttData, selectedCommesse, projectResources, onUpdateEvent, onSaveEvent, onDeleteEvent, allCollaborators }) => {
  const ganttRef = useRef(null);

  useEffect(() => {
    if (ganttRef.current && ganttData.length > 0) {
      ganttRef.current.refresh(); // Forza l'aggiornamento dei dati
    }
  }, [ganttData]);


  // Risorse per il menu delle risorse (tutti i collaboratori)
  const editingResources = allCollaborators.map((collaborator) => ({
    resourceId: collaborator.id,
    resourceName: collaborator.text,
    unit: 50
  }));
  // Trasforma i dati in formato gerarchico
  const structuredData = selectedCommesse
    .map((commessaId) => {
      const commessaEvents = ganttData.filter((event) => event.CommessaId === commessaId);

      if (commessaEvents.length === 0) return null;

      const commessaName = commessaEvents[0]?.CommessaName || `Commessa ${commessaId}`;

      return {
        Id: commessaId,
        CommessaName: commessaName,
        CommessaId: commessaId,
        StartTime: commessaEvents[0]?.StartTime || new Date(),
        EndTime: commessaEvents[commessaEvents.length - 1]?.EndTime || new Date(),
        subtasks: commessaEvents.map((event) => ({
          Id: event.Id,
          Subject: event.Subject,
          StartTime: event.StartTime,
          EndTime: event.EndTime,
          Duration: event.Duration,
          Progress: event.Progress,
          IncaricatoName: event.IncaricatoName,
          IncaricatoId: event.IncaricatoId,
          CommessaId: commessaId,
          CommessaName: commessaName,
          resources: event.IncaricatoId,
          info: event.info

        })),
      };
    })
    .filter((commessa) => commessa !== null);


  console.log('Dati strutturati per il Gantt:', structuredData);
  //console.log('Risorse calcolate:', projectResources);

  return (
    <div>
      {structuredData.length > 0 ? (
        <GanttComponent
  key={JSON.stringify(structuredData)}
  ref={ganttRef}
  dataSource={structuredData}
  resources={editingResources}
  viewType="ProjectView"
  taskFields={{
    id: 'Id',
    name: 'CommessaName', // Mostra il nome nella colonna principale
    startDate: 'StartTime',
    endDate: 'EndTime',
    duration: 'Duration',
    progress: 'Progress',
    child: 'subtasks',
    notes: 'info',
    resourceInfo: 'resources',
  }}
  editSettings={{
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    allowTaskbarEditing: true,
    showDeleteConfirmDialog: true,
  }}
  toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll']}
  allowSelection={true}
  gridLines="Both"
  height="450px"
  treeColumnIndex={1} // Indice della colonna CommessaName
  resourceFields={{
    id: 'resourceId',
    name: 'resourceName',
  }}
  columns={[
    { field: 'Id', headerText: 'ID', visible: false, isPrimaryKey: true },
    {
      field: 'CommessaId',
      headerText: 'Commessa',
      width: 150,
      allowFiltering: true, // Abilita il filtro
      template: (data) => {
        // Mostra il nome della commessa nella colonna
        const commessa = projectResources.find((res) => res.id === data.CommessaId);
        return commessa ? commessa.text : 'Commessa non trovata';
      },
      edit: {
        create: () => {
          const dropdown = document.createElement('input');
          dropdown.className = 'e-field';
          return dropdown;
        },
        read: (element) => {
          return element.ej2_instances?.[0]?.value || '';
        },
        write: (args) => {
          const commesseOptions = projectResources
            .filter((commessa) => selectedCommesse.includes(commessa.id))
            .map((commessa) => ({
              value: commessa.id,
              text: commessa.text,
            }));

          const dropdown = new DropDownList({
            dataSource: commesseOptions,
            fields: { text: 'text', value: 'value' },
            value: args.rowData.CommessaId || null,
            placeholder: 'Seleziona una commessa',
            change: (e) => {
              args.rowData.CommessaId = e.value;
              args.rowData.CommessaName = e.itemData.text;
              console.log('Selezione aggiornata:', {
                CommessaId: e.value,
                CommessaName: e.itemData.text,
              });
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
    { field: 'Subject', headerText: 'Evento', width: 200 },
    { field: 'Progress', headerText: 'Progress', width: 150 },
    { field: 'IncaricatoName', headerText: 'Collaboratori', width: 200, visible: false },
    { field: 'IncaricatoId', headerText: 'IncaricatoId', width: 150, visible: false },
  ]}
  labelSettings={{
    taskLabel: 'Subject',
    rightLabel: 'IncaricatoName',
  }}
  splitterSettings={{
    columnIndex: 1, // Colonna per la struttura gerarchica
  }}
  height="450px"
  projectStartDate={new Date('12/15/2024')}
  projectEndDate={new Date('12/31/2025')}

  taskType="FixedWork"


  toolbarClick={(args: ClickEventArgs) => {
    if (args.item.id === 'showhidebar') {
      ganttRef.current.showOverAllocation = ganttRef.current.showOverAllocation ? false : true;
    }
  }}
  actionBegin={(args) => {
    console.log("EVENTOOO", args.requestType)

    if (args.requestType === 'beforeSave') {

      onUpdateEvent(args.data); // Assicurati che `onUpdateEvent` riceva i dati corretti
    }

    if (args.requestType === 'beforeDelete') {
      onDeleteEvent(args.data[0].Id); // Elimina l'evento
    }

    if (args.requestType === 'beforeAdd') {
      console.log('DATA prima di AGGIUNGERE:', args);
  
      // Assegna un collaboratore predefinito se non è specificato
      if (!args.data.IncaricatoId || args.data.IncaricatoId.length === 0) {
        const defaultCollaboratore = allCollaborators.find((c) => c.id === 1); // Collaboratore con ID 1
        if (defaultCollaboratore) {
          args.data.IncaricatoId = [defaultCollaboratore.id];
          args.data.IncaricatoName = defaultCollaboratore.text;
          args.data.resources = [
            {
              resourceId: defaultCollaboratore.id,
              resourceName: defaultCollaboratore.text,
              unit: 50,
            },
          ];
        }
      }
  
      if (!args.data.CommessaId) {
        const defaultCommessa = projectResources[0];
        if (defaultCommessa) {
          args.data.CommessaId = defaultCommessa.id;
          args.data.CommessaName = defaultCommessa.text;
        }
      }
  
      const commessa = projectResources.find(
        (resource) => resource.id === args.data.CommessaId
      );
  
      args.data.CommessaName = commessa ? commessa.text : null;
      console.log('Dati predefiniti per il nuovo evento:', args.data);
  
      onSaveEvent(args.data);
    }

    if (args.requestType === 'beforeOpenAddDialog') {
      console.log('Apertura dialogo aggiunta evento:', args);
    }
  }}




>
  <Inject services={[Selection, DayMarkers, Toolbar, Edit, Resize, RowDD]} />
</GanttComponent>

      ) : (
        <p>Caricamento dati...</p>
      )}
    </div>
  );
};

export default Gantt;
