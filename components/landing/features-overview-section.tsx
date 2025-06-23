"use client"

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation, Variants, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Cloud, 
  DollarSign, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  // New icons
  Network,
  ShieldCheck,
  Layers,
  TrendingDown,
  GitMerge,
  Activity
} from 'lucide-react';

// Map icon names to actual components
const iconComponents = {
  // Existing icons
  Rocket,
  Cloud,
  DollarSign,
  Zap,
  ArrowRight,
  CheckCircle,
  // New icons
  Network,
  ShieldCheck,
  Layers,
  TrendingDown,
  GitMerge,
  Activity
};

interface Feature {
  name: string;
  description: string;
  icon: string; // Changed to string (icon name)
}

const features = [
  {
    name: 'Smart Provider Routing',
    description: 'Requests are always sent to the fastest and most reliable provider.',
    icon: 'Routing.svg',
  },
  {
    name: 'Instant Failover Protection',
    description: 'Automatic switch to another provider in case of outage.',
    icon: 'fallback.svg',
  },
  {
    name: 'One Unified API',
    description: 'One API to access all major AI models.',
    icon: 'unified.svg',
  },
  {
    name: 'Intelligent Cost Optimization',
    description: 'Cut your AI costs by up to 50% with smart routing.',
    icon: 'money.svg',
  },
  {
    name: 'Universal Tool Compatibility',
    description: 'Works with your favorite tools and frameworks.',
    icon: 'tool.svg',
  },
  {
    name: 'Real-Time Performance Monitoring',
    description: 'Continuous monitoring for the best performance.',
    icon: 'faster.svg',
  },
];

export function FeaturesOverviewSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
        delay: i * 0.1,
      }
    })
  };

  return (
    <section className="py-32 sm:py-40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-8">
        <div className="mx-auto max-w-3xl lg:text-center">
          <p className="mt-6 text-5xl font-bold tracking-tight text-gray-900">
            One API, multiple providers,
            <span className="block text-[#674AFF]">
              unlimited possibilities
            </span>
          </p>
          <p className="mt-6 text-xl text-gray-700">
            Unlike competitors focused only on cost, we prioritize both speed and reliability while still cutting your expenses by up to 50%.
          </p>
        </div>
        <div className="mx-auto mt-16 sm:mt-20">
          <dl 
            ref={containerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {features.map((feature, index) => {
              const [isHovered, setIsHovered] = useState(false); // Each card needs its own state

              return (
                <motion.div 
                  key={feature.name}
                  custom={index}
                  initial="hidden"
                  animate={controls}
                  variants={cardVariants}
                  className="relative group overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-[#674AFF] transition-all duration-300 hover:shadow-xl min-h-[180px] flex flex-col justify-center"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <AnimatePresence mode="wait">
                    {!isHovered ? (
                      <motion.div
                        key="icon-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <dt className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-none">
                            <img
                              src={`/flat_icon/${feature.icon}`}
                              alt={feature.name}
                              className="h-12 w-12"
                            />
                          </div>
                          <p className="text-xl font-semibold leading-7 text-gray-900">{feature.name}</p>
                        </dt>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="description"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <dd className="text-base leading-7 text-gray-900 font-medium font-sans tracking-tight bg-gradient-to-r from-[#674AFF] to-[#00D4FF] bg-clip-text text-transparent drop-shadow-sm">{feature.description}</dd>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
