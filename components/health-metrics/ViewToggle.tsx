import React from 'react';

interface ViewToggleProps {
  isModelView: boolean;
  onToggle: (isModelView: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isModelView, onToggle }) => {
  return (
    <div className="flex items-center justify-center mb-6 p-4 bg-gray-50 border rounded">
      <span className="text-sm font-medium mr-3">View by:</span>
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${!isModelView ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
          Provider
        </span>
        <button
          onClick={() => onToggle(!isModelView)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            isModelView ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={isModelView}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              isModelView ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm ${isModelView ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
          Model
        </span>
      </div>
      <div className="ml-4 text-xs text-gray-500">
        {isModelView 
          ? 'Models grouped by name, showing available providers'
          : 'Providers grouped, showing available models'
        }
      </div>
    </div>
  );
};

export default ViewToggle;
