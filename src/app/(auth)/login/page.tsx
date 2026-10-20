import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Masuk - Fluenzy Pronounce AI',
  description: 'Masuk ke platform pembelajaran pelafalan bahasa Inggris berbasis AI.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
