const commesse = [
    { Text: 'Commessa 1', Id: 1, Color: '#ff0000' },
    { Text: 'Commessa 2', Id: 2, Color: '#00ff00' },
    { Text: 'Commessa 3', Id: 3, Color: '#0000ff' }
  ];
  
  export const getCommessaColor = (commessaId) => {
    const commessa = commesse.find(com => com.Id === commessaId);
    return commessa ? commessa.Color : '#000000';
  };
  
  export default commesse;
  