import { PlayPauseState, CutState, IndexState, MiddleState, RingState, PickyState, VolumeState, EffectsState } from "../utils/GesturesFSM";
import { calculateAngle, closedPoints } from "../utils/helpers";
import { Coordinates } from "./GestureController";

export class GestureModel {
    currSPlayPause: PlayPauseState = PlayPauseState.Empty;
    currSCut: CutState = CutState.Empty;
    currSIndex: IndexState = IndexState.Listening;
    currSMiddle: MiddleState = MiddleState.Listening;
    currSRing: RingState = RingState.Listening;
    currSPincky: PickyState = PickyState.Listening;
    currSVolume: VolumeState = VolumeState.Empty;
    currSEffects: EffectsState = EffectsState.Empty;

    songs: any = ["audio.mp3", "audio_techno.mp3", "audio_original.mp3"];
    currentSong: number = 0;
    speedValue: number = 1;

    loopRegion: any = undefined;
    wsRegions: any = undefined;

    nextSong() {
        this.currentSong = (this.currentSong + 1) % this.songs.length;
        console.log("Next song: " + this.songs[this.currentSong]);
    }

    getCurrentSong() {
        return this.songs[this.currentSong];
    }
    
    haveRegions() {
        return this.wsRegions != undefined;
    }

    setRegions(regions: any) {
        this.wsRegions = regions;
    }

    updateFSMStates(categoryName: string, handedness: string, landmarks: any, current_gesture: any, wsRegions: any) {
        switch (categoryName) {
            case "None":
                if (this.currSCut == CutState.StartCuttingLeft && handedness == "Left" && closedPoints(landmarks[6], landmarks[10], 0.1) && closedPoints(landmarks[7], landmarks[11], 0.1) && closedPoints(landmarks[8], landmarks[12], 0.1)) {
                    this.currSCut = CutState.ClosedCutLeft;
                } else {
                    if (this.currSCut == CutState.StartCuttingRight && handedness == "Right" && closedPoints(landmarks[6], landmarks[10], 0.1) && closedPoints(landmarks[7], landmarks[11], 0.1) && closedPoints(landmarks[8], landmarks[12], 0.1)) {
                        this.currSCut = CutState.ClosedCutRight;
                    }
                }
                this.currSVolume = VolumeState.Empty;
                this.currSEffects = EffectsState.Empty;

                //handleDrums(handedness, landmarks);

                break;
            case "Pointing_Up":
                this.currSPlayPause = PlayPauseState.Empty;
                if (this.currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    this.currSCut = CutState.Empty;
                }
                this.currSIndex = IndexState.Stopping;
                this.currSMiddle = MiddleState.Stopping;
                this.currSRing = RingState.Stopping;
                this.currSPincky = PickyState.Stopping;
                this.currSEffects = EffectsState.Empty;
                if (handedness == "Right") {
                    this.currSVolume = VolumeState.Started;
                    current_gesture.innerText = "👆 + ↔️ → Down 🔈 ↔️ 🔊 Up";
                }
                break;
            case "Open_Palm":
                if (handedness == "Right") {
                    this.currSPlayPause = PlayPauseState.Started;
                    current_gesture.innerText = "🖐️ + ✊ → ⏯️";
                }
                if (this.currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    this.currSCut = CutState.Empty;
                }
                this.currSVolume = VolumeState.Empty;
                this.currSIndex = IndexState.Stopping;
                this.currSMiddle = MiddleState.Stopping;
                this.currSRing = RingState.Stopping;
                this.currSPincky = PickyState.Stopping;
                this.currSEffects = EffectsState.Empty;
                break;
            case "Closed_Fist":
                if (handedness == "Right") {

                    if (this.currSPlayPause == PlayPauseState.Started) {
                        this.currSPlayPause = PlayPauseState.Completed;
                        current_gesture.innerText = "⏯️ ✅";
                    }

                }
                if (this.currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    this.currSCut = CutState.Empty;
                }
                this.currSVolume = VolumeState.Empty;
                this.currSIndex = IndexState.Stopping;
                this.currSMiddle = MiddleState.Stopping;
                this.currSRing = RingState.Stopping;
                this.currSPincky = PickyState.Stopping;
                this.currSEffects = EffectsState.Empty;
                break;
            case "Victory":
                this.currSPlayPause = PlayPauseState.Empty;
                this.currSVolume = VolumeState.Empty;
                this.currSIndex = IndexState.Stopping;
                this.currSMiddle = MiddleState.Stopping;
                this.currSRing = RingState.Stopping;
                this.currSPincky = PickyState.Stopping;
                this.currSEffects = EffectsState.Empty;
                switch (this.currSCut) {
                    case CutState.Empty:
                        if (handedness == "Left") {
                            this.currSCut = CutState.StartCuttingLeft;
                            if (wsRegions != undefined) {
                                wsRegions.clearRegions();
                            }
                            this.loopRegion = undefined;
                        }
                        break;
                    case CutState.ClosedCutLeft:
                        if (handedness == "Left") {
                            this.currSCut = CutState.CuttedLeft;
                        }
                        break;
                    case CutState.CuttedLeft:
                        if (handedness == "Right") {
                            this.currSCut = CutState.StartCuttingRight;
                        }
                        break;
                    case CutState.ClosedCutRight:
                        if (handedness == "Right") {
                            this.currSCut = CutState.CuttedCompleted;
                        }
                        break;
                }
                break;
            case "Thumb_Up":
                this.currSPlayPause = PlayPauseState.Empty;
                if (this.currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    this.currSCut = CutState.Empty;
                }
                this.currSVolume = VolumeState.Empty;
                this.currSIndex = IndexState.Stopping;
                this.currSMiddle = MiddleState.Stopping;
                this.currSRing = RingState.Stopping;
                this.currSPincky = PickyState.Stopping;
                if (handedness == "Right") {
                    this.currSEffects = EffectsState.StartPuttingEffects;
                    current_gesture.innerText = "👍 + 🔄 → Speed";
                }
                break;
            case "Thumb_Down":
                this.currSPlayPause = PlayPauseState.Empty;
                if (this.currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    this.currSCut = CutState.Empty;
                }
                this.currSVolume = VolumeState.Empty;
                this.currSIndex = IndexState.Stopping;
                this.currSMiddle = MiddleState.Stopping;
                this.currSRing = RingState.Stopping;
                this.currSPincky = PickyState.Stopping;
                this.currSEffects = EffectsState.Empty;
                break;
            case "ILoveYou":
                this.currSPlayPause = PlayPauseState.Empty;
                if (this.currSCut != CutState.Empty) {
                    wsRegions.clearRegions();
                    this.currSCut = CutState.Empty;
                }
                this.currSVolume = VolumeState.Empty;
                this.currSIndex = IndexState.Stopping;
                this.currSMiddle = MiddleState.Stopping;
                this.currSRing = RingState.Stopping;
                this.currSPincky = PickyState.Stopping;
                this.currSEffects = EffectsState.Empty;
                break;
        }
    }

