"use client"

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Image from 'next/image';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Modified helper function with phase shifts
const generateCyclicalData = (
  length: number, 
  min: number, 
  max: number, 
  varianceFactor: number = 0.25,
  options = {
    cycleAmplitude: 0.3,
    spikeProbability: 0.15,
    spikeIntensity: 0.25,
    phaseShift: 0
  }
) => {
  const data = [];
  const cycle = 2 * Math.PI / (length / 1.5); // Adjusted for fewer cycles (1.5 instead of 3)
  
  for (let i = 0; i < length; i++) {
    // Phase-shifted cycles with different frequencies
    const primaryCycle = Math.sin((i * cycle) + options.phaseShift);
    const secondaryCycle = Math.sin((i * cycle * 1.5) + options.phaseShift * 1.3) * 0.4;
    const fastCycle = Math.sin((i * cycle * 3) + options.phaseShift * 0.7) * 0.2;
    
    const cyclicalBase = (primaryCycle + secondaryCycle + fastCycle) * ((max - min) * options.cycleAmplitude);
    
    // Add some noise to prevent patterns from looking too regular
    const noise = ((max - min) * varianceFactor) * (Math.random() - 0.5);
    
    let value = ((max + min) / 2) + cyclicalBase + noise;
    
    if (Math.random() < options.spikeProbability) {
      const spike = ((Math.random() > 0.5 ? 1 : -1) * (max - min) * options.spikeIntensity);
      value += spike;
    }
    
    data.push(Math.max(min, Math.min(max, value)));
  }
  
  return data;
};

