import { use, useEffect, useRef, useState } from "react";
import "./App.css";
import { SettingsModal } from "./components/SettingsModal";
import {
	sendNotification,
} from '@tauri-apps/plugin-notification';
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";



function App() {
	const [db, setDb] = useState<any>(null);
	const WORK_DURATION_INITIAL = 1 * 20; // 25 minutes in seconds
	const BREAK_DURATION_INITIAL = 5 * 60;
	const NUMBER_ROUND = 6;
	type TimerState = "IDLE" | "RUNNING" | "BREAK" | "PAUSED";
	// Information of the current sessions
	const [workDuration, setWorkDuration] = useState(WORK_DURATION_INITIAL)
	const [breakDuration, setBreakDuration] = useState(BREAK_DURATION_INITIAL)
	const [showSettings, setShowSettings] = useState(false)

	const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION_INITIAL);
	const [numberRoundLeft, setNumberRoundLeft] = useState(NUMBER_ROUND);
	const [state, setState] = useState<TimerState>("IDLE");
	const intervalRef = useRef<number | null>(null);

	// Overview of the Information
	const [meanBySession, setMeanBySession] = useState(WORK_DURATION_INITIAL);
	const [totalMinutes, setTotalMinutes] = useState(0);
	const [totalHoursToday, setHoursToday] = useState(0);
	const [totalSessions, setTotalSession] = useState(0);
	
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

	const handlePhaseEnd = async () => {
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
	useEffect(() => {
		async function initDb() {
			const _db = await Database.load("sqlite:timer.db");
			setDb(_db);
		}
		initDb().catch(console.error);
	}, [workDuration, state]);

	useEffect(() => {
		if (intervalRef.current) clearInterval(intervalRef.current)

		if (state === "RUNNING" || state === "BREAK") {
			intervalRef.current = window.setInterval(() => {
				setSecondsLeft((prev) => {
					if (prev <= 1) {
						clearInterval(intervalRef.current!);
						handlePhaseEnd();
						return 0;
					} 
					console.log(totalMinutes)
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


	const notifyEnd = async () => {
		if (!db) {
			console.error("DB not initialised yet");
			return;
		}
		await db.execute(
			"INSERT INTO pomodoro_sessions (session_type, duration_seconds) VALUES ($1, $2)",
			["work", workDuration * 60]
		);
		const sessions = await db.select(
			"SELECT session_type, duration_seconds, timestamp FROM pomodoro_sessions"
		);
		const total: number = await invoke("total_durations", {sessions})
		setTotalMinutes(total);
		const mean_average: number = await invoke("mean_durations", {sessions})
		setMeanBySession(mean_average)
		const total_sessions: number = await invoke("total_sessions", {sessions})
		setTotalSession(total_sessions)
		const total_hours_today: number = await invoke("total_hours_today", {sessions})
		setHoursToday(total_hours_today)
		

		console.log("sessions: ", sessions);
		sendNotification({ title: 'Pomodoro Finished', body: 'Time to take a break' });

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
			<div className="timer-display">
				<h2>{formatTime(secondsLeft)}</h2>
			</div>

			<div className="button-row">
				{state == "PAUSED" || state == "IDLE" ? (
					<button onClick={startTimer}>Start</button>
				) : (
					<button onClick={pauseTimer}>Pause</button>
				)}
				<button onClick={resetTimer}>Reset</button>
			</div>
			<div className="stats-panel">
				<p>{"rounds left : " + numberRoundLeft}</p>
  				<h3>Study Stats</h3>
  				<p>Total Study Time: {formatTime(totalMinutes)}</p>
				<p>Average study Time: {formatTime(meanBySession)}</p>
  				<p>Today's Study Time: {formatTime(totalHoursToday)}</p>
  				<p>Completed Pomodoros: {totalSessions}</p>
			</div>

		</main>
	);
}

export default App;
