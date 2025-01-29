export interface WeatherConditions {
  windSpeed: number;
  airPressure: number;
  humidity: number;
  temperature: number;
}

export interface ShotParameters {
  ballSpeed: number;
  launchAngle: number;
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
}

export type Unit = 'imperial' | 'metric';