import { FC, useEffect, useRef, useState } from 'react';
import { Engine, Scene, useBeforeRender, useClick, useEngine } from 'react-babylonjs';
import { Vector3, Color3, Color4, Path3D } from '@babylonjs/core';
import { TrajectoryPoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface TrajectoryViewBabylonProps {
  data: TrajectoryPoint[];
  autoPlay?: boolean;
}

const GolfGround: FC<{ size: number }> = ({ size }) => {
  return (
    <ground
      name="ground"
      width={size * 2}
      height={size * 2}
      subdivisions={100}
      receiveShadows={true}
    >
      <standardMaterial
        name="groundMaterial"
        diffuseColor={new Color3(0.23, 0.37, 0.04)} // Golf course green
        specularColor={new Color3(0.1, 0.1, 0.1)}
        roughness={0.95}
      />
    </ground>
  );
};

const TrajectoryPath: FC<{ points: Vector3[]; progress: number }> = ({ points, progress }) => {
  const pathRef = useRef<Path3D>();
  const scene = useScene();

  useEffect(() => {
    if (points.length > 0) {
      pathRef.current = new Path3D(points);
      
      // Create particle system for trail effect
      const particleSystem = new ParticleSystem("particles", 2000, scene);
      particleSystem.particleTexture = new Texture("/ball-trail.png", scene);
      particleSystem.emitter = points[0];
      particleSystem.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
      particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0.1);
      particleSystem.color1 = new Color4(1, 0.5, 0, 1);
      particleSystem.color2 = new Color4(1, 0.5, 0, 1);
      particleSystem.colorDead = new Color4(0, 0, 0, 0);
      particleSystem.minSize = 0.1;
      particleSystem.maxSize = 0.3;
      particleSystem.minLifeTime = 0.3;
      particleSystem.maxLifeTime = 0.7;
      particleSystem.emitRate = 100;
      particleSystem.start();

      return () => {
        particleSystem.dispose();
      };
    }
  }, [points, scene]);

  return (
    <tubes
      name="trajectory"
      path={points}
      radius={0.02}
      tessellation={8}
      updatable={true}
    >
      <standardMaterial
        name="trajectoryMaterial"
        emissiveColor={new Color3(1, 0.37, 0.12)}
        disableLighting={true}
      />
    </tubes>
  );
};

export const TrajectoryViewBabylon: FC<TrajectoryViewBabylonProps> = ({ data, autoPlay = false }) => {
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'default' | 'side'>('default');
  const engineRef = useRef(null);

  const points = data.map(point => new Vector3(point.x, point.y, point.z));
  const maxDistance = data.length > 0 ? 
    Math.max(...data.map(p => Math.sqrt(p.x * p.x + p.z * p.z))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10;

  useEffect(() => {
    if (data.length > 0 && autoPlay) {
      let startTime = performance.now();
      let rafId: number | null = null;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const duration = 2000;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);

        if (newProgress < 1) {
          rafId = requestAnimationFrame(animate);
        }
      };

      rafId = requestAnimationFrame(animate);
      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [data, autoPlay]);

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
      <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
        <Scene>
          <arcRotateCamera
            name="camera"
            target={Vector3.Zero()}
            alpha={viewMode === 'default' ? Math.PI : Math.PI * 1.5}
            beta={Math.PI * 0.4}
            radius={10}
          />
          
          <hemisphericLight
            name="light1"
            intensity={0.7}
            direction={new Vector3(0, 1, 0)}
          />
          
          <directionalLight
            name="light2"
            intensity={0.5}
            direction={new Vector3(-1, -2, -1)}
            position={new Vector3(20, 40, 20)}
          >
            <shadowGenerator
              mapSize={1024}
              useBlurExponentialShadowMap={true}
              blurKernel={32}
              darkness={0.8}
              bias={0.01}
            />
          </directionalLight>

          <GolfGround size={gridSize} />
          {points.length > 0 && (
            <TrajectoryPath points={points} progress={progress} />
          )}
        </Scene>
      </Engine>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setViewMode(prev => prev === 'default' ? 'side' : 'default')}
        className="absolute bottom-4 right-4 bg-white hover:bg-gray-100"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
        {viewMode === 'default' ? 'Behind Ball View' : 'Side View'}
      </div>
    </div>
  );
};
