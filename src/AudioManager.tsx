import AudioScheduler from "./AudioScheduler";

//Make it a function calss?
export class AudioManager {

    private audioContext: AudioContext | null; 
    private audioBufferMap: Map<string, AudioBuffer>;  //With each sound
    private audioScheduler : AudioScheduler;
    private isPlaying : boolean = false;

    constructor(audioContext: AudioContext | null = null) {
      this.audioContext = audioContext;
      this.audioBufferMap = new Map();
      this.audioScheduler = new AudioScheduler(this);
    }
  
    // Initialize the AudioContext
    private initializeAudioContext(): void {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('AudioContext initialization error:', error);
      }
    }
  
    // Load audio file and store it in the buffer
    async loadSound(name: string, url: string): Promise<void> {
      if (!this.audioContext) {
        this.initializeAudioContext();
      }

      if (this.audioContext) {
        this.createAudioContext(this.audioContext, name, url);
      }
      
    }

    public async createAudioContext(audioContext : AudioContext, name: string, url: string) {

        const response = await fetch(url);
        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
  
        this.audioBufferMap.set(name, audioBuffer);
     
    }
  
    // Play a loaded sound
    playSound(name: string): void {
      if (!this.audioContext) {
        this.initializeAudioContext();
      }
  
      if (this.audioContext && this.audioBufferMap.has(name)) {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBufferMap.get(name)!;
        source.connect(this.audioContext.destination);
        source.start();
      }
    }

    playPauseMainMusic() : void {

      console.warn("Entratooosfodof");
      
      if(this.isPlaying) {
        this.stopAllSounds();
        this.isPlaying = false;
      }
      else {
        this.playSound("mainMusic");
        this.isPlaying = true;
      }

    }

    startSoundsLoop() : void {

      //Start looping over a sound with a specific bpm

      console.log("Nel loop");

      this.audioScheduler.startLoop(this.audioContext, this.audioBufferMap)

    }
  
    // Stop all currently playing sounds
    stopAllSounds(): void {
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  }
  