'use client';

import { useRouter } from 'next/navigation';

interface PlanButtonProps {
  planId: number;
  children: React.ReactNode;
  className?: string;
}

export default function PlanButton({ planId, children, className }: PlanButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('mock_user_email') : null;
    if (userEmail) {
      router.push(`/thanh-toan?plan=${planId}`);
    } else {
      router.push(`/dang-nhap?redirect=/thanh-toan?plan=${planId}`);
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
