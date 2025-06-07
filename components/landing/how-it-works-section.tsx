"use client"

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import Image from 'next/image';

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (!isInView || !containerRef.current) return;
    
    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    
    if (isMobile) {
      // Mobile animation sequence - vertical flow with adjusted positions
      timeline
        // Initial state - show model selection
        .to('.model-selection', {
          duration: 0.5,
          opacity: 1,
          scale: 1,
          stagger: 0.2,
          ease: 'back.out'
        })
        // Select a model (Claude in this case)
        .to('.selected-model', {
          duration: 0.3,
          backgroundColor: '#634BF6',
          scale: 1.1,
          boxShadow: '0 0 10px rgba(99, 75, 246, 0.5)',
          ease: 'power2.out'
        })
        // Animate data packet going to MakeHub (vertical movement)
        .to('.data-packet-request', { 
          duration: 1.2, 
          y: '+=120',
          scale: 1,
          opacity: 1,
          ease: 'power1.inOut' 
        })
        // MakeHub processes the request
        .to('.makehub-icon', { 
          duration: 0.5, 
          scale: 1.1,
          ease: 'elastic.out',
          yoyo: true,
          repeat: 1
        }, '-=0.3')
        // Show performance metrics for providers
        .to('.performance-metrics', {
          duration: 0.4,
          opacity: 1,
          y: 0,
          ease: 'power1.out'
        })
        // Provider selection appears
        .to('.provider-selection', { 
          duration: 0.5, 
          opacity: 1,
          scale: 1,
          stagger: 0.2,
          ease: 'back.out' 
        })
        // Best provider is selected
        .to('.selected-provider', { 
          duration: 0.3, 
          backgroundColor: '#634BF6',
          scale: 1.1,
          boxShadow: '0 0 10px rgba(99, 75, 246, 0.5)',
          ease: 'power2.out' 
        })
        // Animate data packet going to selected provider (down)
        .to('.data-packet-to-provider', {
          duration: 0.8,
          y: '+=70',
          opacity: 1,
          ease: 'power1.inOut'
        })
        // Animate data packet returning from provider (up)
        .to('.data-packet-from-provider', {
          duration: 0.8,
          y: '-=70',
          opacity: 1,
          ease: 'power1.inOut'
        })
        // Animate response back to app (up)
        .to('.data-packet-response', { 
          duration: 1.2, 
          y: '-=120',
          opacity: 1,
          ease: 'power1.inOut' 
        })
        // Reset everything
        .to('.reset', {
          duration: 0.5,
          opacity: 0,
          delay: 1,
          onComplete: () => {
            // Reset all animation elements
            gsap.set('.model-selection', { opacity: 0, scale: 0.8 });
            gsap.set('.selected-model', { backgroundColor: '#f5f5f5', scale: 1, boxShadow: 'none' });
            gsap.set('.performance-metrics', { opacity: 0, y: 10 });
            gsap.set('.provider-selection', { opacity: 0, scale: 0.8 });
            gsap.set('.selected-provider', { backgroundColor: '#f5f5f5', scale: 1, boxShadow: 'none' });
            gsap.set('.data-packet-request', { y: 0, opacity: 0, scale: 0.7 });
            gsap.set('.data-packet-response', { y: 0, opacity: 0 });
            gsap.set('.data-packet-to-provider', { y: 0, opacity: 0 });
            gsap.set('.data-packet-from-provider', { y: 0, opacity: 0 });
          }
        })
        .to('.reset', {
          duration: 0.5,
          opacity: 1
        });
    } else {
      // Desktop animation - horizontal flow (original)
      timeline
        // Initial state - show model selection
        .to('.model-selection', {
          duration: 0.5,
          opacity: 1,
          scale: 1,
          stagger: 0.2,
          ease: 'back.out'
        })
        // Select a model (Claude in this case)
        .to('.selected-model', {
          duration: 0.3,
          backgroundColor: '#634BF6',
          scale: 1.1,
          boxShadow: '0 0 10px rgba(99, 75, 246, 0.5)',
          ease: 'power2.out'
        })
        // Animate data packet going to MakeHub
        .to('.data-packet-request', { 
          duration: 1.2, 
          x: '+=120',
          y: 0,
          scale: 1,
          opacity: 1,
          ease: 'power1.inOut' 
        })
        // MakeHub processes the request
        .to('.makehub-icon', { 
          duration: 0.5, 
          scale: 1.1,
          ease: 'elastic.out',
          yoyo: true,
          repeat: 1
        }, '-=0.3')
        // Show performance metrics for providers
        .to('.performance-metrics', {
          duration: 0.4,
          opacity: 1,
          y: 0,
          ease: 'power1.out'
        })
        // Provider selection appears
        .to('.provider-selection', { 
          duration: 0.5, 
          opacity: 1,
          scale: 1,
          stagger: 0.2,
          ease: 'back.out' 
        })
        // Best provider is selected
        .to('.selected-provider', { 
          duration: 0.3, 
          backgroundColor: '#634BF6',
          scale: 1.1,
          boxShadow: '0 0 10px rgba(99, 75, 246, 0.5)',
          ease: 'power2.out' 
        })
        // Animate data packet going to selected provider
        .to('.data-packet-to-provider', {
          duration: 0.8,
          x: '+=120',
          y: 0,
          opacity: 1,
          ease: 'power1.inOut'
        })
        // Animate data packet returning from provider
        .to('.data-packet-from-provider', {
          duration: 0.8,
          x: '-=120',
          opacity: 1,
          ease: 'power1.inOut'
        })
        // Animate response back to app
        .to('.data-packet-response', { 
          duration: 1.2, 
          x: '-=120',
          opacity: 1,
          ease: 'power1.inOut' 
        })
        // Reset everything
        .to('.reset', {
          duration: 0.5,
          opacity: 0,
          delay: 1,
          onComplete: () => {
            // Reset all animation elements
            gsap.set('.model-selection', { opacity: 0, scale: 0.8 });
            gsap.set('.selected-model', { backgroundColor: '#f5f5f5', scale: 1, boxShadow: 'none' });
            gsap.set('.performance-metrics', { opacity: 0, y: 10 });
            gsap.set('.provider-selection', { opacity: 0, scale: 0.8 });
            gsap.set('.selected-provider', { backgroundColor: '#f5f5f5', scale: 1, boxShadow: 'none' });
            gsap.set('.data-packet-request', { x: 0, opacity: 0, scale: 0.7 });
            gsap.set('.data-packet-response', { x: 0, opacity: 0 });
            gsap.set('.data-packet-to-provider', { x: 0, opacity: 0 });
            gsap.set('.data-packet-from-provider', { x: 0, opacity: 0 });
          }
        })
        .to('.reset', {
          duration: 0.5,
          opacity: 1
        });
    }
    
    return () => {
      timeline.kill();
    };
  }, [isInView, isMobile]);

  // Define the models that developers use
  const models = [
    { name: "Claude 4 Opus", logo: "/model_logo/anthropic.webp" },
    { name: "GPT-4.1", logo: "/model_logo/openai.webp" },
    { name: "Llama 4 Maverick", logo: "/model_logo/meta.webp" },
  ];

  // Define the providers that MakeHub can route to
  const providers = [
    { 
      name: "GCP", 
      logo: "/model_logo/gcp.webp", 
      metrics: { latency: "Fast", cost: "$", reliability: "99.9%" } 
    },
    { 
      name: "Anthropic", 
      logo: "/model_logo/anthropic.webp", 
      metrics: { latency: "Medium", cost: "$$$", reliability: "99.95%" }
    },
    { 
      name: "AWS", 
      logo: "/model_logo/aws.webp", 
      metrics: { latency: "Slow", cost: "$$", reliability: "99.5%" } 
    },
  ];

  return (
    <section className="py-32 sm:py-20 min-h-screen">
      <div className="container mx-auto max-w-7xl px-8">
        <div className="mx-auto max-w-3xl lg:text-center mb-5">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900">
            How It Works
          </h2>
        </div>
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className={`w-full max-w-5xl mx-auto ${isMobile ? 'h-[60rem]' : 'h-[32rem]'} bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden`}
        >
          {/* <h3 className="text-xl font-semibold text-center mb-6">How MakeHub Works</h3> */}
          
          
          {/* Conditional layout based on screen size */}
          <div className={isMobile ? "flex flex-col items-center justify-start gap-24 py-4" : "flex items-center justify-center gap-48 px-4"}>
            {/* User/Developer Section */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-50 rounded-lg flex items-center justify-center shadow-sm">
                <Image
                  src="/companies/cline.png"
                  alt="Cline Logo"
                  width={48}
                  height={48}
                  className="rounded"
                />
              </div>
              <p className="mt-2 font-medium">Your Coding Agent</p>
              
              {/* Model selection section */}
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-center text-gray-500">Choose any model:</p>
                {models.map((model, index) => (
                  <motion.div 
                    key={index}
                    className={`model-selection ${index === 0 ? 'selected-model' : ''} w-40 h-10 bg-gray-50 rounded-md flex items-center justify-start pl-2 opacity-0 scale-90 shadow-sm`}
                  >
                    <div className="flex items-center space-x-2">
                      <Image 
                        src={model.logo} 
                        alt={model.name} 
                        width={16} 
                        height={16}
                        className="rounded-sm"
                      />
                      <p className="text-xs font-medium">{model.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Middle - MakeHub */}
            <div className="flex flex-col items-center z-10">
              <div className="makehub-icon w-32 h-32 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo.webp"
                  alt="MakeHub Logo"
                  width={110}
                  height={110}
                  className="relative"
                />
              </div>
              <p className="mt-2 font-medium">MakeHub</p>
              <p className="text-sm text-gray-500 mt-1 text-center">Intelligent Provider Routing</p>
              
              {/* Performance metrics panel */}
              <motion.div 
                className="performance-metrics mt-4 bg-indigo-50/50 p-3 rounded-md opacity-0 translate-y-2"
              >
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-indigo-700">Speed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-indigo-700">Cost</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-indigo-700">Uptime</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right side - Providers */}
            <div className="flex flex-col items-center">
              <div>
                <p className="font-medium text-center mb-2">AI Providers</p>
                <div className="space-y-4">
                  {providers.map((provider, index) => (
                    <motion.div 
                      key={index}
                      className={`provider-selection ${index === 0 ? 'selected-provider' : ''} w-48 h-16 bg-gray-50 rounded-md flex items-center justify-center px-3 opacity-0 scale-90 shadow-sm`}
                    >
                      <div className="flex items-center space-x-2">
                        <Image 
                          src={provider.logo} 
                          alt={provider.name} 
                          width={20} 
                          height={20}
                          className="rounded-sm"
                        />
                        <p className="text-sm font-medium">{provider.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated data packets with conditional positioning */}
          <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
            {isMobile ? (
              <>
                {/* Mobile data packets - improved vertical positioning */}
                <div className="data-packet-request absolute opacity-0 scale-75" style={{ top: '17%', left: '50%', transform: 'translateX(-50%)' }}>
                  <div className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 14l-7 7m7-7h-9m9 0V5" />
                    </svg>
                    <span>Request</span>
                  </div>
                </div>
                
                <div className="data-packet-to-provider absolute opacity-0" style={{ top: '37%', left: '50%', transform: 'translateX(-50%)' }}>
                  <div className="flex items-center space-x-1 bg-indigo-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 14l-7 7m7-7h-9m9 0V5" />
                    </svg>
                    <span>Query</span>
                  </div>
                </div>
                
                <div className="data-packet-from-provider absolute opacity-0" style={{ top: '68%', left: '50%', transform: 'translateX(-50%)' }}>
                  <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 10l7-7m-7 7h9m-9 0v9" />
                    </svg>
                    <span>Response</span>
                  </div>
                </div>
                
                <div className="data-packet-response absolute opacity-0" style={{ top: '37%', left: '50%', transform: 'translateX(-50%)' }}>
                  <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 10l7-7m-7 7h9m-9 0v9" />
                    </svg>
                    <span>Completion</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Desktop data packets - original horizontal positioning */}
                <div className="data-packet-request absolute opacity-0 scale-75" style={{ top: '45%', left: '15%' }}>
                  <div className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <span>Request</span>
                  </div>
                </div>
                
                <div className="data-packet-to-provider absolute opacity-0" style={{ top: '30%', left: '50%' }}>
                  <div className="flex items-center space-x-1 bg-indigo-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span>Query</span>
                  </div>
                </div>
                
                <div className="data-packet-from-provider absolute opacity-0" style={{ top: '60%', left: '75%' }}>
                  <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>Response</span>
                  </div>
                </div>
                
                <div className="data-packet-response absolute opacity-0" style={{ top: '60%', left: '35%' }}>
                  <div className="flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-md shadow-md text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>Completion</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Reset class for animation */}
          <div className="reset absolute opacity-0" />
          
          {/* Explanation text - centered with max width */}
          <div className={`${isMobile ? 'mt-16' : 'mt-16'} text-center bg-indigo-50/50 p-4 rounded-md max-w-3xl mx-auto`}>
            <p className="text-sm text-gray-700">
              With <span className="font-bold">one unified API</span>, you choose the <span className="font-semibold text-indigo-700">model</span> you need, 
              and MakeHub intelligently routes to the best <span className="font-semibold text-blue-700">provider</span> based on 
              real-time performance metrics, ensuring optimal speed, reliability, and cost.
            </p>
          </div>
          
          {/* Add mobile-only scroll indicator */}
          {isMobile && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center animate-bounce opacity-70">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
