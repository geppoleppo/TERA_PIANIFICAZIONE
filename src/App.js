import React, { useState, useEffect } from 'react';
import Scheduler from './components/Scheduler';
import Gantt from './components/Gantt';
import axios from 'axios';
import Select from 'react-select';
import { TwitterPicker } from 'react-color';
import './App.css';



const App = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [resources, setResources] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [commesse, setCommesse] = useState([]);
  const [mysqlCommesse, setMysqlCommesse] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [ganttKey, setGanttKey] = useState(0);
  const port = 3001;
  // Definisci lo stato per i collaboratori selezionati
const [selectedResources, setSelectedResources] = useState([]);
const [initialCommesse, setInitialCommesse] = useState([]);


const handleResourceSelection = async (selectedOptions) => {
  const selectedIds = selectedOptions.map(option => option.value);
  setSelectedResources(selectedIds);

  if (selectedIds.length > 0) {  // Selezionati uno o più collaboratori
    const commesseResponse = await axios.get(`http://localhost:${port}/api/commesse`);
    const allCommesse = commesseResponse.data;

    // Filtra le commesse comuni a tutti i collaboratori selezionati
    const commonCommesse = allCommesse.filter(commessa => {
      const commessaCollaboratori = commessa.Collaboratori ? commessa.Collaboratori.split(',') : [];
      return selectedIds.every(id => commessaCollaboratori.includes(id.toString()));
    });

    const formattedCommesse = commonCommesse.map(commessa => ({
      value: commessa.CommessaName,
      label: commessa.Descrizione,
      color: commessa.Colore
    }));

    setInitialCommesse(formattedCommesse);  // Memorizza lo stato iniziale
    setSelectedCommesse(formattedCommesse); // Visualizza le commesse comuni associate
  } else {
    setSelectedCommesse([]);  // Nessun collaboratore selezionato, svuota il menu delle commesse
  }
};



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          collaboratoriResponse,
          commesseResponse,
          mysqlCommesseResponse,
          selectedCommesseResponse
        ] = await Promise.all([
          axios.get(`http://localhost:`+port+`/api/collaboratori`),
          axios.get(`http://localhost:`+port+`/api/commesse`),
          axios.get(`http://localhost:`+port+`/api/commesse-mysql`),
          
        ]);

        const staticCollaboratori = collaboratoriResponse.data;
        const staticCommesse = commesseResponse.data;
        const mysqlCommesse = mysqlCommesseResponse.data.map(commessa => ({
          value: commessa.NOME,
          label: commessa.NOME
        }));
        const selectedCommesse = commesseResponse.data.map(commessa => ({
          value: commessa.CommessaName,
          label: commessa.Descrizione,
          color: commessa.Colore
        }));

        setResources(staticCollaboratori);
        setCommesse(staticCommesse);
        setMysqlCommesse(mysqlCommesse);
//        setSelectedCommesse(selectedCommesse);

        const colors = selectedCommesse.reduce((acc, commessa) => {
          acc[commessa.value] = commessa.color;
          return acc;
        }, {});
        setCommessaColors(colors);

        const eventiResponse = await axios.get(`http://localhost:`+port+`/api/eventi`);
        const staticSchedulerData = eventiResponse.data.map(event => formatEventForScheduler(event, colors));

        setScheduleData(staticSchedulerData);
        setGanttData(staticSchedulerData.map(event => formatGanttData(event, staticCommesse, colors)));
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, []);

  const handleCommesseChange = (selectedOptions) => {
    console.log('SELECTDED OPTIONS:',selectedOptions)
    setSelectedCommesse(selectedOptions);
    applyGanttFilter(selectedOptions);
  };

  const handleColorChange = (color, index) => {
    const updatedSelectedCommesse = [...selectedCommesse];
    updatedSelectedCommesse[index].color = color.hex;
    setSelectedCommesse(updatedSelectedCommesse);

    const colors = updatedSelectedCommesse.reduce((acc, commessa) => {
      acc[commessa.value] = commessa.color;
      return acc;
    }, {});
    setCommessaColors(colors);
  };

  const saveSelectedCommesse = async () => {
    console.log("Funzione saveSelectedCommesse invocata");  // Log per verificare l'invocazione della funzione
  
    try {
      console.log("selectedCommesse:", selectedCommesse);  // Controlla le commesse selezionate
      console.log("selectedResources:", selectedResources);  // Controlla i collaboratori selezionati
      console.log("initialCommesse:", initialCommesse);  // Controlla le commesse iniziali
  
      // Mappa le commesse selezionate
      const commesseToSave = selectedCommesse.map(option => ({
        descrizione: option.label,
        colore: option.color || '#000000',
        collaboratori: selectedResources.join(',')  // Collaboratori attuali uniti da virgole
      }));
  
      console.log("COMMESSE to save:", commesseToSave);  // Verifica il contenuto delle commesse da salvare
  
      // Identifica le commesse rimosse rispetto a quelle iniziali
      const commesseRimosse = initialCommesse.filter(initialCommessa =>
        !selectedCommesse.some(selectedCommessa => selectedCommessa.value === initialCommessa.value)
      );
  
      console.log("COMMESSE RIMOSSE:", commesseRimosse);  // Verifica il contenuto delle commesse rimosse
  
      // Verifica se ci sono commesse rimosse
      if (commesseRimosse.length > 0) {
        for (const commessaRimossa of commesseRimosse) {
          console.log("Elaborando commessa rimossa:", commessaRimossa);
  
          // Ottieni la commessa corrente dal database
          const commessa = await axios.get(`http://localhost:${port}/api/commessa/${commessaRimossa.value}`);
          console.log("Collaboratori prima della rimozione:", commessa.data.Collaboratori);
                   
  
          // Rimuovi il collaboratore corrente dai collaboratori associati
          const collaboratori = commessa.data.Collaboratori
          .split(',')
          .map(collaboratore => collaboratore.trim()) // Assicuriamoci di rimuovere spazi vuoti
          .filter(collaboratore => !selectedResources.map(String).includes(collaboratore));
        
        console.log("Collaboratori dopo la rimozione:", collaboratori);
        
            
            // Aggiorna i collaboratori nel database
          await axios.post(`http://localhost:${port}/api/update-commessa`, {
            commessaName: commessaRimossa.value,
            collaboratori: collaboratori.join(',')  // Unisci i collaboratori rimanenti
          });
        }
      } else {
        console.log("Nessuna commessa rimossa");
      }
  
      // Salva le commesse selezionate (aggiunta/aggiornamento)
      await axios.post(`http://localhost:${port}/api/update-sqlite`, { commesse: commesseToSave });
  
      // Fetch updated data and update state
      const updatedCommesseResponse = await axios.get(`http://localhost:${port}/api/commesse`);
      setCommesse(updatedCommesseResponse.data);
    } catch (error) {
      console.error('Failed to update SQLite:', error);
    }
  };
  

  
  
