"use client"

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  company?: string;
  results?: string;
}

const testimonials = [
  {
    quote: "After switching to Makehub, we stopped receiving complaints about AI timeouts. Our app feels much more responsive, and our users are happier.",
    author: "Ayoub Saidane",
    title: "CTO",
    company: "Probe",
    results: "Results: 99.99% uptime and consistent response times"
  },
  {
    quote: "We were tired of being held hostage by a single provider's performance issues. Makehub solved that problem completely—now we're getting the best of all worlds.",
    author: "Marceau Giraud",
    title: "CEO",
    company: "Kasar",
    results: "Results: 50% cost reduction and 2x faster responses"
  }
];

export function TestimonialsOverviewSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  
  return (
    <section className="py-32 sm:py-40 min-h-screen">
      <div className="container mx-auto max-w-7xl px-8">
        <div className="mx-auto max-w-3xl lg:text-center mb-16">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900">
            What People Say
          </h2>
          <p className="mt-6 text-xl text-gray-700">
            See how Makehub is transforming AI development for companies that can't afford downtime.
          </p>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="flex flex-col bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 transition-all duration-300"
            >
              <motion.blockquote 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                className="flex-1"
              >
                <p className="text-lg text-gray-700 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                {testimonial.results && (
                  <p className="mt-3 font-medium text-indigo-600">
                    {testimonial.results}
                  </p>
                )}
              </motion.blockquote>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
                className="mt-6 border-t border-gray-100 pt-4"
              >
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">
                  {testimonial.title}
                  {testimonial.company && <span> at {testimonial.company}</span>}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
