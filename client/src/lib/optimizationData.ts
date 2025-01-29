
// Reference data from Trackman and Ping studies
export const clubSpeedOptimization = {
  // Speed ranges and their optimal parameters
  driver: {
    speedRange: [85, 105],
    optimal: {
      launchAngle: [12.5, 14],
      spinRate: [2200, 2500],
      ballSpeed: 1.48, // Smash factor
      carry: [230, 275]
    }
  },
  fairway: {
    speedRange: [75, 90],
    optimal: {
      launchAngle: [13, 15],
      spinRate: [3000, 3500],
      ballSpeed: 1.47,
      carry: [195, 230]
    }
  },
  iron: {
    speedRange: [65, 85],
    optimal: {
      launchAngle: [16, 18],
      spinRate: [4500, 5000],
      ballSpeed: 1.44,
      carry: [165, 195]
    }
  }
};

export function getOptimalParameters(clubSpeed: number) {
  let clubType;
  if (clubSpeed >= 85) clubType = 'driver';
  else if (clubSpeed >= 75) clubType = 'fairway';
  else clubType = 'iron';

  const data = clubSpeedOptimization[clubType];
  const speedRatio = (clubSpeed - data.speedRange[0]) / (data.speedRange[1] - data.speedRange[0]);
  
  return {
    launchAngle: data.optimal.launchAngle[0] + speedRatio * (data.optimal.launchAngle[1] - data.optimal.launchAngle[0]),
    spinRate: data.optimal.spinRate[0] + speedRatio * (data.optimal.spinRate[1] - data.optimal.spinRate[0]),
    ballSpeed: clubSpeed * data.optimal.ballSpeed,
    expectedCarry: data.optimal.carry[0] + speedRatio * (data.optimal.carry[1] - data.optimal.carry[0])
  };
}
