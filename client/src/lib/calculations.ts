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

// Ball type specific coefficients
const BALL_TYPE_COEFFICIENTS = {
  'RPT Ball': { drag: 1.0, lift: 1.0 },
  'Range Ball': { drag: 1.2, lift: 0.8 }, // Higher drag, lower lift
  'Premium Ball': { drag: 1.1, lift: 0.9 } // Slightly higher drag, slightly lower lift
} as const;

// Ground interaction coefficients
const BOUNCE_FRICTION = 0.35; // Friction coefficient during bounce
const ROLL_FRICTION = 0.25; // Rolling friction coefficient
const BOUNCE_COEFFICIENT = 0.4; // Base bounce coefficient
const SPIN_ROLL_FACTOR = 0.0002; // How much spin affects roll distance

function calculateDragCoefficient(velocity: number, spinRate: number, ballType: keyof typeof BALL_TYPE_COEFFICIENTS): number {
  // Reynolds number-based drag coefficient
  const reynolds = (velocity * 2 * BALL_RADIUS * AIR_DENSITY) / (1.81e-5);
  let cd = CD_ZERO * BALL_TYPE_COEFFICIENTS[ballType].drag;

  // Adjust drag based on Reynolds number
  if (reynolds < 7.5e4) {
    cd += 0.1; // Increased drag in laminar flow
  } else if (reynolds > 2e5) {
    cd -= 0.05; // Decreased drag in turbulent flow
  }

  // Only apply spin effect for RPT balls
  if (ballType === 'RPT Ball') {
    cd += (spinRate / 10000) * 0.05;
  }

  return cd;
}

function calculateLiftCoefficient(spinRate: number, velocity: number, ballType: keyof typeof BALL_TYPE_COEFFICIENTS): number {
  if (ballType !== 'RPT Ball') {
    // Non-RPT balls have reduced lift and no spin effects
    return CL_ZERO * BALL_TYPE_COEFFICIENTS[ballType].lift;
  }

  // Calculate lift coefficient based on spin rate and velocity for RPT balls
  const spinFactor = (2 * Math.PI * BALL_RADIUS * spinRate) / (60 * velocity);
  return (CL_ZERO + SPIN_FACTOR * spinFactor) * BALL_TYPE_COEFFICIENTS[ballType].lift;
}

function calculateRoll(landingVelocity: number, landingAngle: number, spinRate: number | undefined): number {
  // Convert landing angle to radians if it's in degrees
  const landingAngleRad = landingAngle;

  // Initial bounce
  const normalVelocity = landingVelocity * Math.sin(landingAngleRad);
  const tangentialVelocity = landingVelocity * Math.cos(landingAngleRad);

  // Adjust bounce based on landing angle
  let effectiveBounceCoeff = BOUNCE_COEFFICIENT;
  if (landingAngleRad < Math.PI / 6) { // Less than 30 degrees
    effectiveBounceCoeff *= (1 - Math.cos(landingAngleRad)); // Reduce bounce for shallow angles
  }

  // After bounce velocity
  const bounceNormalVelocity = normalVelocity * effectiveBounceCoeff;

  // Initial roll velocity considering landing angle and bounce
  let rollVelocity = tangentialVelocity * (1 - BOUNCE_FRICTION) + bounceNormalVelocity * Math.sin(landingAngleRad / 2);

  // Apply spin effects if available (for RPT balls)
  if (spinRate !== undefined) {
    // Negative spin (backspin) reduces roll, positive spin increases it
    const spinEffect = -spinRate * SPIN_ROLL_FACTOR;
    rollVelocity *= (1 + spinEffect);
  }

  // Calculate roll distance using a dynamic friction model
  // Distance = (v²)/(2*μg) where μ is the rolling friction coefficient
  // For steeper landing angles, increase effective friction
  const effectiveFriction = ROLL_FRICTION * (1 + Math.abs(Math.sin(landingAngleRad)));
  const rollDistance = Math.max(0, (rollVelocity * rollVelocity) / (2 * effectiveFriction * GRAVITY));

  return rollDistance;
}

export function calculateTrajectory(params: ShotParameters): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const dt = 0.001; // Smaller time step for more accuracy

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
  let lastPoint = { x: 0, y: 0, z: 0, velocity: ballSpeedMS };

  while (y >= 0 && t < 15) { // Max 15 seconds flight time
    lastPoint = { x, y, z, velocity: Math.sqrt(vx * vx + vy * vy + vz * vz) };

    const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // Calculate aerodynamic coefficients
    const cd = calculateDragCoefficient(velocity, params.spin || 0, params.ballType);
    const cl = calculateLiftCoefficient(params.spin || 0, velocity, params.ballType);

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
  }

  // Calculate landing angle and roll
  const landingVelocity = Math.sqrt(vx * vx + vy * vy + vz * vz);
  const landingAngle = Math.atan2(vy, Math.sqrt(vx * vx + vz * vz));
  const rollDistance = calculateRoll(landingVelocity, landingAngle, params.ballType === 'RPT Ball' ? params.spin : undefined);

  // Final point with roll distance added
  const finalPoint: TrajectoryPoint = {
    time: t,
    x: lastPoint.x + rollDistance * Math.cos(landingAngle),
    y: 0,
    z: lastPoint.z + rollDistance * Math.sin(landingAngle),
    velocity: landingVelocity,
    spin: params.spin || 0,
    altitude: 0,
    distance: Math.sqrt((lastPoint.x + rollDistance * Math.cos(landingAngle)) * (lastPoint.x + rollDistance * Math.cos(landingAngle)) + (lastPoint.z + rollDistance * Math.sin(landingAngle)) * (lastPoint.z + rollDistance * Math.sin(landingAngle))),
    drag: 0,
    lift: 0,
    side: lastPoint.z + rollDistance * Math.sin(landingAngle),
    total: Math.sqrt((lastPoint.x + rollDistance * Math.cos(landingAngle)) * (lastPoint.x + rollDistance * Math.cos(landingAngle)) + (lastPoint.z + rollDistance * Math.sin(landingAngle)) * (lastPoint.z + rollDistance * Math.sin(landingAngle))),
    carry: lastPoint.x,
    launchAngle: params.launchAngle,
    launchDirection: params.launchDirection * (params.launchDirectionSide === 'right' ? 1 : -1),
    spinAxis: params.spinAxis * (params.spinDirection === 'right' ? 1 : -1)
  };

  return [finalPoint];
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