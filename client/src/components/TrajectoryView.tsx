import { FC, useEffect, useRef, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { 
  Vector3, 
  Color3, 
  Color4,
  ParticleSystem,
  Texture,
  StandardMaterial,
  MeshBuilder
} from '@babylonjs/core';
import { TrajectoryPoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, Maximize2 } from 'lucide-react';

interface TrajectoryViewProps {
  data: TrajectoryPoint[];
  autoPlay?: boolean;
}

const GROUND_MATERIAL_OPTIONS = {
  diffuseColor: new Color3(0.23, 0.37, 0.04), // Golf course green
  specularColor: new Color3(0.1, 0.1, 0.1),
  roughness: 0.95,
  metallic: 0.05
};

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
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
        {...GROUND_MATERIAL_OPTIONS}
      />
    </ground>
  );
};

const TrajectoryPath: FC<{ 
  points: Vector3[]; 
  scene: any;
  progress: number;
}> = ({ points, scene, progress }) => {
  const particleSystemRef = useRef<ParticleSystem>();

  useEffect(() => {
    if (!scene || points.length === 0) return;

    // Create particle system for trail effect
    const particleSystem = new ParticleSystem("particles", 2000, scene);
    particleSystemRef.current = particleSystem;

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
  }, [scene, points]);

  // Update particle system emitter position based on progress
  useEffect(() => {
    if (!particleSystemRef.current || points.length === 0) return;
    
    const currentPointIndex = Math.floor((points.length - 1) * progress);
    const currentPoint = points[currentPointIndex];
    particleSystemRef.current.emitter = currentPoint;
  }, [progress, points]);

  return (
    <mesh name="trajectory">
      <linesBuilder
        name="trajectoryLines"
        points={points.slice(0, Math.floor(points.length * progress))}
        updatable={true}
      />
      <standardMaterial
        name="trajectoryMaterial"
        diffuseColor={new Color3(1, 0.37, 0.12)}
        emissiveColor={new Color3(1, 0.37, 0.12)}
        specularColor={new Color3(0, 0, 0)}
      />
    </mesh>
  );
};

export const TrajectoryView: FC<TrajectoryViewProps> = ({ data, autoPlay = false }) => {
  const [viewMode, setViewMode] = useState<'default' | 'side' | 'top'>('default');
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const points = data.map(point => new Vector3(point.x, point.y, point.z));
  const maxDistance = data.length > 0 ? 
    Math.max(...data.map(p => Math.sqrt(p.x * p.x + p.z * p.z))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10;

  useEffect(() => {
    if (data.length > 0 && autoPlay) {
      setProgress(0);
      let startTime = performance.now();
      let rafId: number | null = null;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const duration = 2000; // 2 seconds animation
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (hasError) {
    return (
      <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
        <p className="text-red-500">Failed to initialize 3D view. Please refresh the page.</p>
      </div>
    );
  }

  const cameraPositions = {
    default: { alpha: Math.PI, beta: Math.PI * 0.4 },
    side: { alpha: Math.PI * 1.5, beta: Math.PI * 0.4 },
    top: { alpha: Math.PI, beta: 0.1 }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${isFullscreen ? 'w-screen h-screen' : 'w-full h-[600px]'} bg-white rounded-lg shadow-sm overflow-hidden`}
    >
      <Engine 
        antialias 
        adaptToDeviceRatio 
        canvasId="babylonJS"
        engineOptions={{
          preserveDrawingBuffer: true,
          stencil: true,
          failIfMajorPerformanceCaveat: true
        }}
        onError={() => setHasError(true)}
      >
        <Scene>
          <arcRotateCamera
            name="camera"
            target={Vector3.Zero()}
            alpha={cameraPositions[viewMode].alpha}
            beta={cameraPositions[viewMode].beta}
            radius={gridSize * 0.8}
            lowerRadiusLimit={gridSize * 0.3}
            upperRadiusLimit={gridSize * 2}
            wheelDeltaPercentage={0.01}
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
            position={new Vector3(gridSize, gridSize * 2, gridSize)}
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
            <TrajectoryPath 
              points={points} 
              scene={scene} 
              progress={progress}
            />
          )}
        </Scene>
      </Engine>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-white hover:bg-gray-100"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode(prev => {
            const modes: ('default' | 'side' | 'top')[] = ['default', 'side', 'top'];
            const currentIndex = modes.indexOf(prev);
            return modes[(currentIndex + 1) % modes.length];
          })}
          className="bg-white hover:bg-gray-100"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
        {viewMode === 'default' ? 'Behind Ball View' : viewMode === 'side' ? 'Side View' : 'Top View'}
      </div>
    </div>
  );
};
