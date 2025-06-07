export function getProviderLogo(provider?: string): string {
  if (!provider) return '/model_logo/default.webp';
  
  const normalizedProvider = provider.toLowerCase();
  
  const logoMapping: { [key: string]: string } = {
    'openai': '/model_logo/openai.webp',
    'anthropic': '/model_logo/anthropic.webp',
    'mistral': '/model_logo/mistral.webp',
    'meta': '/model_logo/meta.webp',
    'google': '/model_logo/google.webp',
    'default': '/model_logo/default.webp'
  };

  return logoMapping[normalizedProvider] || logoMapping.default;
}
