// Functions.js
export const handleCollaboratoreChange = (selectedOptions, setSelectedCollaboratori) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedCollaboratori(selectedIds);
  };

    // Funzione per gestire la selezione delle commesse

export const handleCommesseChange = (selectedOptions, projectResources, setSelectedCommesse) => {
    const updatedCommesse = selectedOptions.map(option => {
      // Trova la commessa corrispondente nel projectResources per ottenere il colore corretto
      const commessa = projectResources.find(p => p.id === option.value);
      return {
        value: option.value,
        label: option.label,
        color: commessa ? commessa.color : '#000000' // Usa il colore corretto o #000000 come fallback
      };
    });
    setSelectedCommesse(updatedCommesse);
  };
  // Functions.js

export const handleColorChange = (color, index, selectedCommesse, setSelectedCommesse) => {
    const updatedCommesse = [...selectedCommesse];
    updatedCommesse[index] = { ...updatedCommesse[index], color: color.hex };
    setSelectedCommesse(updatedCommesse);
  };
  
export const removeCommessa = (index, selectedCommesse, setSelectedCommesse) => {
    const updatedCommesse = selectedCommesse.filter((_, i) => i !== index);
    setSelectedCommesse(updatedCommesse);
  };
  