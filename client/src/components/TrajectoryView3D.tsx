import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { TrajectoryPoint } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface TrajectoryView3DProps {
  data: TrajectoryPoint[];
  autoPlay?: boolean;
}

function TrajectoryPath({ points, progress = 1 }: { points: number[][], progress?: number }) {
  const lineGeometry = useMemo(() => {
    const visiblePoints = points.slice(0, Math.floor(points.length * progress));
    const vertices = new Float32Array(visiblePoints.flat());
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [points, progress]);

  return (
    <line>
      <primitive object={lineGeometry} />
      <lineBasicMaterial attach="material" color="#FF5F1F" linewidth={12} />
    </line>
  );
}

function Ground({ size }: { size: number }) {
  return (
    <group position={[size / 2, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 2, size * 2]} />
        <meshStandardMaterial color="#3A5F0B" />
      </mesh>
    </group>
  );
}

export function TrajectoryView3D({ data, autoPlay = false }: TrajectoryView3DProps) {
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'default' | 'side'>('default');

  const points = useMemo(() => {
    return data.map(point => [point.x, point.y, point.z]);
  }, [data]);

  const metersToYards = (meters: number) => meters * 1.09361;
  const maxDistance = data.length > 0 ? metersToYards(Math.max(...data.map(p => p.carry))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10;

  useEffect(() => {
    if (data.length > 0) {
      // Reset progress when new data arrives or view changes
      setProgress(0);

      let animationFrame: number;
      let startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const duration = 7000; // 7 seconds for full animation

        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);

        if (newProgress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [data, viewMode]); // Re-run on data or view changes

  // Calculate camera positions and rotations based on trajectory
  const cameraSettings = useMemo(() => {
    if (data.length === 0) {
      return {
        default: {
          position: [-2, 1.8, -2.4],
          rotation: [0, Math.PI / 2, 0]
        },
        side: {
          position: [0, 3, -8],
          rotation: [0, Math.PI / 2, 0]
        }
      };
    }

    const maxX = Math.max(...data.map(p => p.x));
    const maxY = Math.max(...data.map(p => p.y));
    const maxZ = Math.max(...data.map(p => Math.abs(p.z)));
    const distance = Math.sqrt(maxX * maxX + maxZ * maxZ);

    return {
      side: {
        position: [-distance * 0.3, 1.8, -2.4], // Position at ~6ft height, 8ft behind
        rotation: [0, Math.PI / 2, 0] // Look along the X axis
      },
      top: {
        position: [maxX * 0.5, distance * 0.8, 0], // Position above, centered on path
        rotation: [-Math.PI / 2, 0, 0] // Look straight down
      }
    };
  }, [data]);

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={cameraSettings[viewMode].position}
          rotation={cameraSettings[viewMode].rotation}
          fov={60}
          near={0.1}
          far={1000}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Ground size={gridSize} />
        {points.length > 0 && (
          <TrajectoryPath points={points} progress={progress} />
        )}
      </Canvas>

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
}