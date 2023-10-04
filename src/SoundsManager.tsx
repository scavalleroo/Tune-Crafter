export class SoundManager {


    //GESTIRE I SUONI IN MANIERA SINCRONIZZATA. TUTTI DEVONO DURARE LO STESSO. FAR PARTIRE DIVERSI THREAD (?)

    private audioContext: AudioContext | null;
    private audioBufferMap: Map<string, AudioBuffer>;
    
    constructor() {
      this.audioContext = null;
      this.audioBufferMap = new Map();
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
        const response = await fetch(url);
        const audioData = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(audioData);
  
        this.audioBufferMap.set(name, audioBuffer);
      }
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
  
    // Stop all currently playing sounds
    stopAllSounds(): void {
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  }
  