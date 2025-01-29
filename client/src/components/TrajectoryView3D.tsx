import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { TrajectoryPoint } from '@/types';
import { useMemo, useState, useEffect, useCallback } from 'react';
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
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }, [points, progress]);

  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry}>
        <bufferAttribute
          attach="attributes-position"
          count={Math.floor(points.length * progress)}
          array={lineGeometry.attributes.position.array}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#D92429" linewidth={6} />
    </line>
  );
}

function Ground({ size }: { size: number }) {
  return (
    <group position={[size / 2, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 2, size * 2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <gridHelper 
        args={[size * 2, 20, '#333333', '#2a2a2a']}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

export function TrajectoryView3D({ data, autoPlay = false }: TrajectoryView3DProps) {
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'side' | 'top'>('side');

  const points = useMemo(() => {
    return data.map(point => [point.x, point.y, point.z]);
  }, [data]);

  const metersToYards = (meters: number) => meters * 1.09361;
  const maxDistance = data.length > 0 ? metersToYards(Math.max(...data.map(p => p.carry))) : 0;
  const gridSize = Math.ceil(maxDistance / 10) * 10;

  const animate = useCallback(() => {
    setProgress(prev => {
      if (prev >= 1) return 1;
      return prev + 0.02;
    });
  }, []);

  // Auto-start animation when data changes or autoPlay is true
  useEffect(() => {
    if (data.length > 0 && autoPlay) {
      setProgress(0);
      const interval = setInterval(() => {
        animate();
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [data, autoPlay, animate]);

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
    <div className="relative w-full h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={viewMode === 'side' ? cameraPositions.side : cameraPositions.top}
          fov={60}
          rotation={viewMode === 'top' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Ground size={gridSize} />
        {points.length > 0 && (
          <TrajectoryPath points={points} progress={progress} />
        )}
      </Canvas>

      {/* View mode toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setViewMode(prev => prev === 'side' ? 'top' : 'side')}
        className="absolute bottom-4 right-4 bg-white hover:bg-gray-100"
      >
        <Eye className="h-4 w-4" />
      </Button>

      {/* View mode indicator */}
      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
        {viewMode === 'side' ? 'Side View' : 'Top View'}
      </div>
    </div>
  );
}