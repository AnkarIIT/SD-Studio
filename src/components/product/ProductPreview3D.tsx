import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

function PreviewMesh() {
  return (
    <mesh rotation={[0.35, 0.6, 0]}>
      <torusKnotGeometry args={[0.52, 0.16, 120, 24]} />
      <meshStandardMaterial color="#7c3aed" metalness={0.35} roughness={0.4} />
    </mesh>
  );
}

/**
 * Phase 5: interactive orbit preview (placeholder mesh).
 * Later: load `product.modelUrl` (GLB) when present in Firestore.
 */
export default function ProductPreview3D() {
  return (
    <div className="mt-6 rounded-[2rem] overflow-hidden border border-gray-100 bg-linear-to-b from-gray-900 to-gray-800 shadow-inner">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/90">3D preview</p>
        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Drag to rotate</p>
      </div>
      <div className="h-[260px] sm:h-[300px] w-full touch-none">
        <Canvas camera={{ position: [0, 0.2, 3.2], fov: 42 }} dpr={[1, 2]}>
          <color attach="background" args={['#111827']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 6]} intensity={1.1} />
          <Suspense fallback={null}>
            <PreviewMesh />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
        </Canvas>
      </div>
    </div>
  );
}
