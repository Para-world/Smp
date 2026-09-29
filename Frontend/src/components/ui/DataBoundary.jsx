import React from 'react';
import { LoadingState, ErrorState, EmptyState } from './states';

export default function DataBoundary({ 
  loading, 
  error, 
  empty, 
  onRetry, 
  loadingMessage = "Loading...", 
  emptyTitle = "No data found", 
  emptyMessage = "There is nothing to display here at the moment.",
  emptyAction,
  children 
}) {
  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (empty) {
    return (
      <EmptyState 
        title={emptyTitle} 
        message={emptyMessage} 
        action={emptyAction} 
      />
    );
  }

  return <>{children}</>;
}
