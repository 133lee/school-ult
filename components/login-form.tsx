"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, AlertCircle } from "lucide-react";

// Dummy user credentials
const DUMMY_USERS = {
  "admin@school.com": { password: "admin123", role: "ADMIN", name: "Admin User" },
  "teacher@school.com": { password: "teacher123", role: "TEACHER", name: "Teacher User" },
  "student@school.com": { password: "student123", role: "STUDENT", name: "Student User" },
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check credentials
    const user = DUMMY_USERS[email as keyof typeof DUMMY_USERS];

    if (!user || user.password !== password) {
      setError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    // Store user in localStorage (temporary solution)
    localStorage.setItem(
      "user",
      JSON.stringify({
        email,
        role: user.role,
        name: user.name,
      })
    );

    // Route based on role
    switch (user.role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "TEACHER":
        router.push("/teacher");
        break;
      case "STUDENT":
        router.push("/student");
        break;
      default:
        setError("Invalid user role");
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">School Management System</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)} {...props}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </FieldGroup>

            <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  <strong>Admin:</strong> admin@school.com / admin123
                </p>
                <p>
                  <strong>Teacher:</strong> teacher@school.com / teacher123
                </p>
                <p>
                  <strong>Student:</strong> student@school.com / student123
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
