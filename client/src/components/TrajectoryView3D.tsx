import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { TrajectoryPoint } from '@/types';
import { useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Play, Pause, Eye } from 'lucide-react';

interface TrajectoryView3DProps {
  data: TrajectoryPoint[];
}

function TrajectoryPath({ points, progress = 1 }: { points: number[][], progress?: number }) {
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const visiblePoints = points.slice(0, Math.floor(points.length * progress));
    const vertices = new Float32Array(visiblePoints.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }, [points, progress]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={Math.floor(points.length * progress)}
          array={new Float32Array(points.slice(0, Math.floor(points.length * progress)).flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#D92429" linewidth={4} />
    </line>
  );
}

// Ground grid component with darker color
function Ground({ size }: { size: number }) {
  return (
    <group position={[size / 2, 0, 0]}>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 2, size * 2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Grid lines */}
      <gridHelper 
        args={[size * 2, 20, '#333333', '#2a2a2a']}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

export function TrajectoryView3D({ data }: TrajectoryView3DProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(1);
  const [viewMode, setViewMode] = useState<'side' | 'top'>('side');

  const points = useMemo(() => {
    return data.map(point => [point.x, point.y, point.z]);
  }, [data]);

  // Convert distances to yards for display
  const metersToYards = (meters: number) => meters * 1.09361;
  const maxDistance = data.length > 0 ? metersToYards(Math.max(...data.map(p => p.carry))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10;

  // Animation handling
  const animate = useCallback(() => {
    if (!isPlaying) return;

    setProgress(prev => {
      if (prev >= 1) {
        setIsPlaying(false);
        return 1;
      }
      return prev + 0.02;
    });

    requestAnimationFrame(animate);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      setProgress(0);
      setIsPlaying(true);
      requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  };

  // Calculate camera positions based on trajectory
  const cameraPositions = useMemo(() => {
    if (data.length === 0) return { side: [20, 20, 20], top: [20, 50, 0] };

    const maxX = Math.max(...data.map(p => p.x));
    const maxY = Math.max(...data.map(p => p.y));
    const maxZ = Math.max(...data.map(p => Math.abs(p.z)));

    return {
      side: [maxX * 0.7, maxY * 1.5, maxZ * 2],
      top: [maxX * 0.5, maxX * 0.8, 0]
    };
  }, [data]);

  return (
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={viewMode === 'side' ? cameraPositions.side : cameraPositions.top}
          fov={60}
          rotation={viewMode === 'top' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Ground with darker color */}
        <Ground size={gridSize} />

        {/* Trajectory path */}
        {points.length > 0 && <TrajectoryPath points={points} progress={progress} />}
      </Canvas>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode(prev => prev === 'side' ? 'top' : 'side')}
          className="bg-white hover:bg-gray-100"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlayPause}
          className="bg-white hover:bg-gray-100"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* View mode indicator */}
      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
        {viewMode === 'side' ? 'Side View' : 'Top View'}
      </div>
    </div>
  );
}