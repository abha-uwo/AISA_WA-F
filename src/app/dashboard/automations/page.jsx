'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardAutomationsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/client/automations'); }, [router]);
  return null;
}
