import React from "react";
import "./SettingsModal.css";

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  workDuration: number;
  breakDuration: number;
  numberRounds: number;
  setWorkDuration: (value: number) => void;
  setBreakDuration: (value: number) => void;
  setNumberRounds: (value: number) => void;
  onSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  show,
  onClose,
  workDuration,
  breakDuration,
  numberRounds,
  setWorkDuration,
  setBreakDuration,
  setNumberRounds,
  onSave,
}) => {
	console.log(workDuration)
  if (!show) return null; // Don’t render anything if closed

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <label>
          Work Duration: {workDuration} min
          <input
            type="range"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => setWorkDuration(Number(e.target.value))}
          />
        </label>

        <label>
          Break Duration: {breakDuration} min
          <input
            type="range"
            min="1"
            max="30"
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
          />
        </label>
        <label>
          Number of rounds: {numberRounds} min
          <input
            type="range"
            min="1"
            max="15"
            value={numberRounds}
            onChange={(e) => setNumberRounds(Number(e.target.value))}
          />
        </label>


        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
          <button onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

