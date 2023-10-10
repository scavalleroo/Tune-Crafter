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
        waveColor: 'violet',
        progressColor: 'purple',
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
        <div id="waveform" style={{ height: '50px' }}></div>
      </div>
    );
  }
);

export default Waveform;
