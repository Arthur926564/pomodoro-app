import { useEffect, useRef, useState } from "react";
import "./App.css";
import { SettingsModal } from "./components/SettingsModal";
import {
  sendNotification,
} from '@tauri-apps/plugin-notification';

function App() {
  const WORK_DURATION_INITIAL = 1 * 20; // 25 minutes in seconds
  const BREAK_DURATION_INITIAL = 5 * 60;
  const NUMBER_ROUND = 6;
  type TimerState = "IDLE" | "RUNNING" | "BREAK" | "PAUSED";

  const [workDuration, setWorkDuration] = useState(WORK_DURATION_INITIAL)
  const [breakDuration, setBreakDuration] = useState(BREAK_DURATION_INITIAL)
  const [showSettings, setShowSettings] = useState(false)

  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION_INITIAL);
  const  [numberRoundLeft, setNumberRoundLeft] = useState(NUMBER_ROUND);
  const [state, setState] = useState<TimerState>("IDLE");
  const intervalRef = useRef<number | null>(null); 


  const stateLabels: Record<TimerState, string> = {
  	IDLE: "Ready to Start",
  	RUNNING: "Work Time!",
  	BREAK: "Take a Break ☕",
  	PAUSED: "Paused ⏸️",
  	};


	const handleSaveSettings = () => {
    	console.log("Saved settings:", workDuration, breakDuration);
    	setShowSettings(false);
    	// You can also persist settings here later (e.g., Tauri store)
  	};

  const handlePhaseEnd = () => {
	  if (intervalRef.current) clearInterval(intervalRef.current)
	
  	notifyEnd();

  	switch (state) {
    	case "RUNNING":
      		if (numberRoundLeft > 0) {
        		setState("BREAK")
        		setSecondsLeft(breakDuration * 60)
				setNumberRoundLeft(numberRoundLeft - 1)
      		} else {
        		setState("IDLE");
        		setSecondsLeft(workDuration * 60)
				setNumberRoundLeft(numberRoundLeft)
      		}
      		break;

    	case "BREAK":
      		setState("RUNNING");
      		setSecondsLeft(workDuration * 60);
      		break;

    	default:
      		setState("IDLE");
      		setSecondsLeft(workDuration * 60);
      		break;
  }
};

  useEffect(() => { console.log(state);
	if (intervalRef.current) clearInterval(intervalRef.current)

  	if (state === "RUNNING" || state === "BREAK") {
    	intervalRef.current = window.setInterval(() => {
      	setSecondsLeft((prev) => {
        	if (prev <= 1) {
          	clearInterval(intervalRef.current!);
          	handlePhaseEnd();
          	return 0;
        	}
        	return prev - 1;
      	});
    	}, 1000);
  	}

  	return () => {
    	if (intervalRef.current) clearInterval(intervalRef.current);
  	};
	}, [state]); // rerun when state changes

	useEffect(() => {
  		if (state === "IDLE") {
    		setSecondsLeft(workDuration * 60);
  		}
	}, [workDuration, state]);

	useEffect(() => {
  		if (state === "BREAK") {
    		setSecondsLeft(breakDuration * 60);
  		}
	}, [breakDuration, state]);


  const notifyEnd = () => {
	sendNotification({title: 'Pomodoro Finished', body : 'Time to take a break'});
  };

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = () => setState("RUNNING");
  const pauseTimer = () => {
	  setState("PAUSED")
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const resetTimer = () => {
	setState("IDLE");
    setSecondsLeft(workDuration * 60);
	setNumberRoundLeft(NUMBER_ROUND);
  };

  return (
    <main className="container">
      	<h1>Pomodoro Timer</h1>
		<button 
		className="settings-button"
		onClick={() => setShowSettings(true)}>⚙️ Settings</button>
		<SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
		numberRounds={numberRoundLeft}
        workDuration={workDuration}
        breakDuration={breakDuration}
        setWorkDuration={setWorkDuration}
        setBreakDuration={setBreakDuration}
		setNumberRounds={setNumberRoundLeft}
        onSave={handleSaveSettings}
      />
		<h1>{stateLabels[state]}</h1>
	  	<h1>{"rounds left : " + numberRoundLeft}</h1>
      	<div className="timer-display">
        	<h2>{formatTime(secondsLeft)}</h2>
      	</div>

      	<div className="button-row">
        {state=="PAUSED" || state=="IDLE" ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={pauseTimer}>Pause</button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>
    </main>
  );
}

export default App;
