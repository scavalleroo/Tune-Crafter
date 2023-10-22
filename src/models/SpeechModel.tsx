export class SpeechModel {
    songs: any = ["audio.mp3", "audio_techno.mp3", "audio_original.mp3"];
    currentSong: number = 0;

    nextSong() {
        this.currentSong = (this.currentSong + 1) % this.songs.length;
        console.log("Next song: " + this.songs[this.currentSong]);
    }

    getCurrentSong() {
        return this.songs[this.currentSong];
    }
}