    getCutText() {
        switch (this.currSCut) {
            case CutState.StartCuttingLeft:
                return "✌️ + 🤞 To Start Loop";
            case CutState.ClosedCutLeft:
                return "Left Cut ✅ → Complete Right Cut ✌️";
            case CutState.CuttedLeft:
                return "✌️ + 🤞 To Close Loop";
            case CutState.StartCuttingRight:
                return "✌️ + 🤞 To Close Loop";
            case CutState.CuttedCompleted:
                return "Loop created ✅ → ✌️ To Remove Loop";
        }
        return undefined;
    }

    getDrumSound(landmarks: any) {
        if (closedPoints(landmarks[8], landmarks[4], 0.05)) {
            if (this.currSIndex == IndexState.Listening) {
                // Play the audio in the background
                this.currSIndex = IndexState.Stopping;
                return 'bassdrum';
            }
        } else {
            this.currSIndex = IndexState.Listening;
        }

        //Middle finger action
        if (closedPoints(landmarks[12], landmarks[4], 0.05)) {
            if (this.currSMiddle == MiddleState.Listening) {
                // Play the audio in the background
                this.currSMiddle = MiddleState.Stopping;
                return 'snare';
            }
        } else {
            this.currSMiddle = MiddleState.Listening;
        }

        //Ring finger action
        if (closedPoints(landmarks[16], landmarks[4], 0.05)) {
            if (this.currSRing == RingState.Listening) {
                // Play the audio in the background
                this.currSRing = RingState.Stopping;
                return 'clap';
            }
        } else {
            this.currSRing = RingState.Listening;
        }

        //Pinky Finger action
        if (closedPoints(landmarks[20], landmarks[4], 0.05)) {
            if (this.currSPincky == PickyState.Listening) {
                // Play sounds
                this.currSPincky = PickyState.Stopping;
                return 'hat';
            }
        } else {
            this.currSPincky = PickyState.Listening;
        }
        return undefined;
    }

    runPlayPause() {
        if (this.currSPlayPause == PlayPauseState.Completed) {
            this.currSPlayPause = PlayPauseState.Empty;
            return true;
        }
        return false;
    }

    getSpeedText(landmarks: any, handedness: any) {
        if (this.currSEffects == EffectsState.StartPuttingEffects && handedness == "Right") {
            //Manage effects
            var currentThumbUpCoordinates = { x: landmarks[4].x, y: landmarks[4].y };
            var referencePoint = { x: landmarks[0].x, y: landmarks[0].y }
            this.updateEffectsValue(currentThumbUpCoordinates!, referencePoint!);
            return "👍 + 🔄 → Speed: " + this.speedValue.toFixed(2) + "x";
        }
        return undefined;
    }

    /**
     * Function to update the effect factor based on the angle taken by the Thumb_Up gesture
     */
    updateEffectsValue(point1: Coordinates, point2: Coordinates) {
        var angle: number = 0;
        angle = calculateAngle(point1, point2);
        this.speedValue = angle / 100;
    }

    handleLoopRegions(currentTime: number) {
        if (this.currSCut == CutState.ClosedCutLeft && this.loopRegion == undefined) {
            this.loopRegion = {
                start: currentTime,
                color: "#e0a9e06e",
                content: 'Start Loop',
                loop: false,
                drag: false,
                resize: false,
            };
            this.wsRegions.addRegion(this.loopRegion);
        }

        if (this.currSCut == CutState.ClosedCutRight) {
            this.loopRegion.end = currentTime;
            this.loopRegion.loop = true;
        }

        if (this.currSCut == CutState.CuttedCompleted) {
            this.wsRegions.clearRegions();
            this.wsRegions.addRegion(this.loopRegion);
            this.currSCut = CutState.Empty;
        }
    }

    isVolumeStarted() {
        return this.currSVolume == VolumeState.Started;
    }

    getSpeedValue() {
        return this.speedValue;
    }
}