'use client';

import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

export function ComingSoon({ title, description, icon: Icon = Clock }: ComingSoonProps) {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl opacity-50" />
          
          {/* Content */}
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-6"
            >
              <Icon className="h-10 w-10 text-blue-600" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              {title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              {description}
            </motion.p>

            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              <span>Coming Soon</span>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-60" />
            <div className="absolute top-8 right-8 w-1 h-1 bg-indigo-400 rounded-full opacity-40" />
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-purple-400 rounded-full opacity-30" />
            <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50" />
          </div>

          {/* Floating Animation */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 1, -1, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-70"
          />
        </motion.div>
      </div>
    </div>
  );
}