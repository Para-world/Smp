import React from 'react';
import { AlertCircle, FileX, ShieldAlert, FileQuestion, RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from './button';

export function LoadingState({ message = "Loading data...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message = "An error occurred while loading the data.", onRetry, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title = "No data found", message = "There is nothing to display here at the moment.", action, icon: Icon = FileX, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{message}</p>
      {action}
    </div>
  );
}

export function UnauthorizedState({ message = "You don't have permission to view this resource.", onBack, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{message}</p>
      {onBack && (
        <Button onClick={onBack} variant="default">
          Go Back
        </Button>
      )}
    </div>
  );
}

export function NotFoundState({ resourceName = "Page", message, onBack, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{resourceName} Not Found</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{message || `The ${resourceName.toLowerCase()} you are looking for doesn't exist or has been moved.`}</p>
      {onBack && (
        <Button onClick={onBack} variant="outline">
          Return
        </Button>
      )}
    </div>
  );
}
