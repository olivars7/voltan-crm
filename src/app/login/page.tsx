'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LoginPageClient } from '@/components/auth/LoginPageClient';

async function login(formData: FormData): Promise<{ error: string } | void> {
  'use server';
  const key = formData.get('key') as string;

  if (key === process.env.LOGIN_KEY) {
    cookies().set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    redirect('/dashboard');
  } else {
    return { error: 'Clave incorrecta. Intenta de nuevo.' };
  }
}

export default async function LoginPage() {
  if (cookies().get('auth')) {
    redirect('/dashboard');
  }
  
  return <LoginPageClient loginAction={login} />;
}
