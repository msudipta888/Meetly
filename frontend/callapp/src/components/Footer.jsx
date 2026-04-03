import { motion } from "motion/react";
import { Video, Twitter, Github, Linkedin, Instagram, Mail, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const footerLinks = {
  Product: ["Features", "Pricing", "Security", "Roadmap", "Downloads", "Integrations"],
  Company: ["About", "Blog", "Careers", "Contact", "Press Kit", "Partners"],
  Resources: ["Documentation", "API Reference", "Community", "Support", "Status", "Release Notes"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "Licenses", "GDPR", "Compliance"]
};

const socialLinks = [
  { Icon: Twitter, href: "#", label: "Twitter", gradient: "from-blue-400 to-cyan-400" },
  { Icon: Github, href: "#", label: "GitHub", gradient: "from-gray-400 to-gray-600" },
  { Icon: Linkedin, href: "#", label: "LinkedIn", gradient: "from-blue-600 to-blue-800" },
  { Icon: Instagram, href: "#", label: "Instagram", gradient: "from-pink-500 to-purple-500" },
];

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-background via-indigo-950/10 to-black border-t border-white/10 overflow-hidden" id="contact">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-1/4 size-96 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 right-1/4 size-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
      />

      <div className="relative">
        {/* Newsletter section */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-8 lg:grid-cols-2 items-center"
            >
              <div className="space-y-4">
                <h3 className="text-3xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Stay Updated
                </h3>
                <p className="text-gray-400 text-lg">
                  Get the latest updates on new features, tips, and exclusive offers.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-gray-500 rounded-xl"
                  />
                </div>
                <Button 
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 group px-8 rounded-xl"
                >
                  Subscribe
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Brand section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                  <Video className="size-7 text-white" />
                </div>
                <span className="text-2xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  VideoConnect
                </span>
              </motion.div>
              
              <p className="text-gray-400 leading-relaxed max-w-sm">
                Connecting teams worldwide with seamless video communication. 
                Experience the future of remote collaboration.
              </p>

              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.Icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative"
                      aria-label={social.label}
                    >
                      <div className={`size-12 rounded-xl bg-gradient-to-br ${social.gradient} p-0.5`}>
                        <div className="size-full rounded-xl bg-background/90 flex items-center justify-center group-hover:bg-background/50 transition-colors">
                          <Icon className="size-5 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${social.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity`} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Links sections */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h4 className="text-white mb-6 text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text ">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link, linkIndex) => (
                    <motion.li
                      key={link}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: categoryIndex * 0.1 + linkIndex * 0.05 }}
                    >
                      <a 
                        href="#" 
                        className="group text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link}
                        </span>
                        <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400"
            >
              <p>&copy; 2025 VideoConnect. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
