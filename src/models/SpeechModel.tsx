const SONGS: any = ["audio.mp3", "audio_techno.mp3", "audio_original.mp3", "friends/laura.mp3", "friends/emilio.mp3", "friends/nina.mp3"];
const SONGS_NAME: any = ["Original Track", "Techno Track", "Chill Track", "Måneskin - Ella baila sola (cover de Peso Pluma) LIVE", "Acustic Track", "Love on the Brain (Rihanna Cover) by Nina <a href='https://www.instagram.com/ninamazza_/'>@ninamazza_</a>"];
const LAURA_INDEX = 3;
const EMILIO_INDEX = 4;
const NINA_INDEX = 5;

export class SpeechModel {
    currentSong: number = 0;

    /**
     * Function to play the next song
     */
    nextSong() {
        this.currentSong = (this.currentSong + 1) % SONGS.length;
    }

    /**
     * Function to get the current song playing
     */
    getCurrentSong() {
        return SONGS[this.currentSong];
    }

    getCurrentSongName() {
        return SONGS_NAME[this.currentSong];
    }

    setLauraSong() {
        this.currentSong = LAURA_INDEX;
    }

    setEmilioSong() {
        this.currentSong = EMILIO_INDEX;
    }

    setNinaSong() {
        this.currentSong = NINA_INDEX;
    }
}