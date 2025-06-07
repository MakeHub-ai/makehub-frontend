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
              Make Your Agents Faster and Cheaper.<br />
              Instantly. 
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
            className="mt-4 sm:mt-8 flex flex-row items-center justify-center gap-4 sm:gap-x-8"
          >
            <Link href="/docs" prefetch={true}>
              <Button size="lg" className="group w-auto px-10 py-7 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105">
              Get in Now 
              </Button>
            </Link>
            <Link href="https://calendly.com/sf-florido-makehub/30min" prefetch={true} className="text-lg font-semibold leading-6 text-gray-300 hover:text-gray-100 transition-colors">
              Book a demo <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
