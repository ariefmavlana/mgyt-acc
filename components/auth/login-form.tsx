"use client";

import React from "react";
import { LoginHero } from "./login-hero";
import { LoginCard } from "./login-card";

export const LoginForm = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 lg:p-12 bg-neutral-100">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-soft-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row p-6">
          {/* Left Side - Hero Section */}
          <LoginHero />

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
            <LoginCard />
          </div>
        </div>
      </div>
    </div>
  );
};
