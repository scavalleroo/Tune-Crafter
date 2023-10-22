export enum CutState {
    Empty = "empty",
    StartCuttingLeft = "startCuttingLeft",
    ClosedCutLeft = "closedCutLeft",
    CuttedLeft = "cuttedLeft",
    StartCuttingRight = "startCuttingRight",
    ClosedCutRight = "closedCutRight",
    CuttedCompleted = "cuttedCompleted"
}

export enum PlayPauseState {
    Empty = "empty",
    Started = "started",
    Completed = "completed"
}

export enum IndexState {
    Listening = "listen",
    Stopping = "stop"
}

export enum MiddleState {
    Listening = "listen",
    Stopping = "stop"
}

export enum RingState {
    Listening = "listen",
    Stopping = "stop"
}

export enum PickyState {
    Listening = "listen",
    Stopping = "stop"
}

export enum VolumeState {
    Empty = "empty",
    Started = "startedManagingVolume"
}

export enum EffectsState {
    Empty = "empty",
    StartPuttingEffects = "startPuttingEffects",
}