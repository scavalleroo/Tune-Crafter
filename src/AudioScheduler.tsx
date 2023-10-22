import { AudioManager } from "./AudioManager";

class AudioScheduler {

    //Should also manage the bpm for the song and give it a go
    audioManager : AudioManager;
    isPlaying : boolean;
    audioBpm : number;
    interval = null;

    constructor(audioManager: AudioManager) {
      this.audioManager = audioManager;
      this.isPlaying = false;
      this.audioBpm = 1; // Initial playback rate
      this.interval = null;
    }
  
    setPlaybackRate(rate : number) {
        this.audioBpm = rate;
    }

    startLoop(audioContext : any, audioBufferMap : any) {
        if (this.isPlaying) return;
      
        const intervalInSeconds = 60 / this.audioBpm;
        this.isPlaying = true;
      
        const playAudio = () => {
            if (!this.isPlaying) return;

            const source = audioContext.createBufferSource();
            source.buffer = audioBufferMap.get("snare")!;
            source.connect(audioContext.destination);
            source.start();
            
            setTimeout(() => {
                source.stop();
                playAudio(); // Schedule the next iteration
            }, intervalInSeconds);
            //source.buffer.duration / this.playbackRate * 1000
        };
      
        playAudio(); // Start the loop
      }
      
      stopLoop() {
        this.isPlaying = false;
      }

  }

  export default AudioScheduler;
  