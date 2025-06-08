import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent as CardContentBase } from '@/components/ui/card';
import { Building, Tag, Info } from 'lucide-react';
import type { Model } from '@/types/models';
import { motion } from 'framer-motion';

type ModelCardProps = {
  model: Model;
  stats: {
    providers: number;
    quantisations: Array<string | number | null | undefined>;
  };
  onSelect?: (model: Model) => void;
  href?: string;
};

export function ModelCard({ model, stats, onSelect, href }: ModelCardProps) {
  const logoPath = `/model_logo/${model.organisation.toLowerCase()}.webp`;

  // Function to format quantization
  const formatQuantization = (quant: string | number | null | undefined): string | null => {
    if (quant === null || quant === undefined) return null;
    
    if (typeof quant === 'number') {
      return `FP${quant}`;
    }
    
    // If it's already a string
    const quantStr = String(quant).toUpperCase();
    // Add FP prefix if needed
    return quantStr.startsWith('FP') ? quantStr : `FP${quantStr}`;
  };

  const BadgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  const CardContent = () => (
    <CardContentBase className="p-5 flex flex-col h-full group-hover:bg-gradient-to-br group-hover:from-blue-50/20 group-hover:to-indigo-50/40 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="relative flex gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center p-1 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-100 shadow-sm group-hover:shadow transition-all duration-300">
              <div className="relative w-7 h-7">
                <Image
                  src={logoPath}
                  alt={model.organisation}
                  width={28}
                  height={28}
                  className="rounded-full object-contain"
                  onError={(e: any) => {
                    e.target.src = '/model_logo/default.webp';
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{model.display_name}</h3>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                  <Building className="h-3 w-3 mr-1" />
                  {stats.providers} provider{stats.providers !== 1 ? 's' : ''}
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  {model.context || "N/A"}k tokens
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex flex-wrap gap-1.5 mt-4">
        {stats.quantisations.map((quant, index) => {
          const formattedQuant = formatQuantization(quant);
          if (!formattedQuant) return null;
          
          return (
            <motion.span
              key={`${formattedQuant}-${index}`}
              variants={BadgeVariants}
              transition={{ delay: index * 0.1 }}
              className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium
                ${formattedQuant.includes("16")
                  ? "bg-blue-50 text-blue-700 border border-blue-200/70 group-hover:bg-blue-100 group-hover:border-blue-300/70" 
                  : "bg-purple-50 text-purple-700 border border-purple-200/70 group-hover:bg-purple-100 group-hover:border-purple-300/70"
                } transition-colors duration-300`}
            >
              {formattedQuant}
            </motion.span>
          );
        })}
        
        {/* If no quantization is available, show "Standard" */}
        {stats.quantisations.length === 0 || stats.quantisations.every(q => q === null || q === undefined) ? (
          <motion.span 
            variants={BadgeVariants}
            className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200/70 group-hover:bg-gray-100 group-hover:border-gray-300/70 transition-colors duration-300"
          >
            Standard
          </motion.span>
        ) : null}
      </div>
    </CardContentBase>
  );

  if (href) {
    return (
      <Link href={href} className="block overflow-visible">
        <Card className="ModelCard transition-all duration-300 cursor-pointer bg-white h-[160px] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2),0_0_30px_-5px_rgba(99,75,246,0.15)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15),0_0_20px_-5px_rgba(99,75,246,0.1)]">
          <CardContent />
        </Card>
      </Link>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Card 
        className="ModelCard transition-all duration-300 cursor-pointer bg-white h-[160px] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2),0_0_30px_-5px_rgba(99,75,246,0.15)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15),0_0_20px_-5px_rgba(99,75,246,0.1)] rounded-xl overflow-hidden"
        onClick={() => onSelect?.(model)}
      >
        <CardContent />
      </Card>
    </motion.div>
  );
}
