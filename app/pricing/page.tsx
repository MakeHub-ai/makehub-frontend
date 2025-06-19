"use client";

import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/auth-context';
import { SignInDialog } from "@/components/sign_in/sign-in-dialog";

const PricingPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    "Smart Provider Routing",
    "Instant Failover Protection",
    "One Unified API",
    "Real-Time Performance Monitoring",
    "Universal Tool Compatibility",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { stiffness: 100 },
    },
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Pay As You Go
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            We take a 2% fee on credit refuel. Access all providers with one unified API.
          </p>
        </motion.div>

        <motion.div
          className="max-w-md mx-auto"
          variants={itemVariants}
        >
          <motion.div
            className="rounded-3xl px-8 py-12 border border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl backdrop-blur-sm bg-opacity-80"
            whileHover={{ y: -5 }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" as const, stiffness: 100 }}
          >
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-blue-600 mb-4">Simple Pricing</h2>
              <p className="text-gray-600">A flat 2% fee on credit refuel. No hidden costs.</p>
            </div>

            <div className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature} 
                  className="flex items-center gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-center"
            >
              <div className="flex gap-4 justify-center">
                {auth.session ? (
                  <Button
                    onClick={() => router.push('/docs')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 text-base font-medium rounded-xl shadow-lg hover:shadow-blue-200"
                  >
                    Get Started
                  </Button>
                ) : (
                  <SignInDialog>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 text-base font-medium rounded-xl shadow-lg hover:shadow-blue-200"
                    >
                      Get Started
                    </Button>
                  </SignInDialog>
                )}
                <a
                  href="https://calendly.com/sf-florido-makehub/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-xl py-3 px-6 text-base"
                  >
                    Preferential Pricing
                  </Button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.p 
          className="text-gray-500 text-sm mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Questions? <a href="https://calendly.com/sf-florido-makehub/30min" className="text-blue-600 hover:underline">Contact us</a> or book a <a href="https://calendly.com/sf-florido-makehub/30min" className="text-blue-600 hover:underline">demo</a>
        </motion.p>

        <motion.p 
          className="text-gray-400 text-xs mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          * Payment infrastructure fees (Stripe, etc.) are not included and will be charged separately.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PricingPage;
