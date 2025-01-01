import { AppError } from '@/components/AppError/AppError.js';

export function AppNotFound() {
  return (
    <AppError
      title="App not found"
      subtitle="This application doesn't exist or was hidden by the owner"
    />
  );
}