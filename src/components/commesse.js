const commesse = [
  { Text: 'Commessa 1', Id: 1, Color: '#ff5733' },    // Rosso
  { Text: 'Commessa 2', Id: 2, Color: '#33ff57' },    // Verde
  { Text: 'Commessa 3', Id: 3, Color: '#3357ff' },    // Blu
  { Text: 'Commessa 4', Id: 4, Color: '#ff33a6' },    // Rosa
  { Text: 'Commessa 5', Id: 5, Color: '#33ffd7' },    // Acqua
  { Text: 'Commessa 6', Id: 6, Color: '#a633ff' },    // Viola
  { Text: 'Commessa 7', Id: 7, Color: '#ff8c33' },    // Arancio
  { Text: 'Commessa 8', Id: 8, Color: '#8cff33' },    // Verde chiaro
  { Text: 'Commessa 9', Id: 9, Color: '#338cff' },    // Blu chiaro
  { Text: 'Commessa 10', Id: 10, Color: '#ff3388' },  // Rosa scuro
  { Text: 'Commessa 11', Id: 11, Color: '#33ff88' },  // Verde acqua
  { Text: 'Commessa 12', Id: 12, Color: '#8833ff' },  // Viola scuro
  { Text: 'Commessa 13', Id: 13, Color: '#ff3380' },  // Rosa acceso
  { Text: 'Commessa 14', Id: 14, Color: '#33ffb8' },  // Verde menta
  { Text: 'Commessa 15', Id: 15, Color: '#3380ff' },  // Blu acceso
  { Text: 'Commessa 16', Id: 16, Color: '#ff8033' },  // Arancio scuro
  { Text: 'Commessa 17', Id: 17, Color: '#8033ff' },  // Viola acceso
  { Text: 'Commessa 18', Id: 18, Color: '#ffb833' },  // Giallo arancio
  { Text: 'Commessa 19', Id: 19, Color: '#33b8ff' },  // Blu cielo
  { Text: 'Commessa 20', Id: 20, Color: '#ff33f6' }   // Fucsia
];

export const getCommessaColor = (commessaId) => {
  const commessa = commesse.find(com => com.Id === commessaId);
  return commessa ? commessa.Color : '#000000';  // Default nero
};

export default commesse;
