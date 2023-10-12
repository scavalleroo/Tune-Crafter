import React from 'react';

interface VolumeProgressBarProps {
    volume : number;
}

const VolumeProgressBar = ({ volume } : VolumeProgressBarProps) => {



    return(
        <>
            <div className="progress">
                <div className="progress-bar bg-info" id="volume-bar" role="progressbar" style={{ width: `${volume}%` }} aria-valuenow={volume} aria-valuemin={0} aria-valuemax={100}></div>
            </div>
        </>
    )

}

export default VolumeProgressBar;