import { Coordinates } from "../components/GestureComponent";

// Check if webcam access is supported.
export function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Function to calculate the angle between two coordinates and the x axis starting from (0,0)
 * Online help: "How to calculate the angle between two points and the X axis?"
 */
export const calculateAngle = (coord1: Coordinates, coord2: Coordinates) => {
    const dx = coord2.x - coord1.x;
    const dy = coord2.y - coord1.y;

    var angle = Math.atan2(dy, dx);
    angle = -angle;

    // Adjust the angle to be between 0 and 360 degrees
    if (angle < 0) {
        angle += 2 * Math.PI;
    }

    var angleDegree = angle * 70 / Math.PI;
    angleDegree += (angleDegree - 100) * 4;

    return angleDegree;
};

/**
 * Function to check if two points are close enough in order to detect the finger tips touch
 */
export const closedPoints = (point1: any, point2: any, precision: number) => {
    var a = point1.x - point2.x;
    var b = point1.y - point2.y;
    var c = Math.sqrt(a * a + b * b);
    if (c < precision) {
        return true;
    }
    return false;
}