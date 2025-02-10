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
  Sort,
} from '@syncfusion/ej2-react-gantt';
import { DataManager, WebApiAdaptor, Query } from '@syncfusion/ej2-data';
import { DropDownList } from '@syncfusion/ej2-dropdowns';

import { ComboBox } from '@syncfusion/ej2-dropdowns';
//const indirizzo_url='http://localhost:3003'



const Gantt = forwardRef(({ onEventsUpdate,indirizzo_url}, ref) => {
  const ganttRef = useRef(null);
  const [editingResources, setResources] = useState([]); // Stato per i dati delle risorse
  const [tasks, setTasks] = useState([]);
  const [commesse, setCommesse] = useState([]); // Stato per le commesse disponibili

  const handleSaveEvent = async (eventData) => {
    try {
      const response = await fetch(indirizzo_url+`/api/eventi/${eventData.Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Errore aggiornamento evento: ${response.statusText}`);
      }

      console.log(`Evento ${eventData.Id} aggiornato con successo!`);
    } catch (error) {
      console.error("Errore nel salvataggio dell'evento:", error);
    }
  };

  const handleCreateEvent = async (newEvent) => {
    try {
      const response = await fetch(indirizzo_url+"/api/eventi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error(`Errore creazione evento: ${response.statusText}`);
      }

      console.log("Nuovo evento creato con successo!");
    } catch (error) {
      console.error("Errore nella creazione dell'evento:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(indirizzo_url+`/api/eventi/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Errore eliminazione evento: ${response.statusText}`);
      }

      console.log(`Evento ${eventId} eliminato con successo!`);
    } catch (error) {
      console.error("Errore nell'eliminazione dell'evento:", error);
    }
  };




  // Configura il DataManager per leggere i collaboratori
  const resourceDataManager = new DataManager({
    url: indirizzo_url+'/api/collaboratori', // Endpoint API REST
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

  // Carica gli eventi dal database
  useEffect(() => {
    console.log("USE EFFECT 2")
    const eventDataManager = new DataManager({
      url: indirizzo_url+'/api/eventi',
      adaptor: new WebApiAdaptor(),
      crossDomain: true,
    });

    eventDataManager.executeQuery(new Query()).then((response) => {
      setTasks(response.result || []);
      console.log('Eventi caricati:', response.result);

      // 📌 Passiamo gli eventi aggiornati a App.js
      if (typeof onEventsUpdate === "function") {
        onEventsUpdate(response.result);
      }
    }).catch((error) => {
      console.error('Errore nel caricamento degli eventi:', error);
    });
  }, []);


  useEffect(() => {
    console.log("📢 Gantt ha ricevuto nuovi eventi:", tasks);
  }, [tasks]);


  useEffect(() => {
    console.log("USE EFFECT 3")
    if (ref) {
      ref.current = ganttRef.current;
    }
    if (ganttRef.current) {
      ganttRef.current.fitToProject();
    }
  }, [ref]);

  useEffect(() => {
    console.log("USE EFFECT 4")
    if (ganttRef.current && editingResources.length > 0) {
      console.log('Aggiorno risorse nel Gantt.');
      ganttRef.current.editingResources = editingResources; // Passa le risorse direttamente al Gantt
      ganttRef.current.dataBind();
    }
  }, [editingResources]);

  // Carica le commesse disponibili
  useEffect(() => {
    console.log("🔄 Caricamento commesse...");
    setCommesse([]); // Svuota le commesse per evitare problemi con dati obsoleti

    fetch(indirizzo_url + "/api/commesse")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                setCommesse(data);
                console.log("✅ Commesse caricate:", data);
            } else {
                console.warn("⚠️ Nessuna commessa disponibile.");
            }
        })
        .catch(error => {
            console.error("❌ Errore nel caricamento delle commesse:", error);
        });
}, []);

const [isLoading, setIsLoading] = useState(true); // 🔥 Stato per gestire il caricamento

