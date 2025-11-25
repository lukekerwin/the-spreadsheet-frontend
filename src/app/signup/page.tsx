import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
    title: 'Create Account - The Spreadsheet',
    description: 'Create a new account',
};

export default function RegisterPage() {
    return <RegisterForm />;
}
