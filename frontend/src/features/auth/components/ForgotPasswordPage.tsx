import { useState } from 'react';
import { ForgotPasswordRequestForm } from '../../../components/auth/ForgotPasswordRequestForm';
import { ForgotPasswordVerifyForm } from '../../../components/auth/ForgotPasswordVerifyForm';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState<string>('');

  const handleRequestSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setStep('verify');
  };

  const handleBack = () => {
    setStep('request');
  };

  if (step === 'verify') {
    return <ForgotPasswordVerifyForm email={email} onBack={handleBack} />;
  }

  return <ForgotPasswordRequestForm onSuccess={handleRequestSuccess} />;
};
