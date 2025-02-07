import React, { useRef, useEffect, useState } from 'react';
import { GanttComponent, Inject, Selection, DayMarkers, Toolbar, Edit, Resize,Filter } from '@syncfusion/ej2-react-gantt';

const GanttResourceView = ({ onEventsUpdate }) => {
    const ganttRef = useRef(null);
    const [tasks, setTasks] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false); // Stato per gestire il caricamento

    // Funzione per caricare i dati dal database
    const loadData = async () => {
        setLoading(true);
        console.log("⏳ Ricaricamento eventi e risorse...");

        try {
            // Carica i dati degli eventi (task)
            const eventiResponse = await fetch('http://localhost:4443/api/eventi');
            const eventiData = await eventiResponse.json();
            setTasks(eventiData);
            if (onEventsUpdate) {
                onEventsUpdate(eventiData);
            }

            // Carica le risorse (collaboratori)
            const risorseResponse = await fetch('http://localhost:4443/api/collaboratori');
            const risorseData = await risorseResponse.json();
            setResources(risorseData);
            
            console.log("✅ Dati caricati con successo!");
        } catch (error) {
            console.error("❌ Errore nel caricamento dei dati:", error);
        } finally {
            setLoading(false);
        }
    };

    // Carica i dati solo al primo caricamento
    useEffect(() => {
        loadData();
    }, []);
    console.log("task gant 2:",tasks)
    let prova=[{
        CategoryColor : "#abb8c3",
        CommessaName : "22013_OPERA_UNIVERSITARIA_BORINO",
        Duration
        : 
        null,
        EndTime
        : 
        "2025-02-18T16:00:00.000Z",
        Id
        : 
        1,
        Predecessors
        : 
        "",
        Progress
        : 
        0,
        StartTime
        : 
        "2025-02-10T07:00:00.278Z",
        Subject
        : 
        "22013_OPERA_UNIVERSITARIA_BORINO",
        parentID
        : 
        null,
        resources
        : 
        [1, 2]


    }]



    return (
        <div>
            <h2>Vista Risorse</h2>

            {/* Pulsante per ricaricare i dati */}
            <button 
                onClick={loadData} 
                disabled={loading} 
                style={{ margin: '10px', padding: '10px', fontSize: '16px' }}
            >
                {loading ? "⏳ Aggiornamento..." : "🔄 Aggiorna"}
            </button>

            

            <GanttComponent
                id="ResourceView"
                ref={ganttRef}
                dataSource={tasks}
                resources={resources}
                viewType="ResourceView"
                showOverAllocation={true}
                taskFields={{
                    id: 'Id',
                    name: 'Subject',
                    startDate: 'StartTime',
                    endDate: 'EndTime',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency: 'Predecessors',
                    resourceInfo: 'resources',
                    work: 'work',
                    child: 'subtasks'
                }}
                taskType="FixedWork"
                
                resourceFields={{
                    id: 'resourceId',
                    name: 'resourceName',
                    unit: 'unit',
                    group: 'resourceGroup'
                }}
                editSettings={{
                    allowAdding: false,
                    allowEditing: false,
                    allowDeleting: false,
                    allowTaskbarEditing: false,
                    showDeleteConfirmDialog: false
                }}
                columns={[
                    { field: 'Id', visible: false },
                    { field: 'Subject', headerText: 'Task Name', width: 250 },
                    { field: 'work', headerText: 'Work' },
                    { field: 'Progress' },
                    { field: 'resourceGroup', headerText: 'Group' },
                    { field: 'StartTime' },
                    { field: 'Duration' },
                ]}
                toolbar={['Cancel', 'ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 'Search']}
                labelSettings={{
                    rightLabel: 'resources',
                    taskLabel: 'Progress'
                }}
                splitterSettings={{
                    columnIndex: 3
                }}
                allowResizing={true}
                allowSelection={true}
                highlightWeekends={true}
                treeColumnIndex={1}
                height="800px"
            >
                <Inject services={[Selection, DayMarkers, Toolbar, Edit, Resize,Filter]} />
            </GanttComponent>
        </div>
    );
};

export default GanttResourceView;
