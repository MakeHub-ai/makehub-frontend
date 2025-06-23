import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent as CardContentBase } from '@/components/ui/card';
import { Building, Tag, Info, Copy as CopyIcon } from 'lucide-react';
import type { Model } from '@/types/models';
import { motion } from 'framer-motion';

type ModelCardProps = {
  models: Model[];
  display_name: string;
  onSelect?: (model: Model) => void;
  href?: string;
};

export function ModelCard({ models, display_name, onSelect, href }: ModelCardProps) {
  // On prend le premier modèle comme référence pour l'organisation/logo
  const mainModel = models[0];
  const organisation = mainModel.model_id ? mainModel.model_id.split('/')[0] : 'unknown';
  const logoPath = `/model_logo/${organisation.toLowerCase()}.webp`;

  // Regrouper par quantization (clé: quantisation formatée, valeur: Model)
  const quantGroups: { [quant: string]: Model } = {};
  models.forEach((m) => {
    const quant = formatQuantization(m.quantisation) || "Standard";
    if (!quantGroups[quant]) {
      quantGroups[quant] = m;
    }
  });

  // Déterminer la quantisation la plus haute
  const quantOrder = ["FP32", "FP16", "FP8", "Standard"];
  const quantList = Object.keys(quantGroups);
  const bestQuant = quantOrder.find(q => quantList.includes(q)) || quantList[0];
  const bestModel = quantGroups[bestQuant];

  // Liste complète des quantisations distinctes (hors Standard)
  const allQuantsSet = new Set<string>();
  models.forEach((m) => {
    const q = formatQuantization(m.quantisation);
    if (q && q !== "Standard") allQuantsSet.add(q);
  });
  const allQuants = Array.from(allQuantsSet);

  // Agréger les providers uniques (union sur tous les modèles du groupe)
  const uniqueProviders = Array.from(
    new Set(
      models
        .map(m => m.provider)
        .filter((p): p is string => !!p)
    )
  );
  // Agréger le maxContext max du groupe
  const maxContext = Math.max(...models.map(m => m.context ?? 0));

  // Function to format quantization
  function formatQuantization(quant: string | number | null | undefined): string | null {
    if (quant === null || quant === undefined) return null;
    if (typeof quant === 'number') {
      return `FP${quant}`;
    }
    const quantStr = String(quant).toUpperCase();
    return quantStr.startsWith('FP') ? quantStr : `FP${quantStr}`;
  }

  const BadgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = async (model_id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (model_id) {
      await navigator.clipboard.writeText(model_id);
      setCopied(model_id);
      setTimeout(() => setCopied(null), 1200);
    }
  };

  const CardContent = () => (
    <CardContentBase className="p-5 flex flex-col h-full group-hover:bg-gradient-to-br group-hover:from-blue-50/20 group-hover:to-indigo-50/40 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="relative flex gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center p-1 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-100 shadow-sm group-hover:shadow transition-all duration-300">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={logoPath}
                  alt={organisation}
                  width={28}
                  height={28}
                  className="rounded-full object-contain mx-auto my-auto"
                  onError={(e: any) => {
                    e.target.src = '/model_logo/default.webp';
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{display_name}</h3>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 break-all">{bestModel.model_id}</span>
<motion.button
  onClick={(e) => handleCopy(bestModel.model_id, e)}
  aria-label={`Copier l'identifiant du modèle`}
  className="ml-1 p-1 rounded hover:bg-gray-100 transition-colors"
  tabIndex={0}
  type="button"
  animate={copied === bestModel.model_id ? { scale: 1.2, rotate: 15 } : { scale: 1, rotate: 0 }}
  transition={{ duration: 0.18, type: "tween", ease: "easeOut" }}
>
  <CopyIcon className={`w-4 h-4 ${copied === bestModel.model_id ? "text-blue-600" : "text-gray-400 hover:text-blue-600"}`} />
</motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-end justify-between mt-4">
        {/* Badges de quantization en bas à gauche */}
        <div className="flex flex-wrap gap-1.5">
          {allQuants
            .filter((quant) => quant !== "Standard")
            .map((quant, idx) => (
              <span
                key={quant}
                className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium
                  ${quant.includes("16")
                    ? "bg-blue-50 text-blue-700 border border-blue-200/70 group-hover:bg-blue-100 group-hover:border-blue-300/70"
                    : "bg-purple-50 text-purple-700 border border-purple-200/70 group-hover:bg-purple-100 group-hover:border-purple-300/70"
                  } transition-colors duration-300`}
              >
                {quant}
              </span>
            ))}
        </div>
        {/* Bloc providers/contexte en bas à droite */}
        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <Building className="h-3 w-3 mr-1" />
            {uniqueProviders.length} provider{uniqueProviders.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Info className="h-3 w-3 mr-1" />
            {maxContext && maxContext > 0
              ? maxContext >= 1e6
                ? `${(maxContext / 1e6).toFixed(0)}M tokens`
                : maxContext >= 1e3
                  ? `${(maxContext / 1e3).toFixed(0)}k tokens`
                  : `${maxContext} tokens`
              : "N/A tokens"}
          </div>
        </div>
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
        onClick={() => onSelect?.(mainModel)}
      >
        <CardContent />
      </Card>
    </motion.div>
  );
}
