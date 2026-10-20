import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Daftar Akun - Fluenzy Pronounce AI',
  description: 'Daftar akun gratis dan mulai perbaiki aksen bahasa Inggris Anda.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#080E15] text-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
