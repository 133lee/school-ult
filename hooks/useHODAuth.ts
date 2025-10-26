import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface HODUser {
  email: string;
  role: string;
  name: string;
  department: string;
}

export const useHODAuth = () => {
  const router = useRouter();
  const [currentHOD, setCurrentHOD] = useState<HODUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user) as HODUser;
    if (parsedUser.role !== "HOD") {
      router.push("/login");
      return;
    }

    setCurrentHOD(parsedUser);
    setIsLoading(false);
  }, [router]);

  return { currentHOD, isLoading };
};
