import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Point3D } from '@/utils/pathfinding';
import * as THREE from 'three';

interface AnimatedDroneProps {
  position: Point3D;
  color: string;
  isAnimating?: boolean;
}

const AnimatedDrone = ({ position, color, isAnimating = false }: AnimatedDroneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const propeller1Ref = useRef<THREE.Mesh>(null);
  const propeller2Ref = useRef<THREE.Mesh>(null);
  const propeller3Ref = useRef<THREE.Mesh>(null);
  const propeller4Ref = useRef<THREE.Mesh>(null);
  
  const armLength = 0.5;
  const armRadius = 0.04;
  const propellerRadius = 0.25;
  const bodySize = 0.25;

  useFrame((state) => {
    if (isAnimating) {
      // Rotate propellers when animating
      const speed = 0.5;
      if (propeller1Ref.current) propeller1Ref.current.rotation.y += speed;
      if (propeller2Ref.current) propeller2Ref.current.rotation.y += speed;
      if (propeller3Ref.current) propeller3Ref.current.rotation.y += speed;
      if (propeller4Ref.current) propeller4Ref.current.rotation.y += speed;
      
      // Slight hover animation
      if (groupRef.current) {
        groupRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position.x, position.y, position.z);
    }
  }, [position]);

  return (
    <group ref={groupRef}>
      {/* Central body */}
      <mesh>
        <boxGeometry args={[bodySize, bodySize * 0.6, bodySize]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Top cover */}
      <mesh position={[0, bodySize * 0.4, 0]}>
        <cylinderGeometry args={[bodySize * 0.7, bodySize * 0.5, 0.1, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Camera/sensor on front */}
      <mesh position={[0, -bodySize * 0.2, bodySize * 0.5]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#000000" 
          metalness={1}
          roughness={0}
        />
      </mesh>
      
      {/* Landing gear */}
      <mesh position={[bodySize * 0.4, -bodySize * 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-bodySize * 0.4, -bodySize * 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[armLength / 2, 0, armLength / 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[armRadius, armRadius, armLength, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-armLength / 2, 0, armLength / 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[armRadius, armRadius, armLength, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[armLength / 2, 0, -armLength / 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[armRadius, armRadius, armLength, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-armLength / 2, 0, -armLength / 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[armRadius, armRadius, armLength, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Motor + Propeller - Front Right */}
      <group position={[armLength, 0.15, armLength]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={propeller1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[propellerRadius, propellerRadius, 0.02, 32]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      {/* Motor + Propeller - Front Left */}
      <group position={[-armLength, 0.15, armLength]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={propeller2Ref} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[propellerRadius, propellerRadius, 0.02, 32]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      {/* Motor + Propeller - Back Right */}
      <group position={[armLength, 0.15, -armLength]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={propeller3Ref} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[propellerRadius, propellerRadius, 0.02, 32]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      {/* Motor + Propeller - Back Left */}
      <group position={[-armLength, 0.15, -armLength]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={propeller4Ref} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[propellerRadius, propellerRadius, 0.02, 32]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      {/* LED indicators */}
      <mesh position={[0, bodySize * 0.35, bodySize * 0.4]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0, bodySize * 0.35, -bodySize * 0.4]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
};

export default AnimatedDrone;
