"use client";
import React from "react";
import { signup as SignupForm } from "@/components/form";

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
  <SignupForm />
    </div>
  );
}