// Funzione per ottenere le commesse comuni
const getCommonCommesse = async () => {
  try {
    if (selectedResources.length === 0) return;

    const commesseResponse = await axios.get(`http://localhost:${port}/api/commesse`);
    const allCommesse = commesseResponse.data;

    const commonCommesse = allCommesse.filter(commessa => {
      const commessaCollaboratori = commessa.Collaboratori ? commessa.Collaboratori.split(',') : [];
      return selectedResources.every(id => commessaCollaboratori.includes(id.toString()));
    });

    setScheduleData(commonCommesse);
    setGanttData(commonCommesse.map(event => formatGanttData(event, commesse, commessaColors)));
  } catch (error) {
    console.error('Errore nel caricamento delle commesse comuni:', error);
  }
};


  

  const removeCommessa = (index) => {
    const updatedSelectedCommesse = [...selectedCommesse];
    updatedSelectedCommesse.splice(index, 1);
    setSelectedCommesse(updatedSelectedCommesse);

    const colors = updatedSelectedCommesse.reduce((acc, commessa) => {
      acc[commessa.value] = commessa.color;
      return acc;
    }, {});
    setCommessaColors(colors);

    // Filter scheduler data based on updated selected commesse
    const selectedCommessaNames = updatedSelectedCommesse.map(c => c.value);
    const filteredScheduleData = scheduleData.filter(event => selectedCommessaNames.includes(event.CommessaName));
    setScheduleData(filteredScheduleData);
    setGanttData(filteredScheduleData.map(event => formatGanttData(event, commesse, colors)));
  };

  const applyGanttFilter = (selectedOptions) => {
    const selectedCommessaNames = selectedOptions.map(option => option.value);
    const filteredGanttData = scheduleData.filter(event => selectedCommessaNames.includes(event.CommessaName));
    setGanttData(filteredGanttData.map(event => formatGanttData(event, commesse, commessaColors)));
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSchedulerDataChange = debounce((args) => {
    const event = convertToStandardFormat(args.data[0]);

    switch (args.requestType) {
      case 'eventCreated':
        axios.post(`http://localhost:`+port+`/api/eventi`, event)
          .then(response => {
            updateLocalData(response.data, 'add');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to create event:', error));
        break;
      case 'eventChanged':
        axios.put(`http://localhost:`+port+`/api/eventi/${event.Id}`, event)
          .then(() => {
            updateLocalData(event, 'update');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to update event:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:`+port+`/api/eventi/${event.Id}`)
          .then(() => {
            updateLocalData(event, 'delete');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to delete event:', error));
        break;
      default:
        break;
    }
  }, 300);

  const handleGanttDataChange = debounce((args) => {
    const task = convertToStandardFormat(args.data[0]);

    switch (args.requestType) {
      case 'eventChanged':
        axios.put(`http://localhost:`+port+`/api/eventi/${task.Id}`, task)
          .then(() => {
            updateLocalData(task, 'update');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to update task:', error));
        break;
      case 'eventRemoved':
        axios.delete(`http://localhost:`+port+`/api/eventi/${task.Id}`)
          .then(() => {
            updateLocalData(task, 'delete');
            reloadSchedulerData();
          })
          .catch(error => console.error('Failed to delete task:', error));
        break;
      default:
        break;
    }
  }, 300);

  const updateLocalData = (data, type) => {
    let updatedScheduleData = [...scheduleData];
    switch (type) {
      case 'add':
        updatedScheduleData = [...updatedScheduleData, formatEventForScheduler(data, commessaColors)];
        break;
      case 'update':
        updatedScheduleData = updatedScheduleData.map(item => item.Id === data.Id ? formatEventForScheduler(data, commessaColors) : item);
        break;
      case 'delete':
        updatedScheduleData = updatedScheduleData.filter(item => item.Id !== data.Id);
        break;
      default:
        break;
    }
    const selectedCommessaNames = selectedCommesse.map(c => c.value);
    const filteredScheduleData = updatedScheduleData.filter(event => selectedCommessaNames.includes(event.CommessaName));
    setScheduleData(filteredScheduleData);
    setGanttData(filteredScheduleData.map(item => formatGanttData(item, commesse, commessaColors)));
    setGanttKey(prevKey => prevKey + 1); // Increment key to force re-render
  };

  const reloadSchedulerData = async () => {
    try {
      const eventiResponse = await axios.get(`http://localhost:`+port+`/api/eventi`);
      const staticSchedulerData = eventiResponse.data.map(event => formatEventForScheduler(event, commessaColors));

      const selectedCommessaNames = selectedCommesse.map(c => c.value);
      const filteredScheduleData = staticSchedulerData.filter(event => selectedCommessaNames.includes(event.CommessaName));
      setScheduleData(filteredScheduleData);
      setGanttData(filteredScheduleData.map(item => formatGanttData(item, commesse, commessaColors)));
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    }
  };

  const convertToStandardFormat = (event) => {
    const startDate = event.StartTime || event.StartDate || new Date().toISOString();
    const endDate = event.EndTime || event.EndDate || new Date().toISOString();

    const incaricatoId = event.IncaricatoId && event.IncaricatoId !== '' 
                         ? event.IncaricatoId 
                         : (event.taskData ? event.taskData.IncaricatoId : '');

    return {
      ...event,
      Inizio: startDate,
      Fine: endDate,
      Descrizione: event.Subject || event.TaskName,
      CommessaName: event.CommessaName,
      IncaricatoId: Array.isArray(incaricatoId) ? incaricatoId.join(',') : incaricatoId || '',
      Dipendenza: event.Predecessor || '',
      Colore: event.Color || commessaColors[event.CommessaName] || '#000000'
    };
  };

  const formatEventForScheduler = (event, colors) => {
    return {
      Id: event.Id,
      Subject: event.Descrizione,
      StartTime: new Date(event.Inizio),
      EndTime: new Date(event.Fine),
      CommessaName: event.CommessaName,
      IncaricatoId: event.IncaricatoId ? event.IncaricatoId.split(',').map(id => parseInt(id, 10)) : [],
      Color: event.Colore || colors[event.CommessaName] || '#000000',
      Progress: event.Progresso,
      Dipendenza: event.Dipendenza
    };
  };

  const formatGanttData = (task, commesse, colors) => {
    return {
      Id: task.Id,
      TaskName: task.Descrizione || task.Subject,
      StartDate: task.StartTime ? new Date(task.StartTime) : new Date(),
      EndDate: task.EndTime ? new Date(task.EndTime) : new Date(),
      Predecessor: task.Dipendenza || '',
      Progress: task.Progresso || 0,
      Color: task.Colore || colors[task.CommessaName] || '#000000',
      CommessaName: task.CommessaName || '',
      IncaricatoId: task.IncaricatoId || ''
    };
  };

  return (
    <div className="app-container">

      <div className="menu-container">
  
      <Select
    isMulti
    options={resources.map(resource => ({ value: resource.Id, label: resource.Nome }))}
    onChange={handleResourceSelection}
    placeholder="Seleziona collaboratori"
  />
  <Select
    isMulti
    options={mysqlCommesse}
    value={selectedCommesse}
    onChange={handleCommesseChange}
    placeholder="Seleziona commesse da monitorare"
  />

  <div className="commesse-container">
    {selectedCommesse.map((commessa, index) => (
      <div key={index} className="commessa-card">
        <span>{commessa.label}</span>
        <TwitterPicker
          color={commessa.color || '#000000'}
          onChangeComplete={(color) => handleColorChange(color, index)}
        />
        <button onClick={() => removeCommessa(index)}>Rimuovi</button>
      </div>
    ))}
  </div>
  <button onClick={() => { console.log('Pulsante Memorizza cliccato'); saveSelectedCommesse(); }}>Memorizza</button>

  <button onClick={getCommonCommesse}>Carica Commesse Comuni</button>
</div>

      <Scheduler
        data={scheduleData}
        resources={resources}
        onDataChange={handleSchedulerDataChange}
        commessaColors={commessaColors}
        commesse={commesse}
      />
      <Gantt
        key={ganttKey}
        data={ganttData}
        onDataChange={handleGanttDataChange}
        commessaColors={commessaColors}
        commesse={commesse}
        resources={resources}
      />
    </div>
  );
};

export default App;
