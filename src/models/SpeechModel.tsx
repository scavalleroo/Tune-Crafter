export class SpeechModel {
    songs: any = ["audio.mp3", "audio_techno.mp3", "audio_original.mp3"];
    currentSong: number = 0;

    /**
     * Function to play the next song
     */
    nextSong() {
        this.currentSong = (this.currentSong + 1) % this.songs.length;
        console.log("Next song: " + this.songs[this.currentSong]);
    }

    /**
     * Function to get the current song playing
     */
    getCurrentSong() {
        return this.songs[this.currentSong];
    }
}