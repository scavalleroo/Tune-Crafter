import React, { useEffect, useState } from "react";
import ReactGA from 'react-ga4';
import 'bootstrap/dist/css/bootstrap.css';
import WaveSurfer from "wavesurfer.js";
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
    var currentTime = 0;

    let [currentSong, setCurrentSong] = useState(soundManager.getCurrentSongIndex());

    soundManager.addListener(() => {
        setCurrentSong(soundManager.getCurrentSongIndex());
        console.log("Song changed to: " + currentSong);
        let currentSongName = document.getElementById('currentSongName') as HTMLOutputElement;
        currentSongName.innerHTML = "🟣 Now Playing: " + soundManager.getCurrentSongName();
    });

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
                    if (new Date().getTime() - currentTime <= 2000) {
                        return;
                    }
                }
                currentTime = new Date().getTime();
                let current_voice = document.getElementById('current_voice') as HTMLOutputElement;
                current_voice.innerText = "🎙️ " + currentWord;
                switch (currentWord.toLowerCase().trim()) {
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
                        console.warn("loop");
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
                        console.warn("next");
                        soundManager.nextSong();
                        soundManager.newTrack();
                        break;
                    case "emilio":
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',
                            label: 'Emilio',
                        });
                        console.warn("emilio");
                        soundManager.setEmilioSong();
                        soundManager.newTrack();
                        break;
                    case "laura":
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',
                            label: 'Laura',
                        });
                        console.warn("laura");
                        soundManager.setLauraSong();
                        soundManager.newTrack();
                        break;
                    case "nina":
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',
                            label: 'Nina',
                        });
                        console.warn("nina");
                        soundManager.setNinaSong();
                        soundManager.newTrack();
                        break;
                    case "christmas":
                        console.warn("christmas");
                        ReactGA.event({
                            category: 'User Interaction',
                            action: 'speech',
                            label: 'Christmas',
                        });
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
            recognition.onstart = () => {
                console.log("Voice recognition started");
            };
            recognition.start();
        }

    });

    return (
        <>
            <div style={{ marginTop: "20px" }}>
                <p id='current_voice' className="currGesture">🎙️</p>
                <p className="tooltipGesture">Voice commands</p>
            </div>
        </>
    );
};

export default SpeechComponent;