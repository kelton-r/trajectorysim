import { ShotParameters, TrajectoryPoint } from '@/types';

const GRAVITY = 9.81; // m/s^2
const TEMPERATURE = 21.1; // 70°F in Celsius
const AIR_DENSITY = 1.204; // kg/m^3 at 21.1°C (70°F)
const BALL_MASS = 0.0459; // kg (standard golf ball)

export function calculateTrajectory(
  params: ShotParameters
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const dt = 0.01; // Time step in seconds

  // Convert ball speed from mph to m/s
  const ballSpeedMS = params.ballSpeed * 0.44704;

  let x = 0, y = 0, z = 0;
  let vx = ballSpeedMS * Math.cos(params.launchAngle * Math.PI / 180);
  let vy = ballSpeedMS * Math.sin(params.launchAngle * Math.PI / 180);
  let vz = 0;

  // Apply spin axis effect to initial velocity
  const spinAxisRad = params.spinAxis * (Math.PI / 180) * (params.spinDirection === 'right' ? 1 : -1);
  vz = ballSpeedMS * Math.sin(spinAxisRad);

  let t = 0;

  points.push({
    time: t,
    x: x,
    y: y,
    z: z,
    velocity: ballSpeedMS,
    spin: params.spin,
    altitude: y,
    distance: 0,
    drag: calculateDrag(ballSpeedMS),
    lift: calculateLift(params.spin, ballSpeedMS),
    side: z,
    total: 0,
    carry: x
  });

  while (y >= 0 && t < 10) { // Max 10 seconds flight time
    const v = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const drag = calculateDrag(v);
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

function calculateDrag(velocity: number): number {
  const cd = 0.47; // Drag coefficient for a golf ball
  return 0.5 * AIR_DENSITY * (velocity * velocity) * cd * Math.PI * 0.0214;
}

function calculateLift(spin: number, velocity: number): number {
  const cl = 0.1 + (spin / 10000);
  return 0.5 * AIR_DENSITY * (velocity * velocity) * cl * Math.PI * 0.0214;
}

export function validateShotParameters(params: ShotParameters): boolean {
  return (
    params.ballSpeed > 0 &&
    params.ballSpeed <= 200 &&
    params.launchAngle >= 0 &&
    params.launchAngle <= 90 &&
    params.spin >= 0 &&
    params.spin <= 10000 &&
    params.spinAxis >= -90 &&
    params.spinAxis <= 90 &&
    (params.spinDirection === 'right' || params.spinDirection === 'left')
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