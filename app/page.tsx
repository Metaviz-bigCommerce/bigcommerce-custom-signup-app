'use client';
import { useSession } from '@/context/session';
import { redirect } from 'next/navigation';

export default function Page() {
  const { context } = useSession();
  redirect(`/dashboard?context=${context}`);
}

