import React, { useEffect, useRef, useState } from 'react';
import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';
import { SpeechModel } from '../models/SpeechModel';

interface WaveformProps {
  audioUrl: string;
  speechModel: SpeechModel;
}

const AudioWaveComponent = React.forwardRef<WaveSurfer | null, WaveformProps>(
  ({ audioUrl, speechModel }, ref) => {
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    let [currentSong, setCurrentSong] = useState(speechModel.getCurrentSongIndex());

    speechModel.addListener(() => {
      setCurrentSong(speechModel.getCurrentSongIndex());
      console.log("Song changed to: " + currentSong);
    });

    useEffect(() => {
      const wavesurfer = WaveSurfer.create({
        container: '#waveform',
        backend: 'WebAudio',
        waveColor: '#B01EB0',
        progressColor: '#0B060E',
        cursorColor: '#F5F5F5',
        cursorWidth: 3,
        fillParent: true,
      });

      wavesurfer.load(audioUrl);

      wavesurferRef.current = wavesurfer;

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }, [audioUrl]);

    // Assign the handlePlay function to the ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(wavesurferRef.current);
        } else {
          ref.current = wavesurferRef.current;
        }
      }
    }, [ref]);

    const changeSong = (index: number) => {
      speechModel.setCurrentSongIndex(index);
      wavesurferRef.current?.load("assets/sounds/" + speechModel.getCurrentSong());
    };

    return (
      <div style={{ marginTop: '10px', background: '#f5f5f51f', padding: "10px", borderRadius: '20px', position: "relative" }}>
        <div id="waveform">
        </div>
        <div className='trackNumbers' style={{ position: "relative" }}>
          {speechModel.getSongs().map((_: any, index: any) => (
            <div
              key={index}
              className={`trackNumber ${index === speechModel.getCurrentSongIndex() ? 'currentTrack' : ''}`}
              onClick={() => changeSong(index)}
              style={{ position: "relative" }}>
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default AudioWaveComponent;
