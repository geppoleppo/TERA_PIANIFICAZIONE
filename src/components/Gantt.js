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
  Filter,
  ExcelExport,
  PdfExport,

} from '@syncfusion/ej2-react-gantt';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { DropDownList } from '@syncfusion/ej2-dropdowns';


const Gantt = ({ ganttData, selectedCommesse, projectResources, onUpdateEvent, onSaveEvent, onDeleteEvent, allCollaborators,markers }) => {
  const ganttRef = useRef(null);

  /*   useEffect(() => {
      if (ganttRef.current && ganttData.length > 0) {
        ganttRef.current.refresh(); // Forza l'aggiornamento dei dati
      }
    }, [ganttData]); */


  // Risorse per il menu delle risorse (tutti i collaboratori)
  const editingResources = allCollaborators.map((collaborator) => ({
    resourceId: collaborator.id,
    resourceName: collaborator.text,
    unit: 50
  }));




  // Trasforma i dati in formato gerarchico
  const structuredData =
    selectedCommesse.length > 0
      ? selectedCommesse.flatMap((commessaId) => {
        const commessaEvents = ganttData.filter((event) => event.CommessaId === commessaId);
        const commessa = projectResources.find((pr) => pr.id === commessaId);

        if (commessaEvents.length === 0) return [];

        const commessaName = commessaEvents[0]?.CommessaName || `Commessa ${commessaId}`;

        return commessaEvents.map((event) => {
          const immagini = (event.IncaricatoImages || []).map((img, index) => ({
            image: img,
            name: (event.IncaricatoName || '').split(', ')[index] || 'Collaboratore sconosciuto',
          }));

          return {
            Id: event.Id,
            Subject: event.Subject,
            StartTime: event.StartTime || new Date(),
            EndTime: event.EndTime || new Date(),
            Duration: event.Duration || 0,
            Progress: event.Progress || 0,
            IncaricatoName: event.IncaricatoName || '',
            IncaricatoId: event.IncaricatoId || [],
            CommessaId: commessaId,
            CommessaName: commessaName,
            parentID: event.parentID || null,
            resources: event.IncaricatoId || [],
            info: event.info || '',
            predecessorsName: event.predecessorsName,
            CategoryColor: commessa ? commessa.color : '#000000',
            immagini,
          };
        });
      })
      : [
        {
          Id: 0,
          Subject: "Nessun evento disponibile",
          StartTime: new Date(),
          EndTime: new Date(),
          Duration: 0,
          Progress: 0,
          IncaricatoName: "",
          IncaricatoId: [],
          CommessaId: null,
          CommessaName: "Nessuna commessa",
          parentID: null,
          resources: [],
          info: "",
          predecessorsName: "",
          CategoryColor: "#CCCCCC",
          immagini: [],
        },
      ];

      const visibleEventIds = structuredData.map((event) => Number(event.Id));
      console.log('Eventi visibili in structuredData:', visibleEventIds);
      
      const filteredMarkers = markers.filter((marker) =>
          visibleEventIds.includes(Number(marker.EventId))
      );
      console.log('Marker filtrati basati su structuredData:', filteredMarkers);
      
      const formattedMarkers = filteredMarkers.map((marker) => ({
          day: new Date(marker.Day),
          label: marker.Label,
          visible: false,
          cssClass: marker.Severity.toLowerCase() + '-marker',
      }));
      
      console.log('CSS Class per i Marker:', formattedMarkers.map(marker => marker.cssClass));


      const groupedMarkers = markers.reduce((acc, marker) => {
        const dateKey = marker.Day ? new Date(marker.Day).toISOString().split('T')[0] : null;
    
        if (!acc[dateKey]) {
            acc[dateKey] = { ...marker, Label: [marker.Label] }; // Crea il gruppo
        } else {
            acc[dateKey].Label.push(marker.Label); // Aggiungi l'etichetta al gruppo
        }
        return acc;
    }, {});
    
    
  


  console.log('GanttData:', ganttData);
  console.log('Dati strutturati per il Gantt:', structuredData);
  //console.log('Risorse calcolate:', projectResources);

  return (
    <div>
      {structuredData.length > 0 ? (
        <GanttComponent
          id="ganttTera" // Nome univoco per il Gantt
          eventMarkers={formattedMarkers} // Passa i marker formattati al Gantt
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
            parentID: 'parentID',
            dependency: 'predecessorsName',
          }}

          /*   queryTaskbarInfo={(args) => {
              console.log('ARRRRGSSS',args)
              // Ottieni il colore della commessa dall'evento
              const commessaColor = args.data.taskData.CategoryColor || '#000000'; // Default nero
          
              // Calcola una tonalità più scura per il colore di progresso
              const darkenColor = (color, amount) => {
                const usePound = color[0] === '#';
                let col = usePound ? color.slice(1) : color;
                const num = parseInt(col, 16);
          
                const r = Math.max((num >> 16) - amount, 0);
                const g = Math.max(((num >> 8) & 0x00ff) - amount, 0);
                const b = Math.max((num & 0x0000ff) - amount, 0);
          
                return `#${(usePound ? '' : '#') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
              };
          
              //args.taskbarBgColor= commessaColor;
              args.progressBarBgColor = darkenColor(commessaColor, 20); // Rende il colore più scuro
             
              //args.taskbarElement = darkenColor(commessaColor, 40);
            }} */

          editSettings={{
            allowAdding: true,
            allowEditing: true,
            allowDeleting: true,
            allowTaskbarEditing: true,
            showDeleteConfirmDialog: true,
          }}
          rowHeight={60} // Aumenta la larghezza delle righe
          toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 'PdfExport']}
          allowExcelExport={true}
          allowPdfExport={true}
          allowSelection={true}
          toolbarClick={(args) => {
            if (args.item.id === 'ganttTera_pdfexport') {
              const pdfExportProperties = {
                fileName: 'GanttChartExport.pdf',
                pageSize: 'A2',
                pageOrientation: 'Landscape',
                fitToWidth: true,
                header: {
                  fromTop: 0,
                  height: 50,
                  contents: [
                    {
                      type: 'Text',
                      value: 'TERA GANTT',
                      position: { x: 200, y: 20 },
                      style: { textBrushColor: '#000000', fontSize: 16 },
                    },
                  ],
                },
                footer: {
                  fromBottom: 0,
                  height: 30,
                  contents: [
                    {
                      type: 'Text',
                      value: 'Page ${currentPage} of ${totalPages}',
                      position: { x: 250, y: 10 },
                      style: { textBrushColor: '#808080', fontSize: 10 },
                    },
                  ],
                },
              };
              
              ganttRef.current.pdfExport(pdfExportProperties).catch((error) => {
                console.error('Errore durante l\'esportazione PDF:', error);
              });
            }
          }}





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
              width: 250,
              allowFiltering: true,
              template: (data) => {
                // Verifica se l'evento è un figlio
                const isChild = data.parentID !== null;
                // Verifica se l'evento ha figli
                const hasChildren = ganttData.some((task) => task.parentID === data.Id);

                // Logica per la visualizzazione
                if (isChild) {
                  return data.Subject || 'Nessun Subject'; // Evento figlio mostra il Subject
                } else if (hasChildren) {
                  return data.CommessaName || 'Nessuna Commessa'; // Evento genitore mostra la commessa
                } else {
                  return data.CommessaName || 'Nessuna Commessa'; // Evento senza figli mostra la commessa
                }
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
            {
              field: 'IncaricatoName',
              headerText: 'Collaboratori',
              width: 350,
              template: (data) => {
                if (!data.taskData.immagini || data.taskData.immagini.length === 0) {
                  return (
                    <div
                      style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}
                      dangerouslySetInnerHTML={{
                        __html: `
                  <img
                    src="/images/default.png"
                    alt="Nessun collaboratore"
                    style="width: 25px; height: 25px; border-radius: 50%; margin-right: 4px;"
                  />
                `,
                      }}
                    />
                  );
                }

                const imagesHTML = data.taskData.immagini
                  .map(
                    (img, index) => `
              <img
                key="${index}"
                src="${img.image}"
                alt="${img.name}"
                style="width: 35px; height: 35px; border-radius: 50%; margin-right: 4px;"
              />
            `
                  )
                  .join('');

                return (
                  <div
                    style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}
                    dangerouslySetInnerHTML={{ __html: imagesHTML }}
                  />
                );
              },
            },


            { field: 'Subject', headerText: 'Evento', width: 200, visible: true, allowFiltering: true, },
            { field: 'Progress', headerText: 'Progress', width: 150, visible: false, },



            { field: 'IncaricatoId', headerText: 'IncaricatoId', width: 150, visible: false },
            {
              field: 'predecessorsName',
              visible: true,
              headerText: 'Dipendenze',
              width: 200,
              edit: {
                create: () => {
                  const dropdown = document.createElement('input');
                  dropdown.className = 'e-field';
                  return dropdown;
                },
                read: (element) => element.ej2_instances?.[0]?.value || '',
                write: (args) => {
                  const options = ganttData
                    .filter(task => task.Id !== args.rowData.Id) // Escludi l'evento stesso
                    .map(task => ({
                      value: `${task.Id}SS`, // Esempio: ID con tipo SS (Start-Start)
                      text: `${task.Subject} (ID: ${task.Id})`,
                    }));

                  const dropdown = new DropDownList({
                    dataSource: options,
                    fields: { text: 'text', value: 'value' },
                    value: args.rowData.predecessorsName || '',
                    placeholder: 'Seleziona una dipendenza',
                    change: (e) => {
                      args.rowData.predecessorsName = e.value;
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

            {
              field: 'parentID',
              headerText: 'Parent Task',
              visible: true,
              width: 200,
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
                  // Opzione "nessun parent"
                  const parentOptions = [
                    { value: null, text: 'Nessun Genitore...' },
                    ...ganttData
                      .filter(
                        (task) =>
                          task.Id !== args.rowData.Id && // Escludi l'evento stesso
                          task.CommessaId === args.rowData.CommessaId // Includi solo eventi della stessa commessa
                      )
                      .map((task) => ({
                        value: task.Id,
                        text: task.Subject || `Task ${task.Id}`,
                      })),
                  ];

                  const dropdown = new DropDownList({
                    dataSource: parentOptions,
                    fields: { text: 'text', value: 'value' },
                    value: args.rowData.parentID || null,
                    placeholder: 'Seleziona un Parent Task',
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
          labelSettings={{
            taskLabel: 'Subject',
            rightLabel: 'IncaricatoName',
          }}
          splitterSettings={{
            columnIndex: 1, // Colonna per la struttura gerarchica
            position: '30%', // Imposta la larghezza iniziale al 40% (puoi regolarlo a piacere)
          }}
          height="650px"
          projectStartDate={new Date('12/15/2024')}
          projectEndDate={new Date('12/31/2026')}
          actionComplete={(args) => {
            if (args.requestType === 'save') {
              console.log('Aggiornamento completato:', args.data);
              onUpdateEvent(args.data); // Aggiorna il backend
              ganttRef.current.refresh(); // Forza il refresh visivo
            }
          }}

          taskType="FixedWork"

          actionBegin={(args) => {
            
            if (args.requestType === 'beforeSave') {
              // Se l'evento è un figlio
              if (args.data.parentID !== null) {
                const originalEvent = ganttData.find((event) => event.Id === args.data.Id);

                // Controlla se la CommessaId è cambiata
                if (originalEvent && originalEvent.CommessaId !== args.data.CommessaId) {
                  console.log(`Commessa cambiata per evento figlio ${args.data.Id}`);
                  args.data.parentID = null; // Rimuovi il parentID
                }
              }

              // Gestione della modifica generale
              
              onUpdateEvent(args.data); // Assicurati che `onUpdateEvent` riceva i dati corretti
            }

            if (args.requestType === 'beforeDelete') {
              onDeleteEvent(args.data[0].Id); // Elimina l'evento
            }

            if (args.requestType === 'beforeAdd') {
              console.log('Dati prima di aggiungere:', args);

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
          }}

        >

          <Inject services={[DayMarkers, Selection, DayMarkers, Toolbar, Edit, Resize, RowDD, Filter, ExcelExport, PdfExport,]} />



        </GanttComponent>

      ) : (
        <p>Caricamento dati...</p>
      )}
    </div>
  );
};

export default Gantt;