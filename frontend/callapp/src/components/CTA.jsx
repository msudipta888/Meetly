import { motion, useScroll, useTransform } from "motion/react";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { useRef } from "react";

const benefits = [
  "No credit card required",
  "Free 14-day trial",
  "Cancel anytime",
  "24/7 Support"
];

export function CTA() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);

  return (
    <section ref={ref} className="relative py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-indigo-950/30 to-background" />
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          style={{ scale, rotateX }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 p-12 md:p-16"
        >
          {/* Animated grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000,transparent)]" />
          
          {/* Content */}
          <div className="relative z-10 space-y-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2"
            >
              <Sparkles className="size-4 text-indigo-300" />
              <span className="text-sm text-indigo-200">Limited Time Offer</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <h2 className="text-5xl md:text-6xl bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                Ready to Transform Your Meetings?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join millions of teams already using our platform to stay connected and productive.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="gap-2 bg-white text-indigo-600 hover:bg-gray-100 shadow-2xl shadow-white/20 group text-lg px-8"
              >
                Get Started Free
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm text-lg px-8"
              >
                Contact Sales
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-6 justify-center pt-8"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <div className="size-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                    <Check className="size-3 text-white" />
                  </div>
                  {benefit}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Decorative elements */}
          <motion.div
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 right-0 size-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-0 left-0 size-40 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
