import type { UsageItem } from '@/types/dashboard';
import type {
  ProviderStats,
  ProviderMetrics,
  ProviderScore,
  ProviderRankingData,
  ProductionInsights,
  ModelFamily,
  ModelFamilyProvider,
  PROVIDER_CATEGORIES,
  PROVIDER_DISPLAY_NAMES
} from '@/types/provider-stats';
import {
  PROVIDER_CATEGORIES as CATEGORIES,
  PROVIDER_DISPLAY_NAMES as DISPLAY_NAMES
} from '@/types/provider-stats';

/**
 * Main function to process usage data and generate provider rankings
 */
export function processUsageDataForProviders(usageItems: UsageItem[]): ProviderRankingData {
  console.log(`🔄 Processing ${usageItems.length} usage items for provider statistics`);
  
  // Filter only debit transactions (actual usage)
  const usageTransactions = usageItems.filter(
    item => item.metadata.transaction_type === 'debit' &&
           item.metadata.details?.provider
  );

  console.log(`📊 Found ${usageTransactions.length} valid usage transactions`);

  if (usageTransactions.length === 0) {
    console.warn('❌ No usage transactions found');
    return {
      openSource: [],
      closedSource: [],
      lastUpdated: new Date().toISOString(),
      summary: {
        bestOpenSource: null,
        bestClosedSource: null,
        mostCostEfficient: null,
        fastestResponse: null,
      }
    };
  }

  // Group transactions by provider
  const providerGroups = groupTransactionsByProvider(usageTransactions);
  console.log(`🏷️ Grouped transactions into ${Object.keys(providerGroups).length} providers:`, Object.keys(providerGroups));
  
  // Calculate metrics for each provider
  const providerStats = Object.entries(providerGroups).map(([providerName, transactions]) => {
    console.log(`⚙️ Processing provider: ${providerName} with ${transactions.length} transactions`);
    const metrics = calculateProviderMetrics(transactions);
    const score = calculateProviderScore(metrics);
    const category = categorizeProvider(providerName);
    
    const stats = {
      name: getProviderDisplayName(providerName),
      category,
      logo: getProviderLogo(providerName),
      metrics,
      rank: 0, // Will be set after ranking
      score,
    } as ProviderStats;
    
    console.log(`✅ Provider stats created:`, {
      name: stats.name,
      category: stats.category,
      score: stats.score,
      validScores: stats.score.costEfficiency > 0 && stats.score.performance > 0
    });
    
    return stats;
  });

  console.log(`📈 Generated stats for ${providerStats.length} providers`);

  // Separate and rank providers by category
  const openSourceProviders = rankProviders(
    providerStats.filter(p => p.category === 'open-source')
  );
  const closedSourceProviders = rankProviders(
    providerStats.filter(p => p.category === 'closed-source')
  );

  console.log(`🏆 Final rankings: ${openSourceProviders.length} open source, ${closedSourceProviders.length} closed source`);

  // Generate summary
  const summary = generateSummary([...openSourceProviders, ...closedSourceProviders]);

  return {
    openSource: openSourceProviders,
    closedSource: closedSourceProviders,
    lastUpdated: new Date().toISOString(),
    summary,
  };
}

/**
 * Group usage transactions by provider
 */
function groupTransactionsByProvider(transactions: UsageItem[]): Record<string, UsageItem[]> {
  return transactions.reduce((groups, transaction) => {
    const provider = transaction.metadata.details?.provider?.toLowerCase() || 'unknown';
    if (!groups[provider]) {
      groups[provider] = [];
    }
    groups[provider].push(transaction);
    return groups;
  }, {} as Record<string, UsageItem[]>);
}

/**
 * Calculate comprehensive metrics for a provider
 */
