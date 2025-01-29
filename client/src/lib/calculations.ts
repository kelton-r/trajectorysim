import { ShotParameters, TrajectoryPoint, WeatherConditions } from '@/types';

// Constants for golf ball physics
const GRAVITY = 9.81; // m/s^2
const AIR_DENSITY = 1.225; // kg/m^3 at sea level
const BALL_MASS = 0.0459; // kg (standard golf ball)
const BALL_RADIUS = 0.02135; // m (standard golf ball)
const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS;

// Golf-specific coefficients
const CD_ZERO = 0.171; // Base drag coefficient for a golf ball
const CL_ZERO = 0.171; // Base lift coefficient
const SPIN_FACTOR = 0.0001; // Factor for spin effect on lift

function calculateDragCoefficient(velocity: number, spinRate: number): number {
  // Reynolds number-based drag coefficient
  const reynolds = (velocity * 2 * BALL_RADIUS * AIR_DENSITY) / (1.81e-5);
  let cd = CD_ZERO;

  // Adjust drag based on Reynolds number and spin
  if (reynolds < 7.5e4) {
    cd += 0.1; // Increased drag in laminar flow
  } else if (reynolds > 2e5) {
    cd -= 0.05; // Decreased drag in turbulent flow
  }

  // Spin effect on drag
  cd += (spinRate / 10000) * 0.05;

  return cd;
}

function calculateLiftCoefficient(spinRate: number, velocity: number): number {
  // Calculate lift coefficient based on spin rate and velocity
  const spinFactor = (2 * Math.PI * BALL_RADIUS * spinRate) / (60 * velocity);
  return CL_ZERO + SPIN_FACTOR * spinFactor;
}

export function calculateTrajectory(params: ShotParameters): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const dt = 0.001; // Smaller time step for more accuracy

  // Convert inputs to SI units
  const ballSpeedMS = params.ballSpeed * 0.44704; // mph to m/s
  const spinRateRad = params.spin * (2 * Math.PI) / 60; // rpm to rad/s

  // Convert angles to radians
  const launchAngleRad = params.launchAngle * Math.PI / 180;
  const launchDirectionRad = params.launchDirection * Math.PI / 180 * 
    (params.launchDirectionSide === 'right' ? 1 : -1);
  const spinAxisRad = params.spinAxis * Math.PI / 180 * 
    (params.spinDirection === 'right' ? 1 : -1);

  // Initial position and velocity components
  let x = 0, y = 0, z = 0;
  let vx = ballSpeedMS * Math.cos(launchAngleRad) * Math.cos(launchDirectionRad);
  let vy = ballSpeedMS * Math.sin(launchAngleRad);
  let vz = ballSpeedMS * Math.cos(launchAngleRad) * Math.sin(launchDirectionRad);

  let t = 0;

  while (y >= 0 && t < 15) { // Max 15 seconds flight time
    const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // Calculate aerodynamic coefficients
    const cd = calculateDragCoefficient(velocity, params.spin);
    const cl = calculateLiftCoefficient(params.spin, velocity);

    // Calculate forces
    const dragMagnitude = 0.5 * AIR_DENSITY * velocity * velocity * BALL_AREA * cd;
    const liftMagnitude = 0.5 * AIR_DENSITY * velocity * velocity * BALL_AREA * cl;

    // Unit vectors
    const dragUnitX = -vx / velocity;
    const dragUnitY = -vy / velocity;
    const dragUnitZ = -vz / velocity;

    // Lift direction (perpendicular to velocity and spin axis)
    const liftUnitX = Math.sin(spinAxisRad);
    const liftUnitY = Math.cos(spinAxisRad);
    const liftUnitZ = Math.sin(spinAxisRad) * Math.cos(launchDirectionRad);

    // Sum forces and calculate accelerations
    const ax = (dragMagnitude * dragUnitX + liftMagnitude * liftUnitX) / BALL_MASS;
    const ay = (dragMagnitude * dragUnitY + liftMagnitude * liftUnitY - BALL_MASS * GRAVITY) / BALL_MASS;
    const az = (dragMagnitude * dragUnitZ + liftMagnitude * liftUnitZ) / BALL_MASS;

    // Update velocities
    vx += ax * dt;
    vy += ay * dt;
    vz += az * dt;

    // Update positions
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;

    // Store point data
    points.push({
      time: t,
      x, y, z,
      velocity,
      spin: params.spin,
      altitude: y,
      distance: Math.sqrt(x * x + z * z),
      drag: dragMagnitude,
      lift: liftMagnitude,
      side: z,
      total: Math.sqrt(x * x + y * y + z * z),
      carry: x
    });

    t += dt;
  }

  // Reduce number of points for rendering efficiency
  const stride = Math.max(1, Math.floor(points.length / 100));
  return points.filter((_, i) => i % stride === 0);
}

export function validateShotParameters(params: ShotParameters): boolean {
  return (
    params.ballSpeed > 0 &&
    params.ballSpeed <= 200 &&
    params.launchAngle >= 0 &&
    params.launchAngle <= 90 &&
    params.launchDirection >= -90 &&
    params.launchDirection <= 90 &&
    params.spin >= 0 &&
    params.spin <= 10000 &&
    params.spinAxis >= -90 &&
    params.spinAxis <= 90 &&
    (params.spinDirection === 'right' || params.spinDirection === 'left') &&
    (params.launchDirectionSide === 'right' || params.launchDirectionSide === 'left')
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