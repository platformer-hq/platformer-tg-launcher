import { AppError } from '@/components/AppError/AppError.js';

export function InvalidAppID() {
  return (
    <AppError
      title="Application is configured improperly"
      subtitle={
        <>
          <b>app_id</b>
          {' '}query parameter should be defined and is expected to be an&nbsp;integer
        </>
      }
    />
  );
}