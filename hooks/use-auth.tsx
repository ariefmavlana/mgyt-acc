"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  namaLengkap: string;
  username: string;
  email: string;
  role: string;
  perusahaanId: string;
  foto?: string;
  perusahaan?: {
    id: string;
    nama: string;
    kode: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: Record<string, unknown>) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Protected route logic
  useEffect(() => {
    // PENTING: Cek static asset PERTAMA sebelum cek loading
    const staticPaths = [
      "/_next",
      "/assets",
      "/images",
      "/uploads",
      "/fonts",
      "/videos",
    ];

    const isStaticAsset =
      staticPaths.some((prefix) => pathname.startsWith(prefix)) ||
      pathname.match(
        /\.(jpg|jpeg|png|gif|svg|ico|webp|pdf|css|js|woff|woff2|ttf|eot|mp4|webm)$/i,
      );

    // Jika static asset, JANGAN lakukan apa-apa
    if (isStaticAsset) {
      return;
    }

    // Setelah itu baru cek auth
    const publicPaths = ["/login", "/register", "/"];

    if (!loading && !user && !publicPaths.includes(pathname)) {
      router.push("/login");
    }

    if (
      !loading &&
      user &&
      (pathname === "/login" || pathname === "/register")
    ) {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const login = async (data: Record<string, unknown>) => {
    try {
      const res = await api.post("/auth/login", data);
      setUser(res.data.user);
      toast.success("Login berhasil! Selamat datang kembali.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg =
        axiosError.response?.data?.message ||
        "Login gagal. Cek email dan password Anda.";
      toast.error(msg);
      throw err;
    }
  };

  const registerUser = async (data: Record<string, unknown>) => {
    try {
      const res = await api.post("/auth/register", data);
      toast.success(res.data.message || "Pendaftaran berhasil! Silakan login.");
      router.push("/login");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg =
        axiosError.response?.data?.message ||
        "Pendaftaran gagal. Silakan coba lagi.";
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      router.push("/login");
      toast.info("Anda telah keluar dari sistem.");
    } catch {
      toast.error("Gagal logout.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register: registerUser,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
