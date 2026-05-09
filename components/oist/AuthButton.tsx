"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type AuthButtonProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

export default function AuthButton({ 
  children, 
  className, 
  size = "default",
  variant = "default" 
}: AuthButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/signIn");
    } else {

      const userRole = (session.user as any).role;
      if (userRole === "admin") {
        router.push("/AdminPanel");
      } else {
        router.push("/Dashboard");
      }
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      className={className} 
      size={size}
      variant={variant}
    >
      {children}
    </Button>
  );
}