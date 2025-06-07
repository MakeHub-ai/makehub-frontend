export interface StreamMetrics {
  provider: string;
  latency: number;
  inputTokenCount: number;  // Added for input tokens
  outputTokenCount: number; // Added for output tokens
  throughput: number[];
  totalCost: number;
  startTime?: number;
  lastChunkTime?: number;
}

export const calculateMetrics = {
  initializeMetrics: (provider: string): StreamMetrics => ({
    provider,
    latency: 0,
    inputTokenCount: 0,
    outputTokenCount: 0,
    throughput: [],
    totalCost: 0,
    startTime: Date.now(),
  }),

  // Add new constant for characters per token
  CHARS_PER_TOKEN: 5.5909,

  // Helper to count tokens in a string (simple approximation)
  countTokens: (text: string): number => {
    const charCount = text.length;
    return Math.ceil(charCount / calculateMetrics.CHARS_PER_TOKEN);
  },

  updateTokenCounts: (metrics: StreamMetrics, inputText: string, outputChunk: string) => {
    // Count input tokens only once when first chunk arrives
    if (metrics.inputTokenCount === 0) {
      metrics.inputTokenCount = calculateMetrics.countTokens(inputText);
    }
    // Add output tokens from new chunk
    metrics.outputTokenCount += calculateMetrics.countTokens(outputChunk);
    
    return {
      inputTokens: metrics.inputTokenCount,
      outputTokens: metrics.outputTokenCount
    };
  },

  updateLatency: (metrics: StreamMetrics): number => {
    if (!metrics.latency && metrics.startTime) {
      metrics.latency = Date.now() - metrics.startTime;
    }
    return metrics.latency;
  },

  updateThroughput: (metrics: StreamMetrics, chunkTokens: number): number[] => {
    const currentTime = Date.now();
    if (metrics.lastChunkTime) {
      const timeDiff = currentTime - metrics.lastChunkTime;
      const chunkThroughput = chunkTokens / (timeDiff / 1000); // tokens per second
      metrics.throughput.push(chunkThroughput);
    }
    metrics.lastChunkTime = currentTime;
    return metrics.throughput;
  },

  calculateTotalCost: (
    inputTokens: number,
    outputTokens: number,
    inputPrice: number,
    outputPrice: number
  ): number => {
    const inputCost = (inputTokens * inputPrice) / 1_000_000;
    const outputCost = (outputTokens * outputPrice) / 1_000_000;
    return inputCost + outputCost;
  },

  calculateThroughput: (metrics: StreamMetrics): number => {
    if (!metrics.startTime || metrics.outputTokenCount === 0) return 0;
    const totalTime = (Date.now() - metrics.startTime) / 1000; // seconds
    return metrics.outputTokenCount / totalTime;
  }
};
