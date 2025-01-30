import { ShotParameters, TrajectoryPoint } from '@/types';

// Constants for golf ball physics
const GRAVITY = 9.81; // m/s^2
const SEA_LEVEL_AIR_DENSITY = 1.225; // kg/m^3 at sea level
const BALL_MASS = 0.0459; // kg (standard golf ball)
const BALL_RADIUS = 0.02135; // m (standard golf ball)
const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS;

// Refined golf-specific coefficients
const CD_ZERO = 0.31; // Optimized drag coefficient
const CL_ZERO = 0.22; // Slightly increased lift coefficient
const SPIN_FACTOR = 0.00008; // Adjusted spin effect on lift
const SPIN_DRAG_FACTOR = 0.00009; // Balanced spin drag factor

// Enhanced ground interaction coefficients
const BOUNCE_FRICTION = 0.4; // Increased friction during bounce
const ROLL_FRICTION = 0.3; // Increased rolling friction
const BOUNCE_COEFFICIENT = 0.35; // Reduced bounce coefficient for more realistic first bounce
const SPIN_ROLL_FACTOR = 0.00015; // Reduced spin effect on roll

// Ball type specific coefficients with refined values
const BALL_TYPE_COEFFICIENTS = {
  'RPT Ball': { drag: 1.0, lift: 1.0 },
  'Range Ball': { drag: 1.3, lift: 0.7 }, // More drag, less lift for range balls
  'Premium Ball': { drag: 1.15, lift: 0.85 } // More realistic premium ball behavior
} as const;

function calculateAirDensity(altitude: number): number {
  // Enhanced atmospheric model with more realistic altitude effect
  const scaleHeight = 7200; // Adjusted scale height
  const density = SEA_LEVEL_AIR_DENSITY * Math.exp(-altitude / scaleHeight);
  // Progressive density reduction with altitude
  return density * (1 - (altitude / 35000));
}

function calculateDragCoefficient(velocity: number, spinRate: number, ballType: keyof typeof BALL_TYPE_COEFFICIENTS): number {
  // Enhanced Reynolds number-based drag model
  const reynolds = (velocity * 2 * BALL_RADIUS * SEA_LEVEL_AIR_DENSITY) / (1.81e-5);
  let cd = CD_ZERO * BALL_TYPE_COEFFICIENTS[ballType].drag;

  // More pronounced Reynolds number effects
  if (reynolds < 4e4) {
    cd *= 1.5; // Adjusted laminar flow drag
  } else if (reynolds < 7.5e4) {
    cd *= 1.25; // Fine-tuned transition region drag
  } else if (reynolds > 2e5) {
    cd *= 0.85; // Optimized turbulent flow reduction
  }

  // Enhanced spin effects on drag
  if (ballType === 'RPT Ball') {
    const spinFactor = (2 * Math.PI * BALL_RADIUS * spinRate) / (60 * velocity);
    cd += spinFactor * SPIN_DRAG_FACTOR * (1 + velocity / 120); // More gradual spin drag progression
  }

  return cd;
}

function calculateLiftCoefficient(spinRate: number, velocity: number, ballType: keyof typeof BALL_TYPE_COEFFICIENTS): number {
  if (ballType !== 'RPT Ball') {
    return CL_ZERO * BALL_TYPE_COEFFICIENTS[ballType].lift;
  }

  // Enhanced Magnus effect model
  const spinFactor = (2 * Math.PI * BALL_RADIUS * spinRate) / (60 * velocity);
  const reynoldsEffect = Math.min(1, velocity / 45); // Adjusted velocity effect on lift

  return (CL_ZERO + SPIN_FACTOR * spinFactor * reynoldsEffect) * 
    BALL_TYPE_COEFFICIENTS[ballType].lift;
}

function calculateRoll(landingVelocity: number, landingAngle: number, spinRate: number | undefined): number {
  const landingAngleRad = landingAngle;

  // Enhanced bounce model
  const normalVelocity = landingVelocity * Math.sin(landingAngleRad);
  const tangentialVelocity = landingVelocity * Math.cos(landingAngleRad);

  // More realistic bounce behavior
  let effectiveBounceCoeff = BOUNCE_COEFFICIENT;
  if (landingAngleRad < Math.PI / 6) {
    effectiveBounceCoeff *= (1 - Math.cos(landingAngleRad)) * 0.8;
  }
  if (landingVelocity > 30) {
    effectiveBounceCoeff *= 0.9; // Reduced bounce for higher speeds
  }

  const bounceNormalVelocity = normalVelocity * effectiveBounceCoeff;
  let rollVelocity = tangentialVelocity * (1 - BOUNCE_FRICTION) + 
    bounceNormalVelocity * Math.sin(landingAngleRad / 2);

  // Enhanced spin effects
  if (spinRate !== undefined) {
    const spinEffect = -spinRate * SPIN_ROLL_FACTOR * 
      Math.exp(-Math.abs(landingAngleRad));
    rollVelocity *= (1 + spinEffect);
  }

  // Enhanced friction model
  const effectiveFriction = ROLL_FRICTION * 
    (1 + Math.abs(Math.sin(landingAngleRad))) * 
    (1 + landingVelocity / 100);

  const rollDistance = Math.max(0, 
    (rollVelocity * rollVelocity) / (2 * effectiveFriction * GRAVITY));

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
  let maxHeight = 0;

  // Track trajectory points for apex calculation
  while (y >= 0 && t < 15) { // Max 15 seconds flight time
    maxHeight = Math.max(maxHeight, y);

    points.push({
      time: t,
      x,
      y,
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
    });

    const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // Calculate aerodynamic coefficients
    const cd = calculateDragCoefficient(velocity, params.spin || 0, params.ballType as keyof typeof BALL_TYPE_COEFFICIENTS);
    const cl = calculateLiftCoefficient(params.spin || 0, velocity, params.ballType as keyof typeof BALL_TYPE_COEFFICIENTS);

    // Calculate forces
    const dragMagnitude = 0.5 * calculateAirDensity(maxHeight) * velocity * velocity * BALL_AREA * cd;
    const liftMagnitude = 0.5 * calculateAirDensity(maxHeight) * velocity * velocity * BALL_AREA * cl;

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

  // Final point with all calculated values
  const finalPoint: TrajectoryPoint = {
    time: t,
    x: x + rollDistance * Math.cos(landingAngle),
    y: 0,
    z: z + rollDistance * Math.sin(landingAngle),
    velocity: landingVelocity,
    spin: params.spin || 0,
    altitude: maxHeight, // Store the maximum height reached
    distance: Math.sqrt((x + rollDistance * Math.cos(landingAngle)) * (x + rollDistance * Math.cos(landingAngle)) + (z + rollDistance * Math.sin(landingAngle)) * (z + rollDistance * Math.sin(landingAngle))),
    drag: 0,
    lift: 0,
    side: z + rollDistance * Math.sin(landingAngle),
    total: Math.sqrt((x + rollDistance * Math.cos(landingAngle)) * (x + rollDistance * Math.cos(landingAngle)) + (z + rollDistance * Math.sin(landingAngle)) * (z + rollDistance * Math.sin(landingAngle))),
    carry: x,
    launchAngle: params.launchAngle,
    launchDirection: params.launchDirection * (params.launchDirectionSide === 'right' ? 1 : -1),
    spinAxis: params.spinAxis * (params.spinDirection === 'right' ? 1 : -1),
    ballSpeed: params.ballSpeed  // Store the original ball speed in mph
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