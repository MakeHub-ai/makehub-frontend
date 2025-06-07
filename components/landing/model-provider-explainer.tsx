"use client"

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function ModelProviderExplainer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const models = [
    { name: "GPT-4o", category: "OpenAI" },
    { name: "Claude 3.5", category: "Anthropic" },
    { name: "Llama 3.1", category: "Meta" },
    { name: "Mistral Large", category: "Mistral" },
    {name: "Gemini 2.0", category: "Google"}
  ];

  const providers = [
    { name: "OpenAI", color: "bg-green-100 text-green-800" },
    { name: "Anthropic", color: "bg-blue-100 text-blue-800" },
    { name: "Together.ai", color: "bg-purple-100 text-purple-800" },
    { name: "Hyperbolics", color: "bg-amber-100 text-amber-800" },
    { name: "GCP", color: "bg-red-100 text-red-800" },
    { name: "AWS Bedrock", color: "bg-orange-100 text-orange-800" }
  ];

  return (
    <div ref={ref} className="rounded-xl bg-white p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-center mb-6">Understanding Models vs. Providers</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-4"
        >
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-medium text-lg mb-2 text-indigo-800">AI Models</h4>
            <p className="text-sm text-gray-600 mb-3">
              These are the actual AI algorithms you interact with and what determines capabilities.
            </p>
            <div className="flex flex-wrap gap-2">
              {models.map((model, i) => (
                <motion.span 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm inline-flex items-center"
                >
                  {model.name}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col space-y-4"
        >
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-lg mb-2 text-blue-800">AI Providers</h4>
            <p className="text-sm text-gray-600 mb-3">
              These are the platforms that host and serve the models, each with varying performance and pricing.
            </p>
            <div className="flex flex-wrap gap-2">
              {providers.map((provider, i) => (
                <motion.span 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className={`px-3 py-1 rounded-full text-sm inline-flex items-center ${provider.color}`}
                >
                  {provider.name}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg"
      >
        <h4 className="font-medium text-center mb-2">How Makehub Helps</h4>
        <p className="text-sm text-gray-700">
          You choose the <span className="font-bold text-indigo-700">model</span> you need (GPT-4, Claude, etc.), and Makehub finds the best <span className="font-bold text-blue-700">provider</span> to serve it based on speed, reliability, and cost.
        </p>
      </motion.div>
    </div>
  );
}
