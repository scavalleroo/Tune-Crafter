import React, { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import WaveSurfer from "wavesurfer.js";
import { SpeechModel } from "../models/SpeechModel";

interface SpeechComponentProps {
    waveform: WaveSurfer | null
}

const SpeechComponent = (props: SpeechComponentProps) => {
    // Define a sensitivity value to control effect change speed
    var waveform = props.waveform;
    const model: SpeechModel = new SpeechModel();
    const recognition = new (window as any).webkitSpeechRecognition();

    useEffect(() => {
        if ('webkitSpeechRecognition' in window && waveform != undefined) {
            recognition.continuous = true; // Continuously listen for commands
            recognition.interimResults = false;
            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript.trim();
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
                        if (waveform?.isPlaying()) {
                            waveform?.playPause();
                            current_voice.innerText = "🎙️ Pause ⏹️ ✅";
                        }
                        break;
                    case 'repeat':
                    case 'loop':
                        waveform?.setCurrentTime(0);
                        current_voice.innerText = "🎙️ Playback 🔁 ✅";
                        break;
                    case 'next':
                        model.nextSong();
                        console.log(waveform);
                        waveform?.load("assets/sounds/" + model.getCurrentSong());
                        waveform?.on('ready', () => {
                            waveform?.play();
                        });
                        current_voice.innerText = "🎙️ New Track ✅";
                        break;
                }
            };
            recognition.start();
            console.log(recognition);
        }
    });

    return (
        <>
            <p id='current_voice' className="currVoice">🎙️</p>
            <p className="tooltipVoice">Voice commands</p>
        </>
    );
};

export default SpeechComponent;