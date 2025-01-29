export interface ShotParameters {
  ballSpeed: number;
  launchAngle: number;
  launchDirection: number;
  launchDirectionSide: 'right' | 'left';
  spin: number;
  spinAxis: number;
  spinDirection: 'right' | 'left';
  ballType: string;
}

export interface TrajectoryPoint {
  time: number;
  x: number;
  y: number;
  z: number;
  velocity: number;
  spin: number;
  altitude: number;
  distance: number;
  drag: number;
  lift: number;
  side: number;
  total: number;
  carry: number;
  // Add shot parameter values for display
  launchAngle: number;
  launchDirection: number;
  spinAxis: number;
}

export type Unit = 'imperial' | 'metric';