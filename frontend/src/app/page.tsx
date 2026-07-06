"use client";
import PositionsPage from '../components/PositionsPage';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Page() {
  return (
    <ErrorBoundary>
      <PositionsPage />
    </ErrorBoundary>
  );
}
