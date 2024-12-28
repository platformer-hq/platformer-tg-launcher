import { AppError } from '@/components/AppError/AppError.js';

export function InvalidInitData() {
  return (
    <AppError
      title="Init data is missing"
      subtitle="For some reason, the init data is missing. It is more likely that the application was launched improperly"
    />
  );
}