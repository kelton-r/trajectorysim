import { FC, useEffect, useRef, useState, useMemo } from 'react';
import { Engine, Scene, SceneEventArgs } from 'react-babylonjs';
import { 
  Vector3, 
  Color3, 
  Color4,
  ParticleSystem,
  Texture,
  StandardMaterial,
  MeshBuilder,
  Scene as BabylonScene,
  Engine as BabylonEngine,
  BackgroundMaterial,
  HemisphericLight,
  Space,
  ArcRotateCamera as BabylonArcRotateCamera
} from '@babylonjs/core';
import { TrajectoryPoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, Maximize2 } from 'lucide-react';

// Constants for trajectory visualization
const TEE_HEIGHT = 0.05; // 5cm off the ground for mat height
const MAT_SIZE = { width: 1.5, length: 1.5 }; // Standard golf mat size in meters

// Scene constants
const RANGE_SIZE = { length: 366, width: 45.72 }; // 400 yards length, 50 yards width in meters
const CEILING_HEIGHT = 12; // 12 meters high ceiling (about 40 feet)
const WALL_HEIGHT = 10; // 10 meters wall height
const WALL_THICKNESS = 1; // 1 meter thick walls
const FLOOR_TILE_SIZE = 3; // 3 meters per floor tile

interface DrivingRangeProps {
  size: {
    width: number;
    length: number;
  };
}

// Position the mat and starting point closer to the back
const MAT_OFFSET_Z = -(RANGE_SIZE.length * 0.45); // 45% from the back wall
const START_OFFSET = new Vector3(0, TEE_HEIGHT, MAT_OFFSET_Z);

// Eye-level camera settings
const CAMERA_SETTINGS = {
  alpha: Math.PI, // Fixed behind-ball view
  beta: Math.PI * 0.5, // Eye-level angle (90 degrees)
  radius: RANGE_SIZE.length * 0.15, // Closer to the action
  target: new Vector3(0, 2, MAT_OFFSET_Z + 10) // Look at ball height
};