useEffect(() => {
    console.log("🔄 Caricamento eventi dal database...");
    setIsLoading(true); // Inizio caricamento

    fetch(`${indirizzo_url}/api/eventi`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore HTTP! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ Eventi caricati:", data);
            setTasks(data);
            setIsLoading(false); // 🔥 Dati caricati, fine caricamento
        })
        .catch(error => {
            console.error("❌ Errore nel caricamento degli eventi:", error);
            setIsLoading(false);
        });
}, []);

useEffect(() => {
    console.log("🔄 Caricamento risorse dal database...");
    setIsLoading(true);

    fetch(`${indirizzo_url}/api/collaboratori`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Risorse caricate:", data);
            setResources(data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error("❌ Errore nel caricamento delle risorse:", error);
            setIsLoading(false);
        });
}, []);

useEffect(() => {
    console.log("🔄 Caricamento commesse...");
    setIsLoading(true);

    fetch(`${indirizzo_url}/api/commesse`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Commesse caricate:", data);
            setCommesse(data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error("❌ Errore nel caricamento delle commesse:", error);
            setIsLoading(false);
        });
}, []);

useEffect(() => {
    if (!isLoading && ganttRef.current) {
        console.log("🔄 Forzando il refresh completo del Gantt");
        ganttRef.current.refresh();
    }
}, [tasks, isLoading]);


  const refreshGantt = () => {
    if (ganttRef.current) {
      console.log('Forzando il refresh completo del Gantt');

      try {
        ganttRef.current.dataBind();
        ganttRef.current.refresh();

      } catch (error) {
        console.error("Errore durante il refresh del Gantt:", error);
      }
    }
  };

  const handleAddIndicator = (indicator) => {
    console.log("📢 handleAddIndicator chiamato con:", indicator);

    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.Id === indicator.taskId
          ? {
            ...event,
            Indicators: [...(event.Indicators || []), indicator],
          }
          : event
      );

      console.log("📢 Eventi aggiornati con gli indicatori:", updatedEvents);

      // 📢 Passiamo gli eventi aggiornati al Gantt
      if (ganttRef1.current) {
        console.log("🔄 Aggiornamento forzato del Gantt con i nuovi indicatori!");
        ganttRef1.current.dataSource = updatedEvents;
        ganttRef1.current.refresh();
      }

      return updatedEvents;
    });

    setShowIndicatorModal(false);
  };



  console.log("tasks: ", tasks)

  return (
    <div>
        {isLoading ? (
            <p>⏳ Caricamento dati in corso...</p> // 🔥 Mostriamo un messaggio mentre i dati vengono caricati
        ) : (
            <>
                <button onClick={() => {
                    console.log("🔄 Ricaricamento commesse...");
                    fetch(indirizzo_url + "/api/commesse")
                        .then(response => response.json())
                        .then(data => setCommesse(data))
                        .catch(error => console.error("Errore nel caricamento delle commesse:", error));
                }}>
                    🔄 Ricarica Commesse
                </button>

      <GanttComponent
        taskType="FixedDuration"  // 👈 Evita che la durata cambi automaticamente
        validateManualTasksOnLinking={false}  // 👈 Disabilita modifiche automatiche alla durata
        id="ganttChart"
        ref={ganttRef}
        dataSource={tasks}
        risorse={tasks.resourceInfo}
        taskFields={{
          id: 'Id',
          name: 'Subject',
          startDate: 'StartTime',
          endDate: 'EndTime',
          duration: 'Duration',
          dependency: 'Predecessors',
          progress: 'Progress',
          resourceInfo: 'resources',
          parentID: 'parentID',
          CommessaName: 'CommessaName',
          indicators: 'Indicators', // 👈 Aggiunto per supportare gli indicators
          notes: 'info',
        }}

        selectionSettings={{
          mode: 'Cell',
          type: 'Multiple ',
          enableToggle: true,
        }}
        columns={[
          { field: 'Id', visible: true },
          {
            field: 'CommessaName',
            headerText: 'Commessa',
            width: '250',
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
                // ⏳ Attendere il caricamento delle commesse
                if (!commesse.length) {
                  console.warn("⚠️ Nessuna commessa trovata! Assicurati che l'API funzioni correttamente.");
                  args.element.innerHTML = '<span style="color: red;">⚠️ Nessuna commessa disponibile</span>';
                  return;
                }
          
                const dropdown = new DropDownList({
                  dataSource: commesse,
                  fields: { text: 'CommessaName', value: 'CommessaName' },
                  value: args.rowData.CommessaName || null,
                  placeholder: 'Seleziona una commessa...',
                  allowFiltering: true,
                  filterType: 'Contains',
                  change: (e) => {
                    args.rowData.CommessaName = e.value;
                    console.log("🔹 Commessa aggiornata:", e.value);
                  },
                  actionComplete: () => {
                    console.log("📌 DropDownList aggiornato con le commesse:", commesse);
                  }
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
            field: 'Subject',
            headerText: 'AMBITO',
            width: 250,
            edit: {
              create: () => {
                const input = document.createElement('input');
                input.className = 'e-field';
                return input;
              },
              read: (element) => element.ej2_instances?.[0]?.value || null,
              write: (args) => {
                if (!args?.element) return;
          
                const subjectOptions = [
                  { value: "Impianti elettrici - PFTE", text: "Impianti elettrici - PFTE" },
                  { value: "Impianti elettrici - PE", text: "Impianti elettrici - PE" },
                  { value: "Impianti meccanici - PFTE", text: "Impianti meccanici - PFTE" },
                  { value: "Impianti meccanici - PE", text: "Impianti meccanici - PE" },
                  { value: "Impianti meccanici - DL", text: "Impianti meccanici - DL" },
                  { value: "Sicurezza Progettuale", text: "Sicurezza Progettuale" },
                  { value: "Sicurezza Esecutiva", text: "Sicurezza Esecutiva" },
                  { value: "Ambiente", text: "Ambiente" },
                  { value: "Energia", text: "Energia" },
                  { value: "Gare", text: "Gare" },
                  { value: "Seleziona una commessa...", text: "🔽 Seleziona una commessa..." } // Opzione speciale per commesse
                ];
          
                const comboBox = new ComboBox({
                  dataSource: subjectOptions,
                  fields: { text: 'text', value: 'value' },
                  value: args.rowData.Subject || '',
                  placeholder: 'Seleziona o scrivi un task...',
                  allowCustom: true, // 🔥 Permette inserimento manuale
                  change: (e) => {
                    if (e.value === "Seleziona una commessa...") {
                      // Se l'utente sceglie questa opzione, apriamo il dropdown per le commesse
                      setTimeout(() => {
                        const dropdown = new DropDownList({
                          dataSource: commesse,
                          fields: { text: 'CommessaName', value: 'CommessaName' },
                          placeholder: 'Scegli una commessa...',
                          allowFiltering: true,
                          filterType: 'Contains',
                          change: (ev) => {
                            args.rowData.Subject = ev.value; // Imposta il valore della commessa
                            comboBox.value = ev.value; // Aggiorna il ComboBox
                            console.log("🔹 Commessa selezionata:", ev.value);
                          },
                        });
          
                        dropdown.appendTo(args.element);
                      }, 200);
                    } else {
                      args.rowData.Subject = e.value;
                      console.log("Task Name aggiornato:", e.value);
                    }
                  },
                });
          
                comboBox.appendTo(args.element);
                args.column.comboBoxInstance = comboBox;
              },
              destroy: (args) => {
                if (args?.column?.comboBoxInstance) {
                  args.column.comboBoxInstance.destroy();
                  args.column.comboBoxInstance = null;
                }
              },
            },
          },
          
          
          { field: 'isManual', headerText: 'Manual Task', width: '150', editType: 'booleanedit', visible: false },
          { field: 'resources', headerText: 'RISORSE', width: '200', editType: 'dropdownedit' },
          {
            field: 'parentID',
            headerText: 'Parent Task',
            visible: true,
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
                  ...tasks
                    .filter(task => task.Id !== args.rowData.Id) // Esclude l'ID dell'evento stesso
                    .map(task => ({
                      value: task.Id,
                      text: task.CommessaName + '-' + task.Subject,
                    }))
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


        resources={editingResources} // Usa le risorse caricate nello stato
        resourceFields={{
          id: 'resourceId',
          name: 'resourceName',
          unit: 'unit',
          group: 'resourceGroup',
        }}
        height="800px"
        
        allowSorting={true}
        enableContextMenu={true}
        highlightWeekends={true}
        allowFiltering={true}
        allowRowDragAndDrop={ true}
        allowTaskbarDragAndDrop={ true}

        toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 'Search']}

        treeColumnIndex={1}
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
          console.log("AZIONE", args.requestType);
          if (args.requestType === 'beforeDrop') {
            console.log('Intercepting beforeDrop:', args);
          }

          if (args.requestType === 'beforeSave') {
            console.log('Intercepting beforeSave:', args.data.ganttProperties);

            // Usa un fallback più sicuro
            const previousParentId = args.data.ganttProperties?.parentID ?? args.data.ganttProperties?.parentId ?? null;
            const newParentId = args.data.parentID ?? args.data.parentId ?? null;

            if (previousParentId !== newParentId) {
              console.log('Parent ID modificato:', previousParentId, '→', newParentId);

              // Verifica che il Gantt sia inizializzato prima di aggiornare
              if (ganttRef.current) {
                setTimeout(() => {
                  refreshGantt();
                }, 200); // Delay per evitare problemi di rendering
              }
            }

            // Assegna il nuovo valore al parentID
            args.data.ganttProperties.parentID = newParentId;
            args.data.ganttProperties.parentId = newParentId; // Copia anche in parentId per sicurezza
            args.data.taskData.parentID = newParentId;
          }
        }}


        actionComplete={async (args) => {
          if (args.requestType === "save") {
              console.log("Salvataggio completato:", args.data);
              await handleSaveEvent(args.data);
          }
      
          if (args.action === "add") {
              console.log("📌 Nuovo evento aggiunto:", args.data);
              await handleCreateEvent(args.data);
          }
      
          if (args.requestType === "delete") {
              console.log("🔴 Eliminazione multipla di eventi:", args.data);
              if (Array.isArray(args.data) && args.data.length > 0) {
                  for (const event of args.data) {
                      console.log(`📌 Eliminazione evento ID: ${event.Id}`);
                      await handleDeleteEvent(event.Id);
                  }
              } else {
                  console.warn("⚠️ Nessun evento da eliminare trovato.");
              }
          }
      
          if (args.requestType === "rowDropped") {
              console.log("📌 Drag and Drop completato:", args);
      
              const draggedTask = args.modifiedRecords?.[0]; // Primo elemento spostato
              if (draggedTask) {
                  const updatedParentId = draggedTask.parentID || null; // Nuovo parent ID
                  const taskId = draggedTask.Id;
      
                  console.log(`🔄 Aggiornamento ParentID: Task ${taskId} → Parent ${updatedParentId}`);
      
                  // Aggiorna il database con il nuovo parentID
                  try {
                      const response = await fetch(`${indirizzo_url}/api/eventi/${taskId}`, {
                          method: "PUT",
                          headers: {
                              "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ parentID: updatedParentId }),
                      });
      
                      if (!response.ok) {
                          throw new Error(`Errore aggiornamento parentID: ${response.statusText}`);
                      }
      
                      console.log(`✅ ParentID aggiornato con successo per Task ${taskId}`);
                  } catch (error) {
                      console.error("❌ Errore nell'aggiornamento del parentID:", error);
                  }
              }
          }
      }}
      
      >
        <Inject services={[Edit, Toolbar, Selection, Resize, RowDD, DayMarkers, Filter,Sort]} />
      </GanttComponent>
      </>
        )}
    </div>
  );
});

export default Gantt;