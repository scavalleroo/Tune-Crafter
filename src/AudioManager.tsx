import currentMode from "./CurrentMode";

const NORMAL_SONGS = [{path: "audio.mp3", name: "Original Track"}, {path: "audio_techno.mp3", name: "Techno Track"}, {path: "audio_original.mp3", name: "Chill Track"}];
const LAURA_SONGS = [{path: "hiddenSounds/laura.mp3", name: "Måneskin - Ella baila sola (cover de Peso Pluma) LIVE"}];
const EMILIO_SONGS = [{path: "hiddenSounds/emilio.mp3", name: "Emilio's Track"}];
const NINA_SONGS = [{path: "hiddenSounds/nina.mp3", name: "Love on the Brain (Rihanna Cover) by Nina <a target='_blank' href='https://www.instagram.com/ninamazza_/'>@ninamazza_</a>", shortName: "Love on the Brain (Rihanna Cover) by Nina"}];
const CHRISTMAS_SONGS = [{path: "hiddenSounds/christmas.mp3", name: "Christmas Track"}];

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private normalAudioBufferMap: Map<string, AudioBuffer>;  //With each sound
  private christmasAudioBufferMap: Map<string, AudioBuffer>;  //With each sound
  private currentSong: number = 0;
  private waveform: WaveSurfer | null = null;
  private listeners: any = [];
  private songs: any = NORMAL_SONGS;

  addListener(listener: any) {
    this.listeners.push(listener);
  }

  removeListener(listener: any) {
    this.listeners = this.listeners.filter((l: any) => l !== listener);
  }

  fireListeners() {
    this.listeners.forEach((listener: any) => listener());
  }


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

  public async createAudioContext(audioContext: AudioContext, name: string, url: string, mode: string) {
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

    if (this.audioContext) {
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
    let currentSongName = document.getElementById('currentSongName') as HTMLOutputElement;
    currentSongName.innerHTML = "🟣 Now Playing: " + this.songs[this.currentSong].name;
    this.fireListeners();
  }

  /**
   * Function to set the next song
   */
  nextSong() {
    this.currentSong = (this.currentSong + 1) % this.songs.length;
    this.fireListeners()
  }

  /**
   * Function to get the current song playing
   */
  getCurrentSong() {
    return this.songs[this.currentSong].path;
  }

  setLauraSong() {
    this.currentSong = 0;
    this.songs = LAURA_SONGS;
    this.fireListeners();
  }

  setEmilioSong() {
    this.currentSong = 0;
    this.songs = EMILIO_SONGS;
    this.fireListeners();
  }

  setNinaSong() {
    this.currentSong = 0;
    this.songs = NINA_SONGS;
    this.fireListeners();
  }

  setChristmasSong() {
    this.currentSong = 0;
    this.songs = CHRISTMAS_SONGS;
    this.fireListeners();
  }

  setNormalSongs() {
    this.currentSong = 0;
    this.songs = NORMAL_SONGS;
    this.fireListeners();
  }

  getCurrentSongName() {
    return this.songs[this.currentSong].name;
  }

  getCurrentSongIndex() {
    return this.currentSong;
  }

  setCurrentSongIndex(index: number) {
    if (index < 0 || index >= this.songs.length) {
      return;
    }
    this.currentSong = index;
    this.fireListeners();
  }
  
  getSongs() {
    return this.songs;
  }

}
