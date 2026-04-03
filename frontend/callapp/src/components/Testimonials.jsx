import { motion, useScroll, useTransform } from "motion/react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Star, Quote } from "lucide-react";
import { useRef } from "react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "VP of Engineering",
    company: "TechCorp",
    content: "This platform has transformed how our distributed team collaborates. The video quality is exceptional and the interface is incredibly intuitive.",
    rating: 5,
    initials: "SC",
    gradient: "from-indigo-500 to-purple-500",
    image: "https://i.pravatar.cc/150?img=1"
  },
  {
    name: "Michael Rodriguez",
    role: "Product Manager",
    company: "StartupXYZ",
    content: "We've tried every video conferencing tool out there. This one is by far the most reliable and feature-rich. Worth every penny.",
    rating: 5,
    initials: "MR",
    gradient: "from-blue-500 to-cyan-500",
    image: "https://i.pravatar.cc/150?img=2"
  },
  {
    name: "Emma Thompson",
    role: "CEO",
    company: "DesignStudio",
    content: "The ease of use and stability make this our go-to solution for client meetings and team standups. Highly recommended!",
    rating: 5,
    initials: "ET",
    gradient: "from-purple-500 to-pink-500",
    image: "https://i.pravatar.cc/150?img=3"
  }
];

export function Testimonials() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background" />
      
      <motion.div
        style={{ y }}
        className="absolute left-1/4 top-1/2 size-[600px] rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 px-4 py-2 backdrop-blur-sm mb-6">
              <Star className="size-4 text-purple-400 fill-purple-400" />
              <span className="text-sm text-purple-300">Customer Stories</span>
            </div>
          </motion.div>
          <h2 className="text-5xl md:text-6xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Trusted by Teams Worldwide
          </h2>
          <p className="text-xl text-gray-400">
            See what our customers have to say about their experience.
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <div className="relative" style={{ perspective: "2000px" }}>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => {
              const cardRef = useRef<HTMLDivElement>(null);
              const { scrollYProgress: cardProgress } = useScroll({
                target: cardRef,
                offset: ["start end", "end start"]
              });

              const cardY = useTransform(cardProgress, [0, 0.5, 1], [100, 0, -100]);
              const cardRotateX = useTransform(cardProgress, [0, 0.5, 1], [25, 0, -25]);
              const cardRotateY = useTransform(
                cardProgress, 
                [0, 0.5, 1], 
                [index === 0 ? -15 : index === 2 ? 15 : 0, 0, index === 0 ? 15 : index === 2 ? -15 : 0]
              );

              return (
                <motion.div
                  key={index}
                  ref={cardRef}
                  initial={{ opacity: 0, y: 50, rotateX: 20 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  style={{
                    y: cardY,
                    rotateX: cardRotateX,
                    rotateY: cardRotateY,
                  }}
                  className="group"
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: index === 1 ? 0 : index === 0 ? 5 : -5,
                      z: 100,
                    }}
                    transition={{ duration: 0.4 }}
                    className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 overflow-hidden"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className="relative space-y-6" style={{ transform: "translateZ(30px)" }}>
                      {/* Quote icon with animation */}
                      <motion.div
                        whileHover={{ rotate: 180, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                        className={`size-14 rounded-xl bg-gradient-to-br ${testimonial.gradient} p-0.5 shadow-2xl`}
                      >
                        <div className="size-full rounded-xl bg-background/90 flex items-center justify-center">
                          <Quote className="size-7 text-white" />
                        </div>
                      </motion.div>

                      {/* Stars with stagger animation */}
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                              delay: index * 0.2 + i * 0.1,
                              type: "spring",
                              stiffness: 200,
                            }}
                          >
                            <Star className="size-5 fill-yellow-400 text-yellow-400" />
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Content */}
                      <p className="text-gray-300 leading-relaxed text-lg">
                        "{testimonial.content}"
                      </p>

                      {/* Author info */}
                      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`p-0.5 rounded-full bg-gradient-to-br ${testimonial.gradient}`}
                        >
                          <Avatar className="border-2 border-background size-14">
                            <AvatarFallback className={`bg-gradient-to-br ${testimonial.gradient} text-white text-lg`}>
                              {testimonial.initials}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <div>
                          <div className="text-white text-lg">{testimonial.name}</div>
                          <div className="text-sm text-gray-400">
                            {testimonial.role}
                          </div>
                          <div className="text-xs text-gray-500">
                            {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Animated corner accents */}
                    <motion.div
                      className={`absolute top-0 right-0 size-32 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                      style={{
                        background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent)"
                      }}
                      animate={{
                        x: ["-100%", "200%"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut",
                      }}
                    />

                    {/* 3D depth shadow */}
                    <div 
                      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-black/20 to-transparent -z-10"
                      style={{ transform: "translateZ(-20px)" }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
