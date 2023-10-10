import './App.css';
import React, { useRef, useEffect } from "react";
import { hasGetUserMedia } from './utils/helpers';
import { GestureController } from './controllers/GestureController';
import Waveform from './components/customWawesurfer';


/*

To create a musical experience where you can control the frequency of sounds, loop over one sound, and trigger sounds in response to
gestures, you can use the Web Audio API in combination with JavaScript. Here are the general steps to achieve this:

Initialize the AudioContext: First, create and initialize an AudioContext object. 
This will serve as the central hub for all audio-related operations.

Load Audio Samples: Load the audio samples (e.g., bass drum, snare, etc.) into AudioBuffer objects. 
You can use the fetch API to load audio files and then decode them using the decodeAudioData method of the AudioContext.

Create Sound Generators: Create functions or classes that generate sound based on parameters like frequency, duration, 
and waveform type. You can use the OscillatorNode for generating simple waveforms like sine, square, or sawtooth waves. 
You can also manipulate the parameters of these oscillators to change the frequency.

Gesture Recognition: Implement gesture recognition using technologies like the MediaPipe library mentioned earlier. 
When a specific gesture is recognized, trigger the corresponding sound generator function to start playing the sound.

Looping and Controlling Sounds: To loop over a sound, you can use AudioBufferSourceNode and schedule its playback 
using the start method with a specified startTime and duration. This allows you to create a loop that plays the same sound at a specified interval. You can also manipulate the frequency of the oscillators in real-time to achieve dynamic changes in the sound.

Adjusting Sound Parameters: Implement controls or UI elements that allow users to adjust sound parameters, 
such as frequency, volume, and effects. You can use event listeners to capture user input and update the sound parameters accordingly.

Asynchronous Audio: You can use the async and await keywords in JavaScript to manage asynchronous audio operations,
such as loading audio files and decoding them. This ensures that your application remains responsive while dealing with audio.

Synchronization: To keep the sounds synchronized with other elements of your application, consider using the AudioContext's 
currentTime property and scheduling audio events with precise timing.

*/


function App() {

  const waveformRef = useRef<WaveSurfer | null>(null);
  let controller: any;
  let audioUrl = 'assets/audio.mp3';

  useEffect(() => {
    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (hasGetUserMedia()) {
      console.log("Enebling webcam");
      enableCam();
      console.log("Webcam enabled");

    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }
  }, []);

  function enableCam() {
    const video: HTMLVideoElement = document.getElementById("webcam") as HTMLVideoElement;

    const constraints = { video: true };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      controller = new GestureController({ video, waveformRef });
      controller.createGestureRecognizer().then(() => {
        video.addEventListener("loadeddata", controller.predictWebcam);
        window.requestAnimationFrame(controller.predictWebcam.bind(controller));
      });
    });
  }

  return (
    <>
      <section className="container text-center">
        <div style={{ height: "100vh", width: "auto" }}>
          <Waveform ref={waveformRef} audioUrl={audioUrl} />
          <video id="webcam" autoPlay playsInline style={{ display: "none", height:"100%" }}></video>
          <GestureController ref={controller} />
        </div>
      </section>
    </>
  )
}

export default App
