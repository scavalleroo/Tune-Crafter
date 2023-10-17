import React, { useEffect, useRef } from 'react';
import { WaveSurfer } from 'wavesurfer-react/dist/utils/createWavesurfer';


interface WaveformProps {
  audioUrl: string;
}

//Function class
const Waveform = React.forwardRef<WaveSurfer | null, WaveformProps>(
  ({ audioUrl }, ref) => {
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    useEffect(() => {
      const wavesurfer = WaveSurfer.create({
        container: '#waveform',
        backend: 'WebAudio',
        // waveColor: '#A011A7',
        waveColor: '#f23ff8',
        progressColor: '#0858d3',
        cursorColor: '#7d7d7d',
        cursorWidth: 3,
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

    return (
      <div>
        <div id="waveform" 
        style={{ marginTop: '10px', background: 'white', padding: "10px", borderRadius: '20px' }}></div>
      </div>
    );
  }
);

export default Waveform;
