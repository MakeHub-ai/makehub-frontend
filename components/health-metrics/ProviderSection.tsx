import React, { useState } from 'react';

interface ProviderSectionProps {
  providerName: string;
  children: React.ReactNode;
  modelStatuses: ('loading' | 'error' | 'success')[];
  modelCount: number;
}

const ProviderSection: React.FC<ProviderSectionProps> = ({ providerName, children, modelStatuses, modelCount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const baseLogoPath = `/model_logo/${providerName.split('-')[0].toLowerCase().replace(/\s+/g, '-')}`;
  const logoExtensions = ['.webp', '.png', '.svg'];
  let logoPath = '';

  // In a real app, you would check for file existence on the server or during build.
  // For this client-side component, we'll construct potential paths and rely on onError.
  // We'll iterate through extensions to find a potential path.
  // The onError will hide the image if it doesn't load.
  for (const ext of logoExtensions) {
    const potentialPath = `${baseLogoPath}${ext}`;
    // We assume the file exists and rely on onError.
    // Set the logoPath to the first potential path found.
    if (!logoPath) {
      logoPath = potentialPath;
    }
  }

  // Determine overall status for the provider section
  const overallStatus = modelStatuses.some(status => status === 'error')
    ? 'error'
    : modelStatuses.every(status => status === 'success')
      ? 'success'
      : 'loading'; // Or a neutral state if not all are success and none are error

  const getHeaderColorClass = (status: 'loading' | 'error' | 'success') => {
    switch (status) {
      case 'success':
        return 'bg-green-200 hover:bg-green-300';
      case 'error':
        return 'bg-red-200 hover:bg-red-300';
      case 'loading':
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  return (
    <div className="border border-gray-300 rounded-none shadow-none bg-white overflow-hidden">
      <button
        className={`w-full text-left font-bold text-lg p-4 transition-colors duration-200 flex justify-between items-center ${getHeaderColorClass(overallStatus)}`}
        onClick={toggleOpen}
      >
        <div className="flex items-center">
          {logoPath && (
             <img src={logoPath} alt={`${providerName} Logo`} className="h-6 w-6 mr-3 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
          )}
          {providerName} {!isOpen && `(${modelCount})`}
        </div>
        <span className="transform transition-transform duration-200">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="p-4 w-full">{children}</div>}
    </div>
  );
};

export default ProviderSection;
