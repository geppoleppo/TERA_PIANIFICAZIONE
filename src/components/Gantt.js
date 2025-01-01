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
import { deleteEvent } from '../functions/Functions';


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
          info: 'Obtain an engineered soil test of lot where construction is planned.' +
            'From an engineer or company specializing in soil testing'

        })),
      };
    })
    .filter((commessa) => commessa !== null);


  console.log('Dati strutturati per il Gantt:', structuredData);
  console.log('Risorse calcolate:', allCollaborators);

  return (
    <div>
      {structuredData.length > 0 ? (
        <GanttComponent
          key={JSON.stringify(structuredData)} // Forza il render quando structuredData cambia
          ref={ganttRef}
          dataSource={structuredData}
          resources={editingResources}


          viewType="ProjectView"
          taskFields={{
            id: 'Id',
            Subject: 'Subject',
            CommessaName: 'CommessaName',
            CommessaId: 'CommessaId',
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
          allowSelection='true'
          gridLines='Both'
          height='450px'
          treeColumnIndex='1'
          resourceFields={{
            id: 'resourceId',
            name: 'resourceName',
          }}
          columns={[
            { field: 'Id', headerText: 'ID', visible: false, isPrimaryKey: true },
            {
              field: 'Subject',
              headerText: 'Evento',
              width: 200,
              template: (data) => (data.subtasks ? '' : data.Subject),
            },
            { field: 'Subject', headerText: 'Subject', width: 150 },
            { field: 'StartTime', headerText: 'Start Date', width: 150 },
            { field: 'EndTime', headerText: 'End Date', width: 150 },
            { field: 'IncaricatoName', headerText: 'Collaboratori', width: 200, visible: false },
            { field: 'IncaricatoId', headerText: 'IncaricatoId', width: 150, visible: false },
            { field: 'Progress', headerText: 'Progress', width: 150 },
            { field: 'CommessaId', headerText: 'CommessaId', width: 150, visible: false },
            {
              field: 'CommessaName',
              headerText: 'Commessa',
              width: 150,
              edit: {
                create: () => {
                  const select = document.createElement('select');
                  select.className = 'e-field';
                  return select;
                },
                read: (element) => element.value, // Legge il valore selezionato
                write: (args) => {
                  const select = args.element;
                  select.innerHTML = ''; // Resetta le opzioni

                  const commesseOptions = projectResources.map((commessa) => ({
                    value: commessa.id,
                    text: commessa.text,
                  }));

                  commesseOptions.forEach((option) => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.text;
                    opt.selected = args.rowData.CommessaId === option.value; // Seleziona l'opzione
                    select.appendChild(opt);
                  });

                  // Aggiorna CommessaId quando l'utente cambia valore
                  select.addEventListener('change', () => {
                    console.log('STO CAMBIANDO...', args.rowData)
                    args.rowData.CommessaId = parseInt(select.value, 10); // Valorizza CommessaId
                    args.rowData.CommessaName = select.options[select.selectedIndex].text; // Valorizza CommessaName
                  });
                },
              },
            }

          ]}

          taskType="FixedWork"


          toolbarClick={(args: ClickEventArgs) => {
            if (args.item.id === 'showhidebar') {
              ganttRef.current.showOverAllocation = ganttRef.current.showOverAllocation ? false : true;
            }
          }}
          actionBegin={(args) => {
            console.log('DATA prima di aggiungere:', args);

            if (args.requestType === 'save' || args.requestType === 'beforeSave') {
              // Per modifiche
              onUpdateEvent(args.data);
            }
            if (args.requestType === 'beforeDelete' ) {
              // Per modifiche
              onDeleteEvent(args.data[0].Id);
            }
            

            if (args.requestType === 'beforeAdd') {
              
          
              // Inizializza `CommessaId` e `CommessaName` se non esistono
              if (!args.data.CommessaId) {
                const defaultCommessa = projectResources[0]; // Prendi la prima commessa come default, oppure personalizza
                if (defaultCommessa) {
                  args.data.CommessaId = defaultCommessa.id;
                  args.data.CommessaName = defaultCommessa.text;
                }
              }
          
              // Per aggiunta
              const commessa = projectResources.find(
                (resource) => resource.id === args.data.CommessaId
              );
          
              args.data.CommessaName = commessa ? commessa.text : null; // Associa il nome della commessa
          
              console.log('DATA dopo l\'inizializzazione:', args);
          
              onSaveEvent(args.data);
            }
          
            if (args.requestType === 'beforeOpenAddDialog') {
              console.log('Apertura dialogo aggiunta evento:', args);
            }
          }}
          

          labelSettings={{
            taskLabel: 'Subject',
            rightLabel: 'IncaricatoName',
          }}
          splitterSettings={{
            columnIndex: 1,
          }}
          height="450px"
          projectStartDate={new Date('12/15/2024')}
          projectEndDate={new Date('12/31/2025')}
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
