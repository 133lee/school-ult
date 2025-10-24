"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return { user, loading, logout };
}
