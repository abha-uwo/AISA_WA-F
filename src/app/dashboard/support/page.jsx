'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardSupportRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/client/support'); }, [router]);
  return null;
}