export function PerformanceChartSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const timeLabels = Array.from({ length: 15 }, (_, i) => i + 1); // Reduced from 30 to 15 data points
  
  // Generate data with similar averages but different phases
  const anthropicData = generateCyclicalData(15, 40, 80, 0.25, { // Reduced length to 15
    cycleAmplitude: 0.3,
    spikeProbability: 0.2, // Slightly increased to maintain visual interest
    spikeIntensity: 0.25,
    phaseShift: 0
  });
  const gcpData = generateCyclicalData(15, 40, 80, 0.25, { // Reduced length to 15
    cycleAmplitude: 0.3,
    spikeProbability: 0.2,
    spikeIntensity: 0.25,
    phaseShift: 1.05 // Adjusted phase shift for fewer points
  });
  const bedrockData = generateCyclicalData(15, 40, 80, 0.25, { // Reduced length to 15
    cycleAmplitude: 0.3,
    spikeProbability: 0.2,
    spikeIntensity: 0.25,
    phaseShift: 2.1 // Adjusted phase shift for fewer points
  });

  // Generate MakeHub data by taking the highest value at each point
  const makeHubData = timeLabels.map((_, index) => {
    return Math.max(
      anthropicData[index],
      gcpData[index],
      bedrockData[index]
    );
  });

  // Calculate averages for each provider
  const avgAnthropic = anthropicData.reduce((a, b) => a + b, 0) / anthropicData.length;
  const avgGcp = gcpData.reduce((a, b) => a + b, 0) / gcpData.length;
  const avgBedrock = bedrockData.reduce((a, b) => a + b, 0) / bedrockData.length;

  // Custom legend with images
  const legendLabels = [
    { name: 'MakeHub', image: '/logo.webp', color: '#634BF6' },  // Updated MakeHub purple
    { name: 'Anthropic', image: '/model_logo/anthropic.webp', color: '#000000' },
    { name: 'Google Cloud', image: '/model_logo/gcp.webp', color: '#34A853' },
    { name: 'AWS Bedrock', image: '/model_logo/aws.webp', color: '#FF9900' }
  ];

  const data = {
    labels: timeLabels,
    datasets: [
      // Moved MakeHub to the end and removed zIndex
      {
        label: ' ',
        data: anthropicData,
        borderColor: '#000000',
        backgroundColor: '#000000',
        borderWidth: 1.5,
        tension: 0.4,
        borderDash: [4, 4],
        borderDashOffset: -10,
      },
      {
        label: ' ',
        data: gcpData,
        borderColor: '#34A853',
        backgroundColor: '#34A853',
        borderWidth: 1.5,
        tension: 0.4,
        borderDash: [4, 4],
        borderDashOffset: -10,
      },
      {
        label: ' ',
        data: bedrockData,
        borderColor: '#FF9900',
        backgroundColor: '#FF9900',
        borderWidth: 1.5,
        tension: 0.4,
        borderDash: [4, 4],
        borderDashOffset: -10,
      },
      {
        label: ' ',
        data: makeHubData,
        borderColor: '#634BF6',
        backgroundColor: '#634BF6',
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'nearest' as const, // Utiliser une assertion de type 'as const' pour indiquer une valeur littérale
    },
    plugins: {
      legend: {
        display: false, // Hide the default legend completely
      },
      title: {
        display: true,
        text: 'Claude Sonnet 3.7',
        color: '#000000', // Changed to black
        font: {
          size: 20,
          weight: 'bold' as 'bold', // Utiliser une assertion de type pour spécifier que c'est une valeur littérale
        },
        padding: {
          bottom: 30
        }
      },
      tooltip: {
        enabled: false, // Disable tooltips completely
      },
        },
        scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Time',
          color: '#94a3b8',
          padding: 12,
          font: {
            size: 14,
            weight: 500 // Transformé en nombre (sans guillemets)
          }
        },
        ticks: {
          display: false // Changed back to false to hide the seconds
        }
      },
      y: {
        title: {
          display: true,
          text: 'Tokens per Second (t/s)',
          color: '#94a3b8',
          padding: {
            bottom: 12
          },
          font: {
            size: 14,
            weight: 500 // Transformé en nombre (sans guillemets)
          }
        },
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          padding: 12,
          callback: function(tickValue: string | number): string | number {
            return tickValue;
          }
        }
      },
    },
    elements: {
      point: {
        radius: 0,
      },
      line: {
        borderWidth: 2,
      }
    },
    animation: {
      duration: 1000, // General animation duration
      onComplete: () => {
        // console.log('Initial animation complete');
      },
      delay: (context: any) => { // Added 'any' type for context, adjust if more specific type is known
        let delay = 0;
        // Apply a staggered delay to the MakeHub line (datasetIndex 3) for a more pronounced drawing effect
        if (context.type === 'data' && context.mode === 'default' && context.datasetIndex === 3) {
          delay = context.dataIndex * 50; // Shorter delay per point for faster but noticeable drawing
        } else if (context.type === 'data' && context.mode === 'default') {
          // Optional: slightly delay other lines if needed, or keep them drawing together
          delay = context.datasetIndex * 200; // Example: stagger start of other lines
        }
        return delay;
      },
    },
    transitions: {
      active: {
        animation: {
          duration: 0 // Prevents animation on hover
        }
      }
    }
  };

  useEffect(() => {
    let animationFrame: number;
    let offset = 0;

    const animate = () => {
      offset = (offset + 0.5) % 8; // Controls the speed and pattern of the movement
      data.datasets.slice(1).forEach(dataset => {
        if (dataset.borderDashOffset !== undefined) {
          dataset.borderDashOffset = -offset;
        }
      });
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [data.datasets]);

  return (
    <section ref={sectionRef} className="py-8 sm:py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl lg:text-center mb-8"
        >
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Real-time optimization</h2>
          <p className="mt-2 text-5xl font-bold tracking-tight text-gray-900">
            Why settle for just one AI provider?
          </p>
          <p className="mt-4 text-xl text-gray-700">
            Our intelligent routing dynamically switches between OpenAI, Anthropic, Mistral and Llama to meet your performance needs and budget constraints.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="relative w-full" style={{ height: '460px' }}>
            {/* Removed background and shadow from this container */}
            <div style={{ 
              borderRadius: '4rem', // Keep border radius if desired for overall shape
              overflow: 'hidden',   // Keep overflow hidden
              padding: '2rem 2rem 1rem 2rem',
              // background: 'white', // Removed
              // boxShadow: '0 0 60px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.05)', // Removed
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Add the Line chart here */}
              <div style={{ flex: 1, position: 'relative' }}>
                <Line data={data} options={options} />
              </div>
              
              {/* Legend below the chart */}
              <div className="flex items-center justify-center gap-x-6 gap-y-2 flex-wrap mt-0 pt-4">
                {legendLabels.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <Image 
                      src={item.image}
                      alt={item.name || 'Provider logo'} // Use item.name for alt text
                      width={20}
                      height={20}
                      className="rounded-sm" // Keep logos slightly rounded if they are not already circular
                    />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{item.name}</span> {/* Added provider name, responsive text size */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
