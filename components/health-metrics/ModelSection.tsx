import React, { useState } from 'react';

interface ModelSectionProps {
  modelName: string;
  children: React.ReactNode;
  providerStatuses: ('loading' | 'error' | 'success')[];
  providerCount: number;
  organization?: string;
}

const ModelSection: React.FC<ModelSectionProps> = ({ 
  modelName, 
  children, 
  providerStatuses, 
  providerCount,
  organization 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Determine logo path based on organization or model name
  const getLogoPath = () => {
    if (organization) {
      const baseLogoPath = `/model_logo/${organization.toLowerCase().replace(/\s+/g, '-')}`;
      const logoExtensions = ['.webp', '.png', '.svg'];
      
      for (const ext of logoExtensions) {
        const potentialPath = `${baseLogoPath}${ext}`;
        return potentialPath;
      }
    }
    return '';
  };

  const logoPath = getLogoPath();

  // Determine overall status for the model section
  const overallStatus = providerStatuses.some(status => status === 'error')
    ? 'error'
    : providerStatuses.every(status => status === 'success')
      ? 'success'
      : 'loading';

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
             <img src={logoPath} alt={`${organization || modelName} Logo`} className="h-6 w-6 mr-3 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
          )}
          {modelName} {!isOpen && `(${providerCount} providers)`}
        </div>
        <span className="transform transition-transform duration-200">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="p-4 w-full">{children}</div>}
    </div>
  );
};

export default ModelSection;
