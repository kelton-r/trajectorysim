import { calculateTrajectory, validateShotParameters, validateWeatherConditions } from '../calculations';
import { ShotParameters, WeatherConditions } from '@/types';

describe('Golf Shot Calculations', () => {
  const validParams: ShotParameters = {
    launchVelocity: 50,
    launchAngle: 15,
    spin: 2500,
    ballType: 'Pro V1',
    windDirection: 'N'
  };

  const validWeather: WeatherConditions = {
    windSpeed: 10,
    airPressure: 1013,
    humidity: 60,
    temperature: 20
  };

  describe('validateShotParameters', () => {
    it('should return true for valid parameters', () => {
      expect(validateShotParameters(validParams)).toBe(true);
    });

    it('should return false for invalid launch velocity', () => {
      expect(validateShotParameters({
        ...validParams,
        launchVelocity: -1
      })).toBe(false);
    });

    it('should return false for invalid launch angle', () => {
      expect(validateShotParameters({
        ...validParams,
        launchAngle: 91
      })).toBe(false);
    });
  });

  describe('validateWeatherConditions', () => {
    it('should return true for valid weather conditions', () => {
      expect(validateWeatherConditions(validWeather)).toBe(true);
    });

    it('should return false for invalid wind speed', () => {
      expect(validateWeatherConditions({
        ...validWeather,
        windSpeed: -1
      })).toBe(false);
    });

    it('should return false for invalid air pressure', () => {
      expect(validateWeatherConditions({
        ...validWeather,
        airPressure: 800
      })).toBe(false);
    });
  });

  describe('calculateTrajectory', () => {
    it('should return trajectory points array', () => {
      const trajectory = calculateTrajectory(validParams, validWeather);
      expect(Array.isArray(trajectory)).toBe(true);
      expect(trajectory.length).toBeGreaterThan(0);
    });

    it('should start at origin', () => {
      const trajectory = calculateTrajectory(validParams, validWeather);
      expect(trajectory[0].x).toBe(0);
      expect(trajectory[0].y).toBe(0);
      expect(trajectory[0].z).toBe(0);
    });

    it('should end at ground level or below', () => {
      const trajectory = calculateTrajectory(validParams, validWeather);
      const lastPoint = trajectory[trajectory.length - 1];
      expect(lastPoint.y).toBeLessThanOrEqual(0);
    });
  });
});
