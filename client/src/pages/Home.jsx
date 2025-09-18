import React, { useState, useEffect } from "react";
import state from "../store";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Play,
  Wand2,
  Scissors,
  Share2,
  Download,
  Users,
  Mail,
  Phone,
  MapPin,
  Sun,
  Moon,
} from "lucide-react";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { scrollYProgress } = useScroll();
  
  // Only transform scale and y position, not opacity to prevent flickering
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const yTransform = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  // Mock Canvas component for demo
  const Canvas = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 animate-pulse"></div>
        <p className="text-white/80">3D Canvas Placeholder</p>
      </div>
    </div>
  );

  useEffect(() => {
    const updateScrollY = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", updateScrollY);
    return () => window.removeEventListener("scroll", updateScrollY);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const NavBar = () => (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50
          ? isDarkMode 
            ? "bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-blue-500/20"
            : "bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200"
          : isDarkMode
            ? "bg-gray-900/80 backdrop-blur-sm"
            : "bg-white/80 backdrop-blur-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              FashionAI
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}
            >
              Contact
            </button>

            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            <motion.button
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (state.page = "customizer")}
            >
              Customize It
            </motion.button>

            <motion.button
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          <button
            className={`md:hidden ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`md:hidden ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-t ${isDarkMode ? 'border-blue-500/20' : 'border-gray-200'}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => scrollToSection("features")}
                className={`block ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className={`block ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`block ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}
              >
                Contact
              </button>

              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-full font-medium"
                onClick={() => (state.page = "customizer")}
              >
                Customize It
              </button>

              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-full font-medium">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );

  const HeroSection = () => (
    <section className={`relative min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-500`}>
      {/* 3D Canvas as background - NO OPACITY TRANSFORM to prevent flickering */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale, y: yTransform }} // Only transform scale and position
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Canvas />
      </motion.div>

      {/* Overlay content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode 
            ? 'bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400' 
            : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600'
          } bg-clip-text text-transparent transition-all duration-500`}
          {...fadeInUp}
        >
          Design Your Style in 3D
        </motion.h1>

        <motion.p
          className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-8 transition-colors duration-500`}
          {...fadeInUp}
          transition={{ delay: 0.2 }}
        >
          Bring your fashion ideas to life with interactive 3D customization.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full font-medium text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            Watch Demo
          </button>
          <button
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-full font-medium text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
            onClick={() => (state.page = "customizer")}
          >
            <Sparkles className="w-5 h-5" />
            Customize It
          </button>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`} />
      </motion.div>
    </section>
  );

  const Features = () => (
    <section id="features" className={`py-24 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          className={`text-4xl font-bold text-center mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}
          {...fadeInUp}
        >
          Powerful Features
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            {
              icon: <Wand2 className="w-8 h-8 text-blue-400" />,
              title: "AI-Powered Design",
              desc: "Generate unique fashion styles with advanced AI algorithms.",
            },
            {
              icon: <Scissors className="w-8 h-8 text-pink-400" />,
              title: "3D Customization",
              desc: "Visualize your designs in 3D with interactive customization tools.",
            },
            {
              icon: <Share2 className="w-8 h-8 text-green-400" />,
              title: "Instant Sharing",
              desc: "Share your creations instantly on social media platforms.",
            },
            {
              icon: <Download className="w-8 h-8 text-purple-400" />,
              title: "Easy Export",
              desc: "Download your designs in multiple formats for production.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className={`${isDarkMode 
                ? 'bg-gray-900/60 hover:bg-gray-900/90 border-gray-700' 
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              } rounded-2xl p-8 transition-all border`}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 transition-colors duration-500`}>
                {feature.title}
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );

  const Testimonials = () => (
    <section id="testimonials" className={`py-24 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          className={`text-4xl font-bold text-center mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}
          {...fadeInUp}
        >
          What Our Users Say
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            {
              name: "Emily Chen",
              role: "Fashion Designer",
              quote:
                "FashionAI transformed how I approach design. The AI suggestions are incredible!",
            },
            {
              name: "David Miller",
              role: "Boutique Owner",
              quote:
                "My customers love the custom options. This platform has boosted my business significantly.",
            },
            {
              name: "Sofia Rodriguez",
              role: "Student",
              quote:
                "I always dreamed of designing clothes. Now I can create professional-looking designs easily!",
            },
          ].map((t, idx) => (
            <motion.div
              key={idx}
              className={`${isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700/80 border-gray-700' 
                : 'bg-white hover:bg-gray-50 border-gray-200'
              } rounded-2xl p-8 transition-all border`}
              variants={fadeInUp}
            >
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-blue-400 mr-3" />
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>
                    {t.name}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm transition-colors duration-500`}>{t.role}</p>
                </div>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} italic transition-colors duration-500`}>"{t.quote}"</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );

  const CTA = () => (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <motion.h2 className="text-4xl font-bold mb-6" {...fadeInUp}>
          Ready to Design Your Future Fashion?
        </motion.h2>
        <motion.p
          className="text-xl mb-8 text-blue-100"
          {...fadeInUp}
          transition={{ delay: 0.2 }}
        >
          Join thousands of creators already using FashionAI to revolutionize
          their style.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <button
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-medium text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            onClick={() => console.log('Navigate to customizer')}
          >
            <Sparkles className="w-5 h-5" />
            3D World
          </button>
          <button className="bg-gray-900/40 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-900/60 transition-all flex items-center justify-center gap-2 border border-white/20">
            <ArrowRight className="w-5 h-5" />
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer
      id="contact"
      className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} py-12 border-t transition-colors duration-500`}
    >
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}>FashionAI</span>
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>
            Revolutionizing fashion design with the power of artificial
            intelligence.
          </p>
        </div>

        <div>
          <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold mb-4 transition-colors duration-500`}>Quick Links</h3>
          <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>
            <li>
              <button
                onClick={() => scrollToSection("features")}
                className={`${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors`}
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("testimonials")}
                className={`${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors`}
              >
                Reviews
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contact")}
                className={`${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'} transition-colors`}
              >
                Contact
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold mb-4 transition-colors duration-500`}>Contact Us</h3>
          <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> support@fashionai.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> +1 (555) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> New York, NY
            </li>
          </ul>
        </div>
      </div>
      <div className={`mt-12 border-t ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-600'} pt-8 text-center transition-colors duration-500`}>
        © 2025 FashionAI. All rights reserved.
      </div>
    </footer>
  );

  return (
    <div className="w-full overflow-x-hidden overflow-y-auto">
      <NavBar />
      <HeroSection />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;