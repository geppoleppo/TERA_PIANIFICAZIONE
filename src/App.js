// App.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { TwitterPicker } from 'react-color';
import './App.css';
import Scheduler from './components/Scheduler';

const App = () => {
  const [resources, setResources] = useState([]); // Collaboratori
  const [commesse, setCommesse] = useState([]);   // Commesse dal DB
  const [selectedCollaboratore, setSelectedCollaboratore] = useState([]);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});
  const [scheduleData, setScheduleData] = useState([]);  // Dati per lo scheduler
  const [ganttData, setGanttData] = useState([]);        // Dati per il Gantt

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collaboratoriResponse = await axios.get('http://localhost:4443/api/collaboratori');
        setResources(collaboratoriResponse.data);

        const commesseResponse = await axios.get('http://localhost:4443/api/commesse');
        setCommesse(commesseResponse.data);

        const eventiResponse = await axios.get('http://localhost:4443/api/eventi');
        const eventiData = formatEventData(eventiResponse.data); // Usa la funzione formatEventData per formattare i dati
        setScheduleData(eventiData);

        console.log("Collaboratori caricati:", collaboratoriResponse.data);
        console.log("Commesse caricate:", commesseResponse.data);
        console.log("Eventi caricati:", eventiData);

      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, []);

  const formatEventData = (eventi) => {
    return eventi.map(evento => {
      const collaboratoriId = Array.isArray(evento.IncaricatoId)
        ? evento.IncaricatoId.map(id => parseInt(id, 10))
        : evento.IncaricatoId
        ? evento.IncaricatoId.split(',').map(id => parseInt(id, 10))
        : [];

      return {
        Id: evento.Id,
        Subject: evento.Subject || 'Nessun titolo',
        StartTime: new Date(evento.StartTime).toISOString(),
        EndTime: new Date(evento.EndTime).toISOString(),
        CategoryColor: evento.CategoryColor || '#000000',
        CollaboratoreId: collaboratoriId, // Ora CollaboratoreId è sempre un array
        CommessaName: evento.CommessaName || 'Nessuna commessa'
      };
    });
  };

  const handleCollaboratoreChange = async (selectedOptions) => {
    setSelectedCollaboratore(selectedOptions);

    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedCommesse([]); 
      return;
    }

    try {
      const requests = selectedOptions.map(option => axios.get(`http://localhost:4443/api/commesse/collaboratore/${option.value}`));
      const responses = await Promise.all(requests);

      const commesseAssociate = responses
        .map(response => response.data.map(commessa => commessa.CommessaName))
        .reduce((commune, commessaList) => {
          return commune.filter(commessa => commessaList.includes(commessa));
        });

      const commesseVisualizzabili = commesseAssociate.map(commessaName => ({
        value: commessaName,
        label: commessaName
      }));

      setSelectedCommesse(commesseVisualizzabili);

    } catch (error) {
      console.error('Errore nel caricamento delle commesse per i collaboratori selezionati:', error);
    }
  };

  const handleColorChange = (color, commessaName) => {
    setCommessaColors(prevColors => ({
      ...prevColors,
      [commessaName]: color.hex
    }));
  };

  const saveSelectedCommesse = async () => {
    try {
      const commesseToSave = selectedCommesse.map(option => ({
        commessaName: option.value,
        colore: commessaColors[option.value] || '#000000'
      }));

      await Promise.all(selectedCollaboratore.map(collaboratore => 
        axios.post('http://localhost:4443/api/associate-commesse-collaboratore', {
          collaboratoreId: collaboratore.value,
          commesse: commesseToSave
        })
      ));

      alert('Commesse associate e salvate con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio delle commesse:', error);
      alert('Errore nel salvataggio delle commesse');
    }
  };

  return (
    <div className="app-container">
      {/* Prima sezione: Associazione commesse ai collaboratori */}
      <div className="menu-container">
        <h3>Associa commesse ai collaboratori</h3>

        {/* Seleziona il collaboratore */}
        <Select
          isMulti
          options={resources
            .filter(resource => resource && resource.Id && resource.Nome)
            .map(collaboratore => ({
              value: collaboratore.Id,
              label: collaboratore.Nome
            }))}
          value={selectedCollaboratore}
          onChange={handleCollaboratoreChange}
          placeholder="Seleziona collaboratori"
        />

        {/* Seleziona le commesse per il collaboratore */}
        <Select
          isMulti
          options={commesse
            .filter(commessa => commessa && commessa.CommessaName && commessa.Descrizione)
            .map(commessa => ({
              value: commessa.CommessaName,
              label: commessa.CommessaName
            }))}
          value={selectedCommesse}
          onChange={setSelectedCommesse}
          placeholder="Seleziona commesse"
        />

        {/* Seleziona il colore per ogni commessa */}
        {selectedCommesse.map((commessa, index) => (
          <div key={index}>
            <span>{commessa.label}</span>
            <TwitterPicker
              color={commessaColors[commessa.value] || '#000000'}
              onChangeComplete={(color) => handleColorChange(color, commessa.value)}
            />
          </div>
        ))}

        {/* Salva le commesse e i colori */}
        <button onClick={saveSelectedCommesse}>Salva</button>
      </div>

      {/* Scheduler */}
      <Scheduler
        data={Array.isArray(scheduleData) ? scheduleData : []} // Controlla se scheduleData è un array
        onDataChange={setScheduleData}
        commessaColors={commessaColors}
        commesse={commesse}
        resources={resources}
      />
    </div>
  );
};

export default App;
