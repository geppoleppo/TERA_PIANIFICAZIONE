import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const availableIcons = [
  { name: "Documento", value: "description" },
  { name: "Ok", value: "okIcon" },
  { name: "Allarme", value: "alarm" },
  { name: "Informazioni", value: "info" },
  { name: "Errore", value: "error" }
];

const IndicatorModal = ({ tasks, onSave, onClose }) => {
 
  const [selectedTask, setSelectedTask] = useState("");
  const [indicatorName, setIndicatorName] = useState("");
  const [tooltip, setTooltip] = useState("");
  const [iconClass, setIconClass] = useState("description e-icons");
  const [indicatorDate, setIndicatorDate] = useState(new Date()); // 📌 Stato per la data

  const handleSave = () => {
    console.log("📢 handleSave chiamato!");

    if (!onSave) {
        console.error("❌ ERRORE: onSave non è definito! Verifica che venga passato correttamente.");
        return;
    }

    if (selectedTask && indicatorName && tooltip && indicatorDate) {
        const newIndicator = {
            taskId: selectedTask,
            name: indicatorName,
            tooltip: tooltip,
            date: indicatorDate,
            iconClass: iconClass,
        };

        console.log("📢 Dati inviati a onSave:", newIndicator);

        onSave(newIndicator); // ✅ Ora i dati vengono passati correttamente
        onClose();
    } else {
        console.warn("⚠️ Alcuni campi sono vuoti, il salvataggio è stato bloccato!");
    }
};

  
  console.log("📢 IndicatorModal ricevuto onSave:", typeof onSave);

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Aggiungi Indicatore</DialogTitle>
      <DialogContent>
        <Select
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
          fullWidth
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <MenuItem key={task.Id} value={task.Id}>
                {task.Subject}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Nessun task disponibile</MenuItem>
          )}
        </Select>

        <TextField label="Nome Indicatore" value={indicatorName} onChange={(e) => setIndicatorName(e.target.value)} fullWidth />
        <TextField label="Tooltip" value={tooltip} onChange={(e) => setTooltip(e.target.value)} fullWidth />
        <Select
  value={iconClass} // ✅ Assicuriamoci che il valore sia uno tra quelli disponibili
  onChange={(e) => setIconClass(e.target.value)}
  fullWidth
>
  {availableIcons.map((icon) => (
    <MenuItem key={icon.value} value={icon.value}>
      <span className={`e-icons ${icon.value}`} style={{ marginRight: "8px" }}></span> {icon.name}
    </MenuItem>
  ))}
</Select>


        {/* 📅 Aggiunta selezione data */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Data Indicatore"
            value={indicatorDate}
            onChange={(newValue) => setIndicatorDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Annulla</Button>
        <Button onClick={handleSave} color="primary">Salva</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IndicatorModal;
