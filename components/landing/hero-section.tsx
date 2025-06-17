"use client"

import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-[#15171B]">
      <div className="fixed inset-0 top-0 bg-grid-pattern opacity-10 -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-70"></div>
      
      <div className="absolute inset-0 w-full overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -left-4 top-1/2 h-64 w-64 -translate-y-1/2 bg-indigo-500 rounded-full blur-3xl"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -right-4 top-1/2 h-64 w-64 -translate-y-1/2 bg-blue-500 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-8 sm:py-20 relative">
        <div className="mx-auto max-w-5xl text-center relative">
            <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="py-4 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white">
              Run Faster and Cheaper Agents everywhere.
            </span>
            </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base leading-7 sm:text-xl sm:leading-9 text-gray-300"
          > 
            MakeHub is a universal API load balancer that routes your requests to the fastest, cheapest provider in real time.
Smart arbitrage, instant failovers, and live performance tracking keep you ahead.
          </motion.p>

          {/* Testimonials Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }} // Adjusted delay
            className="mt-4 sm:mt-8 mb-4 sm:mb-12" // Adjusted margin bottom
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {/* Testimonial 1 */}
              <div className="flex items-center space-x-4 p-2 bg-gray-800/50 rounded-lg shadow-sm ring-1 ring-[#674AFF]">
                <div className="flex-none flex items-center justify-center">
                  <Image
                    src="/companies/kasar.png"
                    alt="Kasar Logo"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between h-full">
                  <p className="text-sm text-gray-300 leading-normal">"Makehub cut our AI costs by 50% and doubled response speed. A must-have."</p>
                  <p className="text-xs font-semibold text-gray-200">Marceau Giraud, CEO, Kasar</p>
                </div>
              </div>
              {/* Testimonial 2 */}
              <div className="flex items-center space-x-4 p-2 bg-gray-800/50 rounded-lg shadow-sm ring-1 ring-[#674AFF]">
                <div className="flex-none flex items-center justify-center">
                   <Image
                    src="/companies/roo_code.png"
                    alt="Roo Code Logo"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between h-full">
                  <p className="text-sm text-gray-300 leading-normal">"I code faster for less money, it just works"</p>
                  <p className="text-xs font-semibold text-gray-200">Anton Jego - Roo Code User & CEO of Atelier des Nuages</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-8"
          >
            {/* Nouveau bloc de boutons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://marketplace.visualstudio.com/items?itemName=Makehub.makehub-dev" prefetch={true} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="group w-auto px-6 py-3 text-lg bg-white text-black hover:bg-gray-50 transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <Image src="/companies/cline.png" alt="Cline by MakeHub Logo" width={24} height={24} className="h-6 w-6" />
                  <span>Cline by MakeHub</span>
                </Button>
              </Link>
              <Link href="https://marketplace.visualstudio.com/items?itemName=Makehub.makehub" prefetch={true} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="group w-auto px-6 py-3 text-lg bg-white text-black hover:bg-gray-50 transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <div className="h-6 w-6 bg-[#333C44] rounded-md flex items-center justify-center p-0.5">
                    <Image src="/companies/roo_code.png" alt="Roo Code by MakeHub Logo" width={20} height={20} className="h-5 w-5 object-contain" />
                  </div>
                  <span>Roo by MakeHub</span>
                </Button>
              </Link>
            </div>
            {/* Fin du nouveau bloc de boutons */}
            <Link href="https://discord.gg/mJ2Q2pQF" prefetch={true} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="group w-auto px-6 py-3 text-lg bg-[#5865F2] text-white hover:bg-[#4752C4] transition-all duration-200 hover:scale-105 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Join Discord</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
