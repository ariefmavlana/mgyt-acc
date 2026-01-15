"use client";

import Image from "next/image";

export const LoginHero = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col bg-orange-500 justify-center relative overflow-hidden rounded-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Hero Image */}
      <div className="relative z-10 w-full h-full rounded-xl overflow-hidden shadow-soft-lg">
        <img
          src="/assets/done.png"
          alt="Accounting Dashboard Preview"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
