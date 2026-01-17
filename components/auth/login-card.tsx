"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { LuKeyRound, LuUserRound } from "react-icons/lu";
import Link from "next/link";
import {
  Loader2,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { LoginSocialButtons } from "./login-social-buttons";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type MessageType = "error" | "warning" | "success";

interface FormMessageWithTypeProps {
  message?: string;
  type?: MessageType;
}

const FormMessageWithType = ({
  message,
  type = "error",
}: FormMessageWithTypeProps) => {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 text-red-600 border-red-200",
    warning: "bg-orange-50 text-orange-600 border-orange-200",
    success: "bg-green-50 text-green-600 border-green-200",
  };

  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle2,
  };

  const Icon = icons[type];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${styles[type]}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export const LoginCard = () => {
  const { login } = useAuth();
  const [isPending, setIsPending] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string>("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsPending(true);
    setLoginError("");
    try {
      await login(values);
    } catch (error: any) {
      setLoginError(error?.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-none shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">
            Selamat Datang Kembali
          </CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses akun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Global Login Error */}
              {loginError && (
                <FormMessageWithType message={loginError} type="error" />
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <LuUserRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />

                        <Input
                          placeholder="Email Address"
                          autoComplete="off"
                          {...field}
                          disabled={isPending}
                          className="h-12 bg-neutral-50 border-none ring-orange-500 pl-10"
                        />
                      </div>
                    </FormControl>
                    {form.formState.errors.email && (
                      <FormMessageWithType
                        message={form.formState.errors.email.message}
                        type="error"
                      />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <LuKeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 " />

                        <Input
                          placeholder="Password"
                          type="password"
                          {...field}
                          disabled={isPending}
                          className="h-12 bg-neutral-50 border-none ring-orange-500 pl-12"
                        />
                      </div>
                    </FormControl>
                    {form.formState.errors.password && (
                      <FormMessageWithType
                        message={form.formState.errors.password.message}
                        type="error"
                      />
                    )}
                    <div className="flex items-center justify-end">
                      <Link
                        href="#"
                        className="text-xs font-thin text-blue-600 hover:underline"
                      >
                        Lupa password?
                      </Link>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 font-normal bg-orange-500 text-white cursor-pointer hover:bg-orange-600"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk ke Akun
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
