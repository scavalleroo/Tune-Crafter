import React from 'react';

interface VolumeProgressBarProps {
    volume : number;
}

const VolumeProgressBar = ({ volume } : VolumeProgressBarProps) => {

    return(
        <>
            <div className="progress">
                <div className="progress-bar" id="volume-bar" role="progressbar" style={{width: `${volume}%`, background: '#00C896', fontSize: '16px', fontWeight: 'bold', padding: '5px',}} aria-valuenow={volume} aria-valuemin={0} aria-valuemax={100}>♪ {volume}</div>
            </div>
        </>
    )

}

export default VolumeProgressBar;