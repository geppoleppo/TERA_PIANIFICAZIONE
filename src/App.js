import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { TwitterPicker } from 'react-color';
import './App.css';

const App = () => {
  const [resources, setResources] = useState([]); // Collaboratori
  const [commesse, setCommesse] = useState([]);   // Commesse dal DB
  const [selectedCollaboratore, setSelectedCollaboratore] = useState(null);
  const [selectedCommesse, setSelectedCommesse] = useState([]);
  const [commessaColors, setCommessaColors] = useState({});

  // Carica collaboratori e commesse dal DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collaboratoriResponse = await axios.get('http://localhost:4443/api/collaboratori');
        setResources(collaboratoriResponse.data);

        const commesseResponse = await axios.get('http://localhost:4443/api/commesse');
        setCommesse(commesseResponse.data);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    fetchData();
  }, []);

  // Gestisce il cambio di collaboratore
  const handleCollaboratoreChange = (option) => {
    setSelectedCollaboratore(option);

    // Carica le commesse associate a quel collaboratore
    if (option) {
      axios.get(`http://localhost:4443/api/commesse/collaboratore/${option.value}`)
        .then(response => {
          const commesseAssociate = response.data.map(commessa => ({
            value: commessa.CommessaName,
            label: commessa.CommessaName,
            color: commessa.Colore || '#000000'
          }));
          setSelectedCommesse(commesseAssociate);

          const colors = commesseAssociate.reduce((acc, commessa) => {
            acc[commessa.value] = commessa.color;
            return acc;
          }, {});
          setCommessaColors(colors);
        })
        .catch(error => {
          console.error('Errore nel caricamento delle commesse associate:', error);
        });
    } else {
      setSelectedCommesse([]);
    }
  };

  // Gestisce il cambio di colore
  const handleColorChange = (color, commessaName) => {
    setCommessaColors(prevColors => ({
      ...prevColors,
      [commessaName]: color.hex
    }));
  };

  // Salva le commesse e i colori per il collaboratore selezionato
  const saveSelectedCommesse = async () => {
    try {
      const commesseToSave = selectedCommesse.map(option => ({
        commessaName: option.value,
        colore: commessaColors[option.value] || '#000000'
      }));
  
      await axios.post('http://localhost:4443/api/associate-commesse-collaboratore', {
        collaboratoreId: selectedCollaboratore.value,
        commesse: commesseToSave
      });
  
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
          options={resources.map(collaboratore => ({
            value: collaboratore.Id,
            label: collaboratore.Nome
          }))}
          value={selectedCollaboratore}
          onChange={handleCollaboratoreChange}
          placeholder="Seleziona un collaboratore"
        />

        {/* Seleziona le commesse per il collaboratore */}
        <Select
          isMulti
          options={commesse.map(commessa => ({
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
    </div>
  );
};

export default App;