interface TrajectoryViewProps {
  data: TrajectoryPoint[];
  autoPlay?: boolean;
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const DrivingRange: FC<{ size: { width: number, length: number } }> = ({ size }) => {
  return (
    <>
      {/* Indoor lighting */}
      <hemisphericLight 
        name="ambientLight" 
        intensity={0.7}
        direction={new Vector3(0, -1, 0)}
      />
      <pointLight
        name="mainLight"
        position={new Vector3(0, CEILING_HEIGHT - 1, 0)}
        intensity={0.8}
      />

      {/* Indoor floor plane */}
      <ground
        name="rangeGround"
        width={size.width}
        height={size.length}
        subdivisions={Math.max(size.width, size.length) / FLOOR_TILE_SIZE}
        receiveShadows={true}
      >
        <standardMaterial
          name="indoorFloorMaterial"
          diffuseColor={new Color3(0.2, 0.2, 0.2)}
          specularColor={new Color3(0.1, 0.1, 0.1)}
          roughness={0.8}
        />
      </ground>

      {/* Hitting mat */}
      <box
        name="hittingMat"
        width={MAT_SIZE.width}
        height={0.05}
        depth={MAT_SIZE.length}
        position={new Vector3(0, TEE_HEIGHT / 2, MAT_OFFSET_Z)}
      >
        <standardMaterial
          name="matMaterial"
          diffuseColor={new Color3(0.2, 0.2, 0.2)}
          specularColor={new Color3(0.1, 0.1, 0.1)}
        />
      </box>

      {/* Back wall */}
      <box
        name="backWall"
        width={size.width}
        height={WALL_HEIGHT}
        depth={WALL_THICKNESS}
        position={new Vector3(0, WALL_HEIGHT/2, size.length/2)}
      >
        <standardMaterial
          name="wallMaterial"
          diffuseColor={new Color3(0.8, 0.8, 0.8)}
        />
      </box>

      {/* Front wall */}
      <box
        name="frontWall"
        width={size.width}
        height={WALL_HEIGHT}
        depth={WALL_THICKNESS}
        position={new Vector3(0, WALL_HEIGHT/2, -size.length/2)}
      >
        <standardMaterial
          name="wallMaterial"
          diffuseColor={new Color3(0.8, 0.8, 0.8)}
        />
      </box>

      {/* Left wall */}
      <box
        name="leftWall"
        width={WALL_THICKNESS}
        height={WALL_HEIGHT}
        depth={size.length}
        position={new Vector3(-size.width/2, WALL_HEIGHT/2, 0)}
      >
        <standardMaterial
          name="wallMaterial"
          diffuseColor={new Color3(0.8, 0.8, 0.8)}
        />
      </box>

      {/* Right wall */}
      <box
        name="rightWall"
        width={WALL_THICKNESS}
        height={WALL_HEIGHT}
        depth={size.length}
        position={new Vector3(size.width/2, WALL_HEIGHT/2, 0)}
      >
        <standardMaterial
          name="wallMaterial"
          diffuseColor={new Color3(0.8, 0.8, 0.8)}
        />
      </box>

      {/* Ceiling */}
      <box
        name="ceiling"
        width={size.width}
        height={WALL_THICKNESS}
        depth={size.length}
        position={new Vector3(0, CEILING_HEIGHT, 0)}
      >
        <standardMaterial
          name="ceilingMaterial"
          diffuseColor={new Color3(0.9, 0.9, 0.9)}
          specularColor={new Color3(0.1, 0.1, 0.1)}
        />
      </box>

      {/* Add LED strips along ceiling */}
      <box
        name="ledStrips"
        width={size.width * 0.8}
        height={0.2}
        depth={size.length * 0.8}
        position={new Vector3(0, CEILING_HEIGHT - 0.2, 0)}
      >
        <standardMaterial
          name="ledMaterial"
          emissiveColor={new Color3(0.9, 0.9, 0.9)}
          specularColor={new Color3(0, 0, 0)}
        />
      </box>
    </>
  );
};

const TrajectoryPath: FC<{ 
  points: Vector3[]; 
  scene: BabylonScene;
  progress: number;
}> = ({ points, scene, progress }) => {
  const particleSystemRef = useRef<ParticleSystem>();
  const meshRef = useRef<any>();
  const textureRef = useRef<Texture>();

  // Adjust points to start from mat height
  const adjustedPoints = useMemo(() => {
    if (points.length === 0) return [];
    return points.map(point => point.add(START_OFFSET));
  }, [points]);

  // Cleanup function
  const cleanup = () => {
    if (textureRef.current) {
      textureRef.current.dispose();
    }
    if (particleSystemRef.current) {
      particleSystemRef.current.dispose();
    }
    if (meshRef.current) {
      meshRef.current.dispose();
    }
  };

  useEffect(() => {
    if (!scene || adjustedPoints.length === 0) return;

    try {
      // Create particle system for ball trail
      const particleSystem = new ParticleSystem("particles", 2000, scene);
      particleSystemRef.current = particleSystem;

      const texture = new Texture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=", scene);
      textureRef.current = texture;

      particleSystem.particleTexture = texture;
      particleSystem.emitter = adjustedPoints[0];
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

      return cleanup;
    } catch (error) {
      console.error('Error initializing particle system:', error);
      cleanup();
    }
  }, [scene, adjustedPoints]);

  useEffect(() => {
    if (!scene || adjustedPoints.length === 0 || !particleSystemRef.current) return;

    try {
      const currentPointIndex = Math.floor((adjustedPoints.length - 1) * progress);
      const currentPoint = adjustedPoints[currentPointIndex];
      particleSystemRef.current.emitter = currentPoint;

      // Update trajectory line
      const visiblePoints = adjustedPoints.slice(0, currentPointIndex + 1);
      if (meshRef.current) {
        meshRef.current.dispose();
      }

      const lines = MeshBuilder.CreateLines("lines", {
        points: visiblePoints,
        updatable: true
      }, scene);

      const material = new StandardMaterial("lineMaterial", scene);
      material.emissiveColor = new Color3(1, 0.37, 0.12);
      material.specularColor = new Color3(0, 0, 0);
      lines.material = material;

      meshRef.current = lines;
    } catch (error) {
      console.error('Error updating trajectory:', error);
      cleanup();
    }
  }, [progress, adjustedPoints, scene]);

  return null;
};

export const TrajectoryView: FC<TrajectoryViewProps> = ({ data, autoPlay = false }) => {
  // Remove view mode state as we're using fixed camera
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BabylonScene>();
  const engineRef = useRef<BabylonEngine>();
  const cameraRef = useRef<BabylonArcRotateCamera>();

  const points = data.map(point => new Vector3(point.x, point.y, point.z));
  const maxDistance = data.length > 0 ? 
    Math.max(...data.map(p => Math.sqrt(p.x * p.x + p.z * p.z))) : 0;
  const gridSize = Math.max(RANGE_SIZE.length, Math.ceil(maxDistance / 10) * 10);

  // Animation effect
  useEffect(() => {
    if (data.length > 0 && autoPlay) {
      setProgress(0);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSceneMount = (sceneEventArgs: SceneEventArgs) => {
    const { scene } = sceneEventArgs;
    sceneRef.current = scene;

    const camera = scene.cameras[0] as BabylonArcRotateCamera;
    if (camera) {
      cameraRef.current = camera;
    }
  };

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
        <p className="text-red-500">Failed to initialize 3D view. Please refresh the page.</p>
      </div>
    );
  }


  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;

    // Fixed behind-ball camera settings
    camera.inputs.clear();
    camera.alpha = CAMERA_SETTINGS.alpha; 
    camera.beta = CAMERA_SETTINGS.beta; 
    camera.radius = CAMERA_SETTINGS.radius; 
    camera.setTarget(CAMERA_SETTINGS.target);

    // Lock camera
    camera.lowerBetaLimit = camera.beta;
    camera.upperBetaLimit = camera.beta;
    camera.lowerAlphaLimit = camera.alpha;
    camera.upperAlphaLimit = camera.alpha;

    // Disable all camera controls
    camera.allowUpsideDown = false;
    camera.useAutoRotationBehavior = false;
    camera.useBouncingBehavior = false;
    camera.pinchPrecision = 0;
    camera.wheelPrecision = 0;
    camera.panningSensibility = 0;
  }, []);

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
          failIfMajorPerformanceCaveat: false,
          powerPreference: 'high-performance',
          premultipliedAlpha: false,
          alpha: true
        }}
        onError={(error) => {
          console.error('Babylon.js engine error:', error);
          setHasError(true);
        }}
      >
        <Scene onSceneMount={handleSceneMount}>
          <arcRotateCamera
            name="camera"
            target={CAMERA_SETTINGS.target}
            alpha={CAMERA_SETTINGS.alpha}
            beta={CAMERA_SETTINGS.beta}
            radius={CAMERA_SETTINGS.radius}
            lowerBetaLimit={CAMERA_SETTINGS.beta}
            upperBetaLimit={CAMERA_SETTINGS.beta}
            lowerAlphaLimit={CAMERA_SETTINGS.alpha}
            upperAlphaLimit={CAMERA_SETTINGS.alpha}
          />

          <DrivingRange size={gridSize} />

          {points.length > 0 && sceneRef.current && (
            <TrajectoryPath 
              points={points} 
              scene={sceneRef.current} 
              progress={progress}
            />
          )}
        </Scene>
      </Engine>

      {/* Controls */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-white hover:bg-gray-100"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
        Eye Level View
      </div>
    </div>
  );
};