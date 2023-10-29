import currentMode from "./CurrentMode";

const NORMAL_SONGS = ["audio.mp3", "audio_techno.mp3", "audio_original.mp3"];
const LAURA_SONGS = ["hiddenSounds/laura.mp3"];
const EMILIO_SONGS = ["hiddenSounds/emilio.mp3"];
const NINA_SONGS = ["hiddenSounds/nina.mp3"];
const CHRISTMAS_SONGS = ["hiddenSounds/christmas.mp3"];

var songs: string[] = NORMAL_SONGS;

export class AudioManager {
    private audioContext: AudioContext | null = null; 
    private normalAudioBufferMap: Map<string, AudioBuffer>;  //With each sound
    private christmasAudioBufferMap: Map<string, AudioBuffer>;  //With each sound

    private currentSong: number = 0;

    private waveform : WaveSurfer | null = null;

    constructor(waveform: WaveSurfer | null) {
      this.normalAudioBufferMap = new Map();
      this.christmasAudioBufferMap = new Map();

      this.waveform = waveform;

      waveform?.on('finish', () => {
        this.nextSong();
        this.newTrack();
      });
    }
  
    // Initialize the AudioContext
    private initializeAudioContext(): void {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('AudioContext initialization error:', error);
      }
    }

    //Function to load all the audio files at the bootstrap of the application
    loadAllSounds() {
      this.loadSound('index', 'assets/sounds/kick.wav', "normal");
      this.loadSound('middle', 'assets/sounds/snare.wav', "normal");
      this.loadSound('ring', 'assets/sounds/hat.wav', "normal");
      this.loadSound('pinky', 'assets/sounds/clap.wav', "normal");
      this.loadSound('index', 'assets/sounds/christmas-little-bells.mp3', "christmas");
      this.loadSound('middle', 'assets/sounds/christmas-bell.mp3', "christmas");
      this.loadSound('ring', 'assets/sounds/christmas-ding.mp3', "christmas");
      this.loadSound('pinky', 'assets/sounds/merry-christmas.mp3', "christmas");
    }
  
    // Load audio file and store it in the buffer
    async loadSound(name: string, url: string, mode: string): Promise<void> {
      if (!this.audioContext) {
        this.initializeAudioContext();
      }

      if (this.audioContext) {
        this.createAudioContext(this.audioContext, name, url, mode);
      }
      
    }

    public async createAudioContext(audioContext : AudioContext, name: string, url: string, mode: string) {
        const response = await fetch(url);
        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
  
        switch (mode) {
          case "normal":
            this.normalAudioBufferMap.set(name, audioBuffer);
            break;
          case "christmas":
            this.christmasAudioBufferMap.set(name, audioBuffer);
            break;
          default:
            break;
        }
    }
  
    // Play a loaded sound
    public playSound(name: string): void {
      if (!this.audioContext) {
        this.initializeAudioContext();
      }

      if(this.audioContext) {
        const source = this.audioContext.createBufferSource();
        source.connect(this.audioContext.destination);

        switch (currentMode.mode) {
          case "normal":
            if (this.normalAudioBufferMap.has(name)) {
              source.buffer = this.normalAudioBufferMap.get(name)!;
            }
            break;
          case "christmas":
            if (this.audioContext && this.christmasAudioBufferMap.has(name)) {
              source.buffer = this.christmasAudioBufferMap.get(name)!;
            }
            break;
          default:
            break;
        }

        source.start();
      }      
    }

    //Function to change track over the waveForm
    public newTrack = () => {
      this.waveform?.load("assets/sounds/" + this.getCurrentSong());
      this.waveform?.on('ready', () => {
        this.waveform?.play();
      });
      let current_voice = document.getElementById('current_voice') as HTMLOutputElement;
      current_voice.innerText = "🎙️ New Track ✅";
    }

    /**
     * Function to set the next song
     */
    nextSong() {

      //In the case the current song go over the song array it comes back to 0, so to the first song in the array
      if(this.currentSong != songs.length) {
        this.currentSong = (this.currentSong + 1) % songs.length;
      }
      else {
        this.currentSong = 0;
      }
        
    }

    /**
     * Function to get the current song playing
     */
    getCurrentSong() {
        return songs[this.currentSong];
    }

    setLauraSong() {
        this.currentSong = 0;
        songs = LAURA_SONGS;
    }

    setEmilioSong() {
        this.currentSong = 0;
        songs = EMILIO_SONGS;
    }

    setNinaSong() {
        this.currentSong = 0;
        songs = NINA_SONGS;
    }

    setChristmasSong() {
        this.currentSong = 0;
        songs = CHRISTMAS_SONGS;
    }

    setNormalSongs() {
      this.currentSong = 0;
      songs = NORMAL_SONGS;
    }

  }
  