import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import WaveSurfer from "wavesurfer.js";
import { FaRegWindowMinimize, FaRegWindowMaximize } from 'react-icons/fa';
import { AudioManager } from "../AudioManager";
import currentMode from "../CurrentMode";

interface SpeechComponentProps {
    waveform: WaveSurfer | null,
    soundManager: AudioManager
}

const SpeechComponent = (props: SpeechComponentProps) => {
    // Define a sensitivity value to control effect change speed
    var waveform = props.waveform;
    var soundManager = props.soundManager;
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
                //current_voice.innerText = "🎙️ " + transcript;

                //Timeout to clean the transcript?

                switch (transcript.toLowerCase().trim()) {
                    case 'start':
                    case 'play':
                        console.warn("play");
                        if (!waveform?.isPlaying()) {
                            waveform?.playPause();
                            current_voice.innerText = "🎙️ Play ▶️ ✅";
                        }
                        break;
                    case 'pause':
                    case 'stop':
                        console.warn("stop");
                        if (waveform?.isPlaying()) {
                            waveform?.playPause();
                            current_voice.innerText = "🎙️ Pause ⏹️ ✅";
                        }
                        break;
                    case 'repeat':
                    case 'loop':
                        console.warn("loop");
                        waveform?.setCurrentTime(0);
                        current_voice.innerText = "🎙️ Playback 🔁 ✅";
                        break;
                    case 'next':
                        console.warn("next");
                        soundManager.nextSong();
                        soundManager.newTrack();
                        break;
                    case "emilio":
                        console.warn("emilio");
                        soundManager.setEmilioSong();
                        soundManager.newTrack();
                        break;
                    case "laura":
                        console.warn("laura");
                        soundManager.setLauraSong();
                        soundManager.newTrack();
                        break;
                    case "nina":
                        console.warn("nina");
                        soundManager.setNinaSong();
                        soundManager.newTrack();
                        break;
                    case "christmas":
                        console.warn("christmas");
                        soundManager.setChristmasSong();
                        soundManager.newTrack();
                        currentMode.mode = "christmas";
                        break;
                    case "normal":
                    case "reset":
                        console.warn("reset");
                        soundManager.setNormalSongs();
                        soundManager.newTrack();
                        currentMode.mode = "normal";
                        break;
                }
            };
            recognition.start();
        }

    });

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