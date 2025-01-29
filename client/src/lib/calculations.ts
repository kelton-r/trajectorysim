import { ShotParameters, TrajectoryPoint } from '@/types';

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

// Ball type specific coefficients
const BALL_TYPE_COEFFICIENTS = {
  'RPT Ball': { drag: 1.0, lift: 1.0 },
  'Range Ball': { drag: 1.2, lift: 0.8 }, // Higher drag, lower lift
  'Premium Ball': { drag: 1.1, lift: 0.9 } // Slightly higher drag, slightly lower lift
} as const;

function calculateDragCoefficient(velocity: number, spinRate: number, ballType: keyof typeof BALL_TYPE_COEFFICIENTS): number {
  const reynolds = (velocity * 2 * BALL_RADIUS * AIR_DENSITY) / (1.81e-5);
  let cd = CD_ZERO * BALL_TYPE_COEFFICIENTS[ballType].drag;

  if (reynolds < 7.5e4) {
    cd += 0.1;
  } else if (reynolds > 2e5) {
    cd -= 0.05;
  }

  if (ballType === 'RPT Ball') {
    cd += (spinRate / 10000) * 0.05;
  }

  return cd;
}

function calculateLiftCoefficient(spinRate: number, velocity: number, ballType: keyof typeof BALL_TYPE_COEFFICIENTS): number {
  if (ballType !== 'RPT Ball') {
    return CL_ZERO * BALL_TYPE_COEFFICIENTS[ballType].lift;
  }

  const spinFactor = (2 * Math.PI * BALL_RADIUS * spinRate) / (60 * velocity);
  return (CL_ZERO + SPIN_FACTOR * spinFactor) * BALL_TYPE_COEFFICIENTS[ballType].lift;
}

export function calculateTrajectory(params: ShotParameters): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const dt = 0.001; // Time step in seconds
  const numPoints = 200; // Store 200 points for visualization
  const timeStep = dt * 5; // Sample every 5th point for visualization

  // Convert inputs to SI units
  const ballSpeedMS = params.ballSpeed * 0.44704; // mph to m/s
  const spinRateRad = params.ballType === 'RPT Ball' ? params.spin * (2 * Math.PI) / 60 : 0; // rpm to rad/s

  // Convert angles to radians
  const launchAngleRad = params.launchAngle * Math.PI / 180;
  const launchDirectionRad = params.launchDirection * Math.PI / 180 *
    (params.launchDirectionSide === 'right' ? 1 : -1);
  const spinAxisRad = params.ballType === 'RPT Ball' ?
    params.spinAxis * Math.PI / 180 * (params.spinDirection === 'right' ? 1 : -1) : 0;

  // Initial position and velocity components
  let x = 0, y = 0, z = 0;
  let vx = ballSpeedMS * Math.cos(launchAngleRad) * Math.cos(launchDirectionRad);
  let vy = ballSpeedMS * Math.sin(launchAngleRad);
  let vz = ballSpeedMS * Math.cos(launchAngleRad) * Math.sin(launchDirectionRad);

  let t = 0;
  let pointCount = 0;
  let maxHeight = 0;
  let finalPoint: TrajectoryPoint | null = null;

  // Track trajectory points for visualization and calculations
  while (y >= 0 && t < 15) { // Max 15 seconds flight time
    maxHeight = Math.max(maxHeight, y);

    if (pointCount % 5 === 0) { // Sample every 5th point for visualization
      points.push({
        time: t,
        x,
        y,
        z,
        velocity: Math.sqrt(vx * vx + vy * vy + vz * vz),
        spin: params.spin || 0,
        altitude: maxHeight,
        distance: Math.sqrt(x * x + z * z),
        drag: 0, // Placeholder for now
        lift: 0, // Placeholder for now
        side: z,
        total: Math.sqrt(x * x + z * z),
        carry: x,
        launchAngle: params.launchAngle,
        launchDirection: params.launchDirection * (params.launchDirectionSide === 'right' ? 1 : -1),
        spinAxis: params.spinAxis * (params.spinDirection === 'right' ? 1 : -1),
        ballSpeed: params.ballSpeed
      });
    }

    const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const cd = calculateDragCoefficient(velocity, params.spin || 0, params.ballType as keyof typeof BALL_TYPE_COEFFICIENTS);
    const cl = calculateLiftCoefficient(params.spin || 0, velocity, params.ballType as keyof typeof BALL_TYPE_COEFFICIENTS);

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

    t += dt;
    pointCount++;
  }

  // Ensure we have the final point for statistics
  finalPoint = {
    time: t,
    x,
    y: 0, // Ground level
    z,
    velocity: Math.sqrt(vx * vx + vy * vy + vz * vz),
    spin: params.spin || 0,
    altitude: maxHeight,
    distance: Math.sqrt(x * x + z * z),
    drag: 0,
    lift: 0,
    side: z,
    total: Math.sqrt(x * x + z * z),
    carry: x,
    launchAngle: params.launchAngle,
    launchDirection: params.launchDirection * (params.launchDirectionSide === 'right' ? 1 : -1),
    spinAxis: params.spinAxis * (params.spinDirection === 'right' ? 1 : -1),
    ballSpeed: params.ballSpeed
  };

  return [...points, finalPoint];
}

export function validateShotParameters(params: ShotParameters): boolean {
  const baseValidation = (
    params.ballSpeed > 0 &&
    params.ballSpeed <= 200 &&
    params.launchAngle >= 0 &&
    params.launchAngle <= 90 &&
    params.launchDirection >= -90 &&
    params.launchDirection <= 90 &&
    (params.launchDirectionSide === 'right' || params.launchDirectionSide === 'left')
  );

  // Only validate spin parameters for RPT Ball
  if (params.ballType === 'RPT Ball') {
    return baseValidation && (
      params.spin !== undefined &&
      params.spin >= 0 &&
      params.spin <= 10000 &&
      params.spinAxis !== undefined &&
      params.spinAxis >= -90 &&
      params.spinAxis <= 90 &&
      (params.spinDirection === 'right' || params.spinDirection === 'left')
    );
  }

  return baseValidation;
}

export function validateWeatherConditions(weather: {windSpeed:number, airPressure:number, humidity:number, temperature:number}): boolean {
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