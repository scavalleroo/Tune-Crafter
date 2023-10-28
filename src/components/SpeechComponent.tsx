import React, { useEffect, useState } from "react";
import ReactGA from 'react-ga';
import 'bootstrap/dist/css/bootstrap.css';
import WaveSurfer from "wavesurfer.js";
import { SpeechModel } from "../models/SpeechModel";
import { FaRegWindowMinimize, FaRegWindowMaximize } from 'react-icons/fa';

interface SpeechComponentProps {
    waveform: WaveSurfer | null
}

const SpeechComponent = (props: SpeechComponentProps) => {
    // Define a sensitivity value to control effect change speed
    var waveform = props.waveform;
    const model: SpeechModel = new SpeechModel();
    const recognition = new (window as any).webkitSpeechRecognition();
    var currentWord = "";

    const [isCollapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        setCollapsed(!isCollapsed);
    };

    /**
     * This 'useEffect' handles voice recognition for controlling audio playback and updates the UI based on recognized voice commands.
     */
    useEffect(() => {
        if ('webkitSpeechRecognition' in window && waveform != undefined) {
            recognition.continuous = true; // Continuously listen for commands
            recognition.interimResults = true;
            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                //String resulting from the model
                const transcript = event.results[current][0].transcript.trim();
                if (currentWord != transcript) {
                    currentWord = transcript;
                } else {
                    return;
                }
                let current_voice = document.getElementById('current_voice') as HTMLOutputElement;
                current_voice.innerText = "🎙️ " + transcript;
                switch (transcript.toLowerCase().trim()) {
                    case 'start':
                    case 'play':
                        if (!waveform?.isPlaying()) {
                            waveform?.playPause();
                            current_voice.innerText = "🎙️ Play ▶️ ✅";
                        }
                        break;
                    case 'pause':
                    case 'stop':
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',   
                            label: 'Stop/Pause',
                        });
                        if (waveform?.isPlaying()) {
                            waveform?.playPause();
                            current_voice.innerText = "🎙️ Pause ⏹️ ✅";
                        }
                        break;
                    case 'repeat':
                    case 'loop':
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',   
                            label: 'Repeat/Loop',
                        });
                        waveform?.setCurrentTime(0);
                        current_voice.innerText = "🎙️ Playback 🔁 ✅";
                        break;
                    case 'next':
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',   
                            label: 'Next',
                        });
                        model.nextSong();
                        newTrack();
                        break;
                    case "emilio":
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',   
                            label: 'Emilio',
                        });
                        model.setEmilioSong();
                        newTrack();
                        break;
                    case "laura":
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',   
                            label: 'Laura',
                        });
                        model.setLauraSong();
                        newTrack();
                        break;
                    case "nina":
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',   
                            label: 'Nina',
                        });
                        model.setNinaSong();
                        newTrack();
                        break;
                }
            };
            recognition.start();
        }

        waveform?.on('finish', () => {
            ReactGA.event({
                category: 'Automatic',
                action: 'speech',
                label: 'Next',
            });
            model.nextSong();
            newTrack();
        });
    });

    const newTrack = () => {
        waveform?.load("assets/sounds/" + model.getCurrentSong());
        waveform?.on('ready', () => {
            waveform?.play();
        });
        let current_voice = document.getElementById('current_voice') as HTMLOutputElement;
        current_voice.innerText = "🎙️ New Track ✅";
    }

    return (
        <>
            <p id='current_voice' className="currVoice">🎙️</p>
            <p className="tooltipVoice">Voice commands</p>
            <div className="listVoiceCommands">
                <button className="btn btn-link close-button-list" onClick={toggleCollapse}>
                    {isCollapsed ? <FaRegWindowMaximize /> : <FaRegWindowMinimize />}
                </button>
                <strong style={{ paddingRight: "60px" }}>Voice commands list</strong>
                {!isCollapsed && (
                    <ul>
                        <li>🎙️ Start/Play</li>
                        <li>🎙️ Pause/Stop</li>
                        <li>🎙️ Repeat/Loop</li>
                        <li>🎙️ Next</li>
                    </ul>
                )}
            </div>
        </>
    );
};

export default SpeechComponent;