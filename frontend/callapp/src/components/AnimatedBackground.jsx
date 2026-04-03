import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient Orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 70%)',
          top: '-10%',
          right: '-10%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
          bottom: '-10%',
          left: '-10%',
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Geometric Shapes */}
      <motion.div
        className="absolute w-32 h-32 border-2 border-blue-500/20"
        style={{
          top: '20%',
          left: '15%',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm" />
      </motion.div>

      <motion.div
        className="absolute w-24 h-24 rounded-full border-2 border-purple-500/20"
        style={{
          top: '60%',
          right: '20%',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: [0, 360],
          rotateZ: [0, 360],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm rounded-full" />
      </motion.div>

      <motion.div
        className="absolute w-20 h-20"
        style={{
          top: '40%',
          right: '10%',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotate: [0, 360],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-pink-500/10 to-blue-500/10 backdrop-blur-sm transform rotate-45" />
      </motion.div>

      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      />

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 3D Cubes */}
      <motion.div
        className="absolute"
        style={{
          top: '15%',
          right: '30%',
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="relative w-16 h-16" style={{ transformStyle: 'preserve-3d' }}>
          {/* Front */}
          <div 
            className="absolute w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            style={{ transform: 'translateZ(8px)' }}
          />
          {/* Back */}
          <div 
            className="absolute w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            style={{ transform: 'translateZ(-8px) rotateY(180deg)' }}
          />
          {/* Left */}
          <div 
            className="absolute w-16 h-16 bg-gradient-to-br from-pink-500/10 to-blue-500/10 border border-pink-500/20"
            style={{ transform: 'rotateY(-90deg) translateZ(8px)' }}
          />
          {/* Right */}
          <div 
            className="absolute w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            style={{ transform: 'rotateY(90deg) translateZ(8px)' }}
          />
          {/* Top */}
          <div 
            className="absolute w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            style={{ transform: 'rotateX(90deg) translateZ(8px)' }}
          />
          {/* Bottom */}
          <div 
            className="absolute w-16 h-16 bg-gradient-to-br from-pink-500/10 to-blue-500/10 border border-pink-500/20"
            style={{ transform: 'rotateX(-90deg) translateZ(8px)' }}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute"
        style={{
          bottom: '25%',
          left: '25%',
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
        animate={{
          rotateX: [360, 0],
          rotateY: [360, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="relative w-20 h-20" style={{ transformStyle: 'preserve-3d' }}>
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
            style={{ transform: 'translateZ(10px)' }}
          />
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            style={{ transform: 'translateZ(-10px) rotateY(180deg)' }}
          />
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            style={{ transform: 'rotateY(-90deg) translateZ(10px)' }}
          />
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-pink-500/10 to-cyan-500/10 border border-pink-500/20"
            style={{ transform: 'rotateY(90deg) translateZ(10px)' }}
          />
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
            style={{ transform: 'rotateX(90deg) translateZ(10px)' }}
          />
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            style={{ transform: 'rotateX(-90deg) translateZ(10px)' }}
          />
        </div>
      </motion.div>

      {/* Wireframe Sphere */}
      <motion.div
        className="absolute w-40 h-40"
        style={{
          top: '70%',
          right: '15%',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-blue-500/10" />
        <div 
          className="absolute inset-0 w-full h-full rounded-full border-2 border-purple-500/10"
          style={{ transform: 'rotateY(60deg)' }}
        />
        <div 
          className="absolute inset-0 w-full h-full rounded-full border-2 border-pink-500/10"
          style={{ transform: 'rotateY(120deg)' }}
        />
      </motion.div>
    </div>
  );
}
