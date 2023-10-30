import React, { useEffect, useRef, useState } from 'react';
import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';
import { AudioManager } from '../AudioManager';

interface WaveformProps {
  audioUrl: string;
  soundManager: AudioManager;
}

const AudioWaveComponent = React.forwardRef<WaveSurfer | null, WaveformProps>(
  ({ audioUrl, soundManager }, ref) => {
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    let [songs, setSongs] = useState(soundManager.getSongs());

    soundManager.addListener(() => {
      setSongs(soundManager.getSongs());
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
      soundManager.setCurrentSongIndex(index);
      wavesurferRef.current?.load("assets/sounds/" + soundManager.getCurrentSong());
    };

    return (
      <div style={{ marginTop: '10px', background: '#f5f5f51f', padding: "10px", borderRadius: '20px', position: "relative" }}>
        <div id="waveform">
        </div>
        <div className='trackNumbers' style={{ position: "relative" }}>
          {songs.map((_: any, index: any) => (
            <div
              key={index}
              className={`trackNumber ${index === soundManager.getCurrentSongIndex() ? 'currentTrack' : ''}`}
              onClick={() => changeSong(index)}
              style={{ position: "relative" }}>
              {songs.length == 1 ? songs[index].name : index + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default AudioWaveComponent;
