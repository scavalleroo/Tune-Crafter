import React, { useRef, useEffect, useState, Ref } from "react";
import { hasGetUserMedia } from './utils/helpers';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';

// import { HeartRateComponent } from './components/HeartRateComponent';
import GestureComponent from "./components/GestureComponent";
import AudioWaveComponent from "./components/AudioWaveComponent";
import SpeechComponent from "./components/SpeechComponent";
import SideBar from "./components/SideBar";
import { SpeechModel } from "./models/SpeechModel";

function App() {
  let audioUrl = "assets/sounds/audio.mp3"
  const waveformRef: Ref<WaveSurfer> | null = useRef<WaveSurfer | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const speechModel: SpeechModel = new SpeechModel();
  // Check if the browser supports the WebSpeech API

  useEffect(() => {
    if (hasGetUserMedia()) {
      enableCam();
    } else {
      console.log("getUserMedia() is not supported by your browser");
    }
  }, [video]);

  function enableCam() {
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      setVideo(document.getElementById("webcam") as HTMLVideoElement);
      if (video != null) {
        video.srcObject = stream;
      }
    }).catch((error) => {
      console.error("Error accessing webcam:", error);
    });
  }

  function isSafari() {
    const userAgent = navigator.userAgent;
    return /Safari/i.test(userAgent) && !/Chrome|CriOS|FxiOS|Edg/i.test(userAgent);
  }


  return (
    <>
      <section className="main-cont">
        {/* <HeartRateComponent /> */}
        <div className="row">
          <div className="col-auto">
            <SideBar />
          </div>
          <div className="col" style={{ position: "relative" }}>
            <div className="waveForm">
              <AudioWaveComponent ref={waveformRef} audioUrl={audioUrl} speechModel={speechModel} />
            </div>
            <div className="row">
              <div className="col">
                {video && (
                  <GestureComponent video={video} waveform={waveformRef.current}></GestureComponent>
                )}
              </div>
              <div className="col" style={{ position: "relative" }}>
                <p id="currentSongName" style={{ fontSize: "14px", textAlign: "center", marginTop: "40px", color: "white" }}>
                  {isSafari() ?
                    "This browser doesn't support all features. Try Google Chrome instead" : "🟣 Now Playing: Original Track"
                  }
                </p>
              </div>
              <div className="col">
                <SpeechComponent waveform={waveformRef.current} model={speechModel}></SpeechComponent>
              </div>
            </div>
          </div>
        </div>
        <video id="webcam" autoPlay playsInline style={{ display: "none" }}></video>
        <p style={{ position: "absolute", bottom: "0px", color: "#f5f5ff85", fontSize: "10px", left: "50%", transform: "translate(-50%, -50%)" }}>Copyright © 2023 by Alessandro Cavallotti, Matteo Fornara, and Shubankar. All rights reserved.</p>
      </section>
    </>
  )
}

export default App