import { WeatherConditions, ShotParameters, TrajectoryPoint } from '@/types';

const GRAVITY = 9.81; // m/s^2
const AIR_DENSITY = 1.225; // kg/m^3
const BALL_MASS = 0.0459; // kg (standard golf ball)

export function calculateTrajectory(
  params: ShotParameters,
  weather: WeatherConditions
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const dt = 0.01; // Time step in seconds

  let x = 0, y = 0, z = 0;
  let vx = params.launchVelocity * Math.cos(params.launchAngle * Math.PI / 180);
  let vy = params.launchVelocity * Math.sin(params.launchAngle * Math.PI / 180);
  let vz = 0;

  let t = 0;

  // Record initial point first
  points.push({
    time: t,
    x: x,
    y: y,
    z: z,
    velocity: params.launchVelocity,
    spin: params.spin,
    altitude: y,
    distance: 0,
    drag: calculateDrag(params.launchVelocity, weather.airPressure),
    lift: calculateLift(params.spin, params.launchVelocity),
    side: z,
    total: 0,
    carry: x
  });

  while (y >= 0 && t < 10) { // Max 10 seconds flight time
    const v = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const drag = calculateDrag(v, weather.airPressure);
    const lift = calculateLift(params.spin, v);

    // Update velocities
    vx -= (drag * vx / v) * dt;
    vy -= (GRAVITY + drag * vy / v) * dt;
    vy += lift * dt;
    vz -= (drag * vz / v) * dt;

    // Update positions
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;

    // Record point
    points.push({
      time: t,
      x, y, z,
      velocity: v,
      spin: params.spin,
      altitude: y,
      distance: Math.sqrt(x * x + z * z),
      drag,
      lift,
      side: z,
      total: Math.sqrt(x * x + y * y + z * z),
      carry: x
    });

    t += dt;
  }

  return points;
}

function calculateDrag(velocity: number, pressure: number): number {
  const cd = 0.47; // Drag coefficient for a golf ball
  return 0.5 * AIR_DENSITY * (velocity * velocity) * cd * Math.PI * 0.0214; // 0.0214 m^2 is approx. cross-section
}

function calculateLift(spin: number, velocity: number): number {
  const cl = 0.1 + (spin / 10000); // Simplified lift coefficient based on spin
  return 0.5 * AIR_DENSITY * (velocity * velocity) * cl * Math.PI * 0.0214;
}

export function validateShotParameters(params: ShotParameters): boolean {
  return (
    params.launchVelocity > 0 &&
    params.launchVelocity < 100 &&
    params.launchAngle >= 0 &&
    params.launchAngle <= 90 &&
    params.spin >= 0 &&
    params.spin <= 10000
  );
}

export function validateWeatherConditions(weather: WeatherConditions): boolean {
  return (
    weather.windSpeed >= 0 &&
    weather.windSpeed <= 50 &&
    weather.airPressure >= 900 &&
    weather.airPressure <= 1100 &&
    weather.humidity >= 0 &&
    weather.humidity <= 100 &&
    weather.temperature >= -20 &&
    weather.temperature <= 50
  );
}