function calculateProviderMetrics(transactions: UsageItem[]): ProviderMetrics {
  const totalRequests = transactions.length;
  const totalCost = transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.units)), 0);
  
  // Calculate latency metrics
  const latencies = transactions
    .map(t => t.metadata.details?.latency)
    .filter((latency): latency is number => typeof latency === 'number' && latency > 0);
  const avgLatency = latencies.length > 0 
    ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
    : 0;

  // Calculate token metrics
  const tokenData = transactions
    .map(t => ({
      prompt: t.metadata.details?.prompt_tokens || 0,
      completion: t.metadata.details?.completion_tokens || 0,
    }))
    .filter(t => t.prompt > 0 || t.completion > 0);
  
  const totalTokens = tokenData.reduce((sum, t) => sum + t.prompt + t.completion, 0);
  const costPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

  // Calculate success rate (assuming non-error responses are successful)
  const successRate = totalRequests > 0 ? 1.0 : 0; // Simplified - could be enhanced with error tracking

  // Calculate token throughput (tokens per second average)
  const avgTokensPerRequest = totalRequests > 0 ? totalTokens / totalRequests : 0;
  const tokenThroughput = avgLatency > 0 ? (avgTokensPerRequest / (avgLatency / 1000)) : 0;

  // Get popular models
  const modelCounts = transactions.reduce((counts, t) => {
    const model = t.metadata.details?.model || 'unknown';
    counts[model] = (counts[model] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const popularModels = Object.entries(modelCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([model]) => model);

  return {
    costPerToken,
    avgLatency,
    successRate,
    totalRequests,
    totalCost,
    popularModels,
    tokenThroughput,
    totalTokens,
    
    // New production metrics with default values for now
    tokensPerSecond: tokenThroughput, // Use existing calculation
    timeToFirstToken: avgLatency, // Use existing latency as TTFT approximation
    completionRate: successRate, // Use existing success rate
    selectionFrequency: 0, // Will be calculated later based on usage patterns
    modelFamilies: [], // Will be determined from models
  };
}

/**
 * Calculate weighted score for a provider
 */
function calculateProviderScore(metrics: ProviderMetrics): ProviderScore {
  console.log(`📊 Calculating score for provider with metrics:`, metrics);
  
  // Cost Efficiency Score (40% weight) - lower cost = higher score
  const costEfficiency = metrics.costPerToken > 0
    ? Math.min(100, (1 / (metrics.costPerToken * 1000)) * 10) // Normalize to 0-100
    : 0;

  // Performance Score (35% weight) - lower latency = higher score
  const latencyScore = metrics.avgLatency > 0
    ? Math.max(0, 100 - (metrics.avgLatency / 50)) // 5000ms = 0 score
    : 50; // Default score if no latency data
  
  const successRateScore = metrics.successRate * 100;
  const performance = (latencyScore * 0.6) + (successRateScore * 0.4);

  // Usage Popularity Score (25% weight) - more usage = higher score
  // This will be normalized against all providers later
  const usagePopularity = Math.min(100, (metrics.totalRequests / 10) * 10); // 100+ requests = max score

  // Calculate weighted total score
  const totalScore = (costEfficiency * 0.4) + (performance * 0.35) + (usagePopularity * 0.25);

  const scores = {
    costEfficiency: Math.round(costEfficiency * 100) / 100,
    performance: Math.round(performance * 100) / 100,
    usagePopularity: Math.round(usagePopularity * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
    
    // New production-focused scores (reuse existing calculations for now)
    speed: Math.round(performance * 100) / 100, // Use performance as speed approximation
    latency: Math.round(latencyScore * 100) / 100, // Use calculated latency score
    price: Math.round(costEfficiency * 100) / 100, // Use cost efficiency as price score
    reliability: Math.round(successRateScore * 100) / 100, // Use success rate score
    selection: Math.round(usagePopularity * 100) / 100, // Use usage popularity as selection score
  };
  
  console.log(`📈 Calculated scores:`, scores);
  return scores;
}

/**
 * Rank providers by their total score
 */
function rankProviders(providers: ProviderStats[]): ProviderStats[] {
  // Normalize usage popularity scores within this group
  const maxRequests = Math.max(...providers.map(p => p.metrics.totalRequests), 1);
  
  const normalizedProviders = providers.map(provider => {
    const normalizedUsagePopularity = (provider.metrics.totalRequests / maxRequests) * 100;
    const recalculatedScore = 
      (provider.score.costEfficiency * 0.4) + 
      (provider.score.performance * 0.35) + 
      (normalizedUsagePopularity * 0.25);
    
    return {
      ...provider,
      score: {
        ...provider.score,
        usagePopularity: Math.round(normalizedUsagePopularity * 100) / 100,
        totalScore: Math.round(recalculatedScore * 100) / 100,
      }
    };
  });

  // Sort by total score and assign ranks
  return normalizedProviders
    .sort((a, b) => b.score.totalScore - a.score.totalScore)
    .map((provider, index) => ({
      ...provider,
      rank: index + 1,
    }));
}

/**
 * Categorize provider as open-source or closed-source
 */
function categorizeProvider(providerName: string): 'open-source' | 'closed-source' {
  const normalizedName = providerName.toLowerCase();
  
  // Special handling for Azure providers (all providers starting with "azure" are closed-source)
  if (normalizedName.startsWith('azure')) {
    return 'closed-source';
  }
  
  // Special handling for Vertex providers (all providers starting with "vertex" are closed-source)
  if (normalizedName.startsWith('vertex')) {
    return 'closed-source';
  }
  
  // Check direct matches first
  if (CATEGORIES[normalizedName]) {
    return CATEGORIES[normalizedName];
  }
  
  // Check partial matches for common provider names
  for (const [key, category] of Object.entries(CATEGORIES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return category;
    }
  }
  
  // Default to open-source for unknown providers
  return 'open-source';
}

/**
 * Get display name for provider
 */
function getProviderDisplayName(providerName: string): string {
  const normalizedName = providerName.toLowerCase();
  
  // Check direct matches first
  if (DISPLAY_NAMES[normalizedName]) {
    return DISPLAY_NAMES[normalizedName];
  }
  
  // Check partial matches
  for (const [key, displayName] of Object.entries(DISPLAY_NAMES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return displayName;
    }
  }
  
  // Capitalize first letter as fallback
  return providerName.charAt(0).toUpperCase() + providerName.slice(1);
}

/**
 * Get provider logo URL or placeholder
 */
function getProviderLogo(providerName: string): string {
  const normalizedName = providerName.toLowerCase();
  
  // Provider logo mapping using actual logos in /model_logo directory
  const logoMap: Record<string, string> = {
    'openai': '/model_logo/openai.webp',
    'anthropic': '/model_logo/anthropic.webp',
    'claude': '/model_logo/anthropic.webp',
    'google': '/model_logo/google.webp',
    'gemini': '/model_logo/google.webp',
    'vertex': '/model_logo/vertex.png',
    'huggingface': '/model_logo/hf.webp',
    'hf': '/model_logo/hf.webp',
    'together': '/model_logo/together.webp',
    'replicate': '/model_logo/replicate.png',
    'fireworks': '/model_logo/fireworks.webp',
    'xai': '/model_logo/xai.webp',
    'grok': '/model_logo/xai.webp',
    'azure': '/model_logo/azure.webp',
    'aws': '/model_logo/aws.webp',
    'bedrock': '/model_logo/bedrock.png',
    'groq': '/model_logo/groq.webp',
    'mistral': '/model_logo/mistral.webp',
    'meta': '/model_logo/meta.webp',
    'sambanova': '/model_logo/sambanova.webp',
    'deepseek': '/model_logo/deepseek.webp',
    'deepinfra': '/model_logo/deepinfra.webp',
    'hyperbolic': '/model_logo/hyperbolic.webp',
    'novita': '/model_logo/novitai.webp',
    'gcp': '/model_logo/gcp.webp',
    'cerebras': '/model_logo/cerebras.webp',
    'centml': '/model_logo/centml.webp',
    'leptonai': '/model_logo/leptonai.webp',
    'qwen': '/model_logo/qwen.webp',
    'tii': '/model_logo/tii.webp',
    'gryphe': '/model_logo/gryphe.webp',
    'nebius': '/model_logo/nebius.webp',
  };
  
  // Check direct matches first
  if (logoMap[normalizedName]) {
    return logoMap[normalizedName];
  }
  
  // Check partial matches for providers with prefixes
  for (const [key, logo] of Object.entries(logoMap)) {
    if (normalizedName.includes(key) || normalizedName.startsWith(key)) {
      return logo;
    }
  }
  
  // Special handling for Azure providers
  if (normalizedName.startsWith('azure')) {
    return '/model_logo/azure.webp';
  }
  
  // Special handling for Vertex providers
  if (normalizedName.startsWith('vertex')) {
    return '/model_logo/vertex.png';
  }
  
  // Return a default provider icon
  return '/model_logo/default.webp';
}

/**
 * Generate summary with best providers in each category
 */
function generateSummary(allProviders: ProviderStats[]): ProviderRankingData['summary'] {
  if (allProviders.length === 0) {
    return {
      bestOpenSource: null,
      bestClosedSource: null,
      mostCostEfficient: null,
      fastestResponse: null,
    };
  }

  const openSourceProviders = allProviders.filter(p => p.category === 'open-source');
  const closedSourceProviders = allProviders.filter(p => p.category === 'closed-source');

  return {
    bestOpenSource: openSourceProviders.length > 0 
      ? openSourceProviders.reduce((best, current) => 
          current.score.totalScore > best.score.totalScore ? current : best
        ) 
      : null,
    bestClosedSource: closedSourceProviders.length > 0 
      ? closedSourceProviders.reduce((best, current) => 
          current.score.totalScore > best.score.totalScore ? current : best
        ) 
      : null,
    mostCostEfficient: allProviders.reduce((best, current) => 
      current.score.costEfficiency > best.score.costEfficiency ? current : best
    ),
    fastestResponse: allProviders.reduce((best, current) => 
      current.metrics.avgLatency > 0 && (best.metrics.avgLatency === 0 || current.metrics.avgLatency < best.metrics.avgLatency) 
        ? current : best
    ),
  };
}

/**
 * Format cost for display (per million tokens)
 */
export function formatCost(costPerToken: number): string {
  if (costPerToken === 0) return "$0.00";
  
  // Convert to cost per million tokens for readability
  const costPerMillion = costPerToken * 1000000;
  
  if (costPerMillion < 0.01) return `$${costPerMillion.toFixed(4)}`;
  if (costPerMillion < 1) return `$${costPerMillion.toFixed(3)}`;
  if (costPerMillion < 100) return `$${costPerMillion.toFixed(2)}`;
  return `$${costPerMillion.toFixed(1)}`;
}

/**
 * Format latency for display
 */
export function formatLatency(latency: number): string {
  if (latency === 0) return "N/A";
  if (latency < 1000) return `${Math.round(latency)}ms`;
  return `${(latency / 1000).toFixed(1)}s`;
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Generate production insights from provider stats
 */
function generateProductionInsights(allProviders: ProviderStats[]): ProductionInsights {
  if (allProviders.length === 0) {
    return {
      mostSelected: null,
      mostReliable: null,
      speedChampion: null,
      priceLeader: null,
      overallChampion: null,
      totalProviders: 0,
      totalRequests: 0,
      avgSelectionBias: 0,
    };
  }

  // Calculate selection frequency and update metrics
  const totalSelections = allProviders.reduce((sum, p) => sum + p.metrics.totalRequests, 0);
  allProviders.forEach(provider => {
    provider.metrics.selectionFrequency = totalSelections > 0
      ? provider.metrics.totalRequests / totalSelections
      : 0;
    provider.score.selection = provider.metrics.selectionFrequency * 100;
  });

  return {
    mostSelected: allProviders.reduce((best, current) =>
      current.metrics.selectionFrequency > best.metrics.selectionFrequency ? current : best
    ),
    mostReliable: allProviders.reduce((best, current) =>
      current.metrics.completionRate > best.metrics.completionRate ? current : best
    ),
    speedChampion: allProviders.reduce((best, current) =>
      current.metrics.tokensPerSecond > best.metrics.tokensPerSecond ? current : best
    ),
    priceLeader: allProviders.reduce((best, current) =>
      current.metrics.costPerToken < best.metrics.costPerToken ? current : best
    ),
    overallChampion: allProviders.reduce((best, current) =>
      current.score.totalScore > best.score.totalScore ? current : best
    ),
    totalProviders: allProviders.length,
    totalRequests: totalSelections,
    avgSelectionBias: calculateSelectionBias(allProviders),
  };
}

/**
 * Calculate selection bias (how evenly distributed selections are)
 */
function calculateSelectionBias(providers: ProviderStats[]): number {
  if (providers.length === 0) return 0;
  
  const totalRequests = providers.reduce((sum, p) => sum + p.metrics.totalRequests, 0);
  if (totalRequests === 0) return 0;
  
  const expectedPerProvider = 1 / providers.length;
  const variance = providers.reduce((sum, provider) => {
    const actualFreq = provider.metrics.totalRequests / totalRequests;
    return sum + Math.pow(actualFreq - expectedPerProvider, 2);
  }, 0) / providers.length;
  
  return Math.sqrt(variance);
}

/**
 * Group providers by model families
 */
function groupProvidersByModelFamilies(providers: ProviderStats[]): ModelFamily[] {
  // Track models per provider per family
  const familyData = new Map<string, {
    models: Set<string>;
    providerModels: Map<string, string[]>;
  }>();

  // First pass: collect models by family and provider
  providers.forEach(provider => {
    provider.metrics.popularModels.forEach(model => {
      const family = extractModelFamily(model);
      
      if (!familyData.has(family)) {
        familyData.set(family, {
          models: new Set(),
          providerModels: new Map(),
        });
      }
      
      const data = familyData.get(family)!;
      data.models.add(model);
      
      if (!data.providerModels.has(provider.name)) {
        data.providerModels.set(provider.name, []);
      }
      data.providerModels.get(provider.name)!.push(model);
    });
  });

  // Second pass: create ModelFamily objects
  return Array.from(familyData.entries())
    .map(([familyName, data]) => {
      // Get providers that have models in this family
      const familyProviders: ModelFamilyProvider[] = [];
      
      providers.forEach(provider => {
        const providerModelsInFamily = data.providerModels.get(provider.name);
        if (providerModelsInFamily && providerModelsInFamily.length > 0) {
          familyProviders.push({
            name: provider.name,
            category: provider.category,
            logo: provider.logo || '',
            models: providerModelsInFamily,
            metrics: provider.metrics,
            score: provider.score,
            rank: 0, // Will be set below
          });
        }
      });
      
      // Rank providers within this family
      const rankedProviders = familyProviders
        .sort((a, b) => b.score.totalScore - a.score.totalScore)
        .map((provider, index) => ({
          ...provider,
          rank: index + 1,
        }));

      return {
        name: familyName,
        models: Array.from(data.models),
        providers: rankedProviders,
      };
    })
    .filter(family => family.providers.length > 0)
    .sort((a, b) => b.providers.length - a.providers.length); // Sort by number of providers
}

/**
 * Extract model family from model name
 */
function extractModelFamily(modelName: string): string {
  const name = modelName.toLowerCase();
  
  // Llama models
  if (name.includes('llama')) {
    if (name.includes('code')) return 'CodeLlama';
    if (name.includes('3.1')) return 'Llama 3.1';
    if (name.includes('3.2')) return 'Llama 3.2';
    if (name.includes('3')) return 'Llama 3';
    return 'Llama';
  }
  
  // Code models
  if (name.includes('code') || name.includes('star')) return 'Code Models';
  
  // Mistral models
  if (name.includes('mistral')) return 'Mistral';
  
  // Embedding models
  if (name.includes('embed') || name.includes('bge') || name.includes('e5')) return 'Embeddings';
  
  // Qwen models
  if (name.includes('qwen')) return 'Qwen';
  
  // Gemma models
  if (name.includes('gemma')) return 'Gemma';
  
  // DeepSeek models
  if (name.includes('deepseek')) return 'DeepSeek';
  
  // Default fallback
  return 'Other Models';
}

/**
 * Enhanced provider ranking data generation
 */
export function generateEnhancedProviderRankingData(usageItems: UsageItem[]): ProviderRankingData {
  // Get base ranking data
  const baseData = processUsageDataForProviders(usageItems);
  
  // Generate enhanced insights
  const allProviders = [...baseData.openSource, ...baseData.closedSource];
  const insights = generateProductionInsights(allProviders);
  const modelFamilies = groupProvidersByModelFamilies(allProviders);
  
  return {
    ...baseData,
    insights,
    modelFamilies,
    totalTransactions: usageItems.length,
  };
}