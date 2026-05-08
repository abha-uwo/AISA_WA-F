'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardInboxRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/client/inbox'); }, [router]);
  return null;
}
