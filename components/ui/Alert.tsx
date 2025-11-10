import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from './Card';
import { RefreshCw } from 'lucide-react';

interface AlertProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

const Alert: React.FC<AlertProps> = ({ title, message, onRetry }) => {
  return (
    <Card className="border-l-4 border-red-500 bg-red-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="whitespace-pre-wrap">{message}</p>
          </div>
           {onRetry && (
            <div className="mt-4">
              <div className="-ml-1 flex">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  <RefreshCw className="h-4 w-4"/>
                  Reintentar Conexión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Alert;
