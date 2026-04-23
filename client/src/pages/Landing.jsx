import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Briefcase, Shield, Globe, TrendingUp } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

/**
 * Landing Page
 * Hero section with animated tagline cycle
 * Call-to-action buttons
 * How It Works section
 * Niches showcase
 */
export const Landing = () => {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { openModal } = useAuth();

  const taglines = [
    "Connect with creative talent worldwide",
    "Collaborate with video editors & designers",
    "Scale your creative projects instantly",
    "Find the perfect creators for your brand",
  ];

  // Cycle taglines every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Creator Network",
      description: "Access thousands of verified creators across multiple niches",
    },
    {
      icon: Briefcase,
      title: "Talent Marketplace",
      description: "Find skilled editors and designers ready for your next project",
    },
    {
      icon: Zap,
      title: "Quick Connections",
      description: "Request collaboration in seconds, not hours",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Trust-based connections with verified profiles",
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with creators from around the world",
    },
    {
      icon: TrendingUp,
      title: "Grow Together",
      description: "Build long-term partnerships and expand your reach",
    },
  ];

  const niches = [
    "Gaming",
    "Vlogging",
    "Fitness",
    "Beauty & Makeup",
    "Fashion",
    "Cooking",
    "Technology",
    "Travel",
    "Music",
    "Comedy",
    "Education",
    "Business",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  // Floating Logos Component
  const FloatingLogos = () => {
    const logos = [
      {
        id: 1,
        name: 'Instagram',
        svg: (
          <>
            <svg width="0" height="0">
              <linearGradient id="instagramGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FD5949" />
                <stop offset="45%" stopColor="#D6249F" />
                <stop offset="60%" stopColor="#285AEB" />
              </linearGradient>
            </svg>
            <FaInstagram size={64} style={{ fill: 'url(#instagramGrad)' }} />
          </>
        ),
        top: '8%',
        left: '3%',
        size: '64px',
      },
      {
        id: 2,
        name: 'Facebook',
        svg: <FaFacebook size={56} color="#1877F2" />,
        top: '18%',
        left: '87%',
        size: '56px',
      },
      {
        id: 3,
        name: 'YouTube',
        svg: <FaYoutube size={72} color="#FF0000" />,
        top: '42%',
        left: '2%',
        size: '72px',
      },
      {
        id: 4,
        name: 'LinkedIn',
        svg: <FaLinkedin size={60} color="#0A66C2" />,
        top: '62%',
        left: '84%',
        size: '60px',
      },
      {
        id: 5,
        name: 'Twitter',
        svg: <FaXTwitter size={68} color="currentColor" />,
        top: '22%',
        left: '76%',
        size: '68px',
      },
      {
        id: 6,
        name: 'Instagram2',
        svg: <FaInstagram size={64} style={{ fill: 'url(#instagramGrad)' }} />,
        top: '52%',
        left: '4%',
        size: '64px',
      },
      {
        id: 7,
        name: 'YouTube2',
        svg: <FaYoutube size={72} color="#FF0000" />,
        top: '72%',
        left: '68%',
        size: '72px',
      },
      {
        id: 8,
        name: 'LinkedIn2',
        svg: <FaLinkedin size={60} color="#0A66C2" />,
        top: '32%',
        left: '81%',
        size: '60px',
      },
      {
        id: 9,
        name: 'Facebook2',
        svg: <FaFacebook size={56} color="#1877F2" />,
        top: '78%',
        left: '14%',
        size: '56px',
      },
    ];

    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {logos.map((logo, idx) => (
          <motion.div
            key={logo.id}
            style={{
              position: 'absolute',
              top: logo.top,
              left: logo.left,
              width: logo.size,
              height: logo.size,
              color: logo.name === 'Twitter' ? 'var(--text)' : 'inherit',
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 5 + (idx % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: idx * 0.3,
            }}
          >
            {logo.svg}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Navigation */}
      <Navbar onNotificationClick={() => setNotificationOpen(true)} />

      <main className="flex-1" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {/* HERO SECTION */}
        <section className="relative" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '1rem', zIndex: 1 }}>
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -30, 0], x: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"
            />
          </div>

          {/* Floating social logos - hero only */}
          <FloatingLogos />

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-4xl mx-auto text-center"
          >
            {/* Main Tagline */}
            <motion.h1
              className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="block">The Marketplace for</span>
              <motion.div
                key={currentTagline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
              >
                {taglines[currentTagline]}
              </motion.div>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
            >
              Connect with talented content creators, video editors, and graphic designers. 
              Scale your creative projects with trusted creators worldwide.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <button
                onClick={() => openModal('register')}
                className="glow-button px-8 py-4 inline-flex items-center justify-center gap-2 font-semibold hover:scale-105 transition-transform"
              >
                Get Started
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-all hover:scale-105">
                See How It Works
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-text-secondary text-sm"
            >
              Join 1000+ creators already using Connectify
            </motion.p>
          </motion.div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-secondary)', position: 'relative', zIndex: 1 }}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Connect with talent in three simple steps
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  number: "1",
                  title: "Create Your Profile",
                  description: "Sign up as a Creator, Editor, Designer, or Consumer. Set up your profile with your skills and requirements.",
                },
                {
                  number: "2",
                  title: "Browse & Connect",
                  description: "Explore our network of talented professionals. Send collaboration requests to those who match your needs.",
                },
                {
                  number: "3",
                  title: "Collaborate & Grow",
                  description: "Accept requests, manage projects, and build long-term partnerships with creators.",
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass-card p-8 rounded-lg"
                >
                  <div className="text-5xl font-display font-bold text-primary mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 px-4" style={{ position: 'relative', zIndex: 1 }}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Why Choose Connectify?
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Everything you need to connect with top creative talent
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="glass-card p-6 rounded-lg"
                  >
                    <Icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-text-secondary">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* NICHES SECTION */}
        <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-secondary)', position: 'relative', zIndex: 1 }}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Popular Niches
              </h2>
              <p className="text-text-secondary text-lg">
                Find creators across all niches
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap gap-4 justify-center"
            >
              {niches.map((niche, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 border border-primary rounded-full text-primary cursor-pointer hover:bg-primary/10 transition-all"
                >
                  {niche}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-20 px-4" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto glass-card p-12 rounded-lg text-center"
          >
            <h2 className="font-display text-4xl font-bold mb-4">
              Ready to Start Connecting?
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of creators and talent collaborating on Connectify.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openModal('register')}
                className="glow-button px-8 py-4 font-semibold"
              >
                Create Account
              </button>
              <button
                onClick={() => openModal('login')}
                className="px-8 py-4 border-2 border-secondary text-secondary font-semibold rounded-lg hover:bg-secondary/10 transition-all"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
