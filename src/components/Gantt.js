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



const Gantt = forwardRef(({ onEventsUpdate, indirizzo_url }, ref) => {
  const ganttRef = useRef(null);
  const [editingResources, setResources] = useState([]); // Stato per i dati delle risorse
  const [tasks, setTasks] = useState([]);
  const [commesse, setCommesse] = useState([]); // Stato per le commesse disponibili
  const [isLoading, setIsLoading] = useState(true);
  const [modifiedTasks, setModifiedTasks] = useState([]);


  /** 🔄 Carica i dati iniziali */
  useEffect(() => {
    console.log("🔄 Caricamento eventi...");
    setIsLoading(true);
    
    fetch(`${indirizzo_url}/api/eventi`)
      .then(res => res.json())
      .then(data => {
        console.log("✅ Eventi caricati:", data);
        setTasks(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("❌ Errore nel caricamento:", error);
        setIsLoading(false);
      });
  }, []);

  /** ✅ Salva tutte le modifiche nel database quando premi il pulsante */

const handleSaveChanges = async () => {  // ⬅️ AGGIUNTO `async` QUI
    const validTasks = modifiedTasks.filter(task => task && task.Id !== undefined);

    if (validTasks.length === 0) {
        alert("⚠️ Nessuna modifica da salvare!");
        return;
    }

    console.log("💾 Salvando tutte le modifiche nel database...", validTasks);

    try {
        await Promise.all(validTasks.map(async (task) => { // ⬅️ Qui ora funziona
            if (task.deleted) {
                console.log(`🗑️ Eliminando Task ${task.Id}...`);
                const response = await fetch(`${indirizzo_url}/api/eventi/${task.Id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error(`Errore eliminazione Task ${task.Id}: ${response.statusText}`);
                }

                console.log(`✅ Task ${task.Id} eliminato con successo!`);
            } else {
                console.log(`⏳ Salvando Task ${task.Id} con orderIndex ${task.orderIndex} e parentID ${task.parentID}...`);

                const response = await fetch(`${indirizzo_url}/api/eventi/${task.Id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(task),
                });

                if (!response.ok) {
                    throw new Error(`Errore aggiornamento Task ${task.Id}: ${response.statusText}`);
                }

                console.log(`✅ Task ${task.Id} salvato con successo!`);
            }
        }));

        alert("✅ Tutte le modifiche sono state salvate!");
        setModifiedTasks([]); // 🔥 Puliamo la lista delle modifiche

    } catch (error) {
        console.error("❌ Errore nel salvataggio delle modifiche:", error);
        alert("❌ Errore nel salvataggio! Controlla la console.");
    }
};




/** 🔄 Raccoglie le modifiche nei task senza aggiornare il DB */
const handleActionComplete = (args) => {
  console.log("🟢 ACTION COMPLETE TRIGGERED:", args); // LOG DEBUG
  console.log("🔄 ACTION COMPLETE:", args.requestType);


  if (args.requestType === "save" || args.requestType === "rowDropped") {
      console.log("📌 Modifica rilevata:", args.data);

      setModifiedTasks(prev => {
          const updated = [...prev.filter(task => task.Id !== args.data.Id), args.data];
          console.log("📋 Lista modifiche aggiornata:", updated);
          return updated;
      });

      setTasks(prevTasks => prevTasks.map(task =>
          task.Id === args.data.Id ? { ...task, ...args.data } : task
      ));
  }

  if (args.requestType === "delete") {
      console.log("🗑️ Eliminazione rilevata:", args.data);

      const deletedTasks = Array.isArray(args.data) ? args.data : [args.data];

      setModifiedTasks(prev => {
          const updated = [...prev, ...deletedTasks.map(task => ({ ...task, deleted: true }))];
          console.log("📋 Lista modifiche aggiornata con eliminazioni:", updated);
          return updated;
      });

      setTasks(prevTasks => prevTasks.filter(task => !deletedTasks.some(delTask => delTask.Id === task.Id)));
  }
};





  /** 🔹 Funzione per duplicare un evento selezionato */
  const handleDuplicateEvent = async () => {
    if (!ganttRef.current) return;

    const selectedRows = ganttRef.current.selectionModule.getSelectedRecords();
    if (!selectedRows || selectedRows.length === 0) {
      alert("⚠️ Seleziona un evento da duplicare!");
      return;
    }

    const selectedEvent = selectedRows[0]; // Prende il primo evento selezionato
    console.log("📑 Evento selezionato per la duplicazione:", selectedEvent);

    // ✅ Crea una copia dell'evento con un nuovo ID e titolo aggiornato
    const duplicatedEvent = {
      ...selectedEvent,
      //Id: null, // ❌ Usa `null` così il database assegna un nuovo ID automaticamente
      Subject: `${selectedEvent.Subject} (Copia)`,
      StartTime: new Date(selectedEvent.StartTime).toISOString(),
      EndTime: new Date(selectedEvent.EndTime).toISOString(),
      IncaricatoId: selectedEvent.IncaricatoId ? selectedEvent.IncaricatoId.replace(/,+$/, '') : '', // ❌ Rimuove la virgola finale
  };
  

    console.log("📌 Nuovo evento duplicato:", duplicatedEvent);

    try {
      const response = await fetch(`${indirizzo_url}/api/eventi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatedEvent),
      });

      if (!response.ok) {
        throw new Error(`Errore duplicazione evento: ${response.statusText}`);
      }

      console.log("✅ Evento duplicato con successo!");
      setTasks([...tasks, duplicatedEvent]); // 🔄 Aggiunge l'evento duplicato alla lista

    } catch (error) {
      console.error("❌ Errore nella duplicazione dell'evento:", error);
    }
  };




  // Configura il DataManager per leggere i collaboratori
  const resourceDataManager = new DataManager({
    url: indirizzo_url + '/api/collaboratori', // Endpoint API REST
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
      url: indirizzo_url + '/api/eventi',
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
        <p>⏳ Caricamento eventi...</p> // 🔥 Mostriamo un messaggio mentre carica
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

          <button onClick={handleDuplicateEvent} style={{ marginLeft: "10px" }}>
            📑 Duplica Evento
          </button>

          <button onClick={handleSaveChanges} style={{ margin: "10px", padding: "10px", fontSize: "16px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
            💾 Salva Modifiche
          </button>



          <GanttComponent
            taskType="FixedDuration"  // 👈 Evita che la durata cambi automaticamente
            validateManualTasksOnLinking={false}  // 👈 Disabilita modifiche automatiche alla durata
            actionComplete={handleActionComplete} 
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
              orderIndex: 'orderIndex',
            }}

            selectionSettings={{
              mode: 'Row',
              type: 'Multiple ',
              enableToggle: true,
            }}



            columns={[
              { field: 'Id', visible: true },
              { field: 'orderIndex', visible: true },
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
                headerText: 'Task',
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
                      { value: "Seleziona una commessa...", text: "🔽 Seleziona una commessa..." }
                    ];

                    const comboBox = new ComboBox({
                      dataSource: subjectOptions,
                      fields: { text: 'text', value: 'value' },
                      value: args.rowData.Subject || '',
                      placeholder: 'Seleziona o scrivi un task...',
                      allowCustom: true,
                      change: (e) => {
                        if (e.value === "Seleziona una commessa...") {
                          console.log("📌 Selezione speciale: Aprire il menu commesse...");

                          // **Preveniamo il blur con `setTimeout`**
                          setTimeout(() => {
                            if (!args.element) return;

                            const dropdownContainer = document.createElement('div');
                            dropdownContainer.style.position = "absolute";
                            dropdownContainer.style.zIndex = "1000"; // Evita sovrapposizioni
                            args.element.appendChild(dropdownContainer);

                            const dropdown = new DropDownList({
                              dataSource: commesse,
                              fields: { text: 'CommessaName', value: 'CommessaName' },
                              placeholder: 'Scegli una commessa...',
                              allowFiltering: true,
                              filterType: 'Contains',
                              open: () => {
                                console.log("📂 DropDown aperto con commesse");
                              },
                              change: (ev) => {
                                args.rowData.Subject = ev.value;
                                comboBox.value = ev.value;
                                console.log("🔹 Commessa selezionata:", ev.value);

                                // **Rimuove il dropdown solo dopo la selezione**
                                setTimeout(() => dropdownContainer.remove(), 100);
                              },
                            });

                            dropdown.appendTo(dropdownContainer);
                          }, 150);
                        } else {
                          args.rowData.Subject = e.value;
                          console.log("✅ Task Name aggiornato:", e.value);
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
              }
              ,



              { field: 'isManual', headerText: 'Manual Task', width: '150', editType: 'booleanedit', visible: false },
              { field: 'resources', headerText: 'RISORSE', width: '200', editType: 'dropdownedit' },
              {
                field: 'parentID',
                headerText: 'Task Genitore',
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
            allowRowDragAndDrop={true}
            allowTaskbarDragAndDrop={true}

            toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 'Search']}

            treeColumnIndex={2}
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
              position: '280px',
            }}

            //sortSettings={{ columns: [{ field: 'orderIndex', direction: 'Ascending' }] }}
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

          >
            <Inject services={[Edit, Toolbar, Selection, Resize, RowDD, DayMarkers, Filter, Sort]} />
          </GanttComponent>
        </>
      )}
    </div>
  );
});


export default Gantt;
