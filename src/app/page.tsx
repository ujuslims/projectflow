"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/projects');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading ProjectFlow...</p> {/* Optional: Add a loading spinner */}
    </div>
  );
}
