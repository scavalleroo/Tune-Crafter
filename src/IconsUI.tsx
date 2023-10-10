import React from 'react';
import './App.css';
import Coordinates from './controllers/GestureController';

function IconsUI({x, y} : Coordinates) {

  // Define inline CSS styles for positioning the icon
  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
  };

  return (
    <img src="/assets/icons/drum.png" style={iconStyle} width="40" height="40"/>
  );
}

export default IconsUI;
