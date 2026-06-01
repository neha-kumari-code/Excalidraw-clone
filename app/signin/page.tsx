"use client"
import { Pencil } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useState } from "react";
export default function SignIn() {
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-sky-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded shadow-xl shadow-gray-200 p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
            <Pencil size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-600">
            Excalidraw
          </span>
        </div>

        {/* Heading */}
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Log in or sign up
          </h1>
          <p className="text-slate-500">
            Continue to access your drawings and collaborate.
          </p>
        </div>

        {/* Form */}
        <div className="mt-8 space-y-6">
          {/* Email */}
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-slate-500">
              Email
            </label>

            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full rounded border-2 border-slate-400 bg-white px-2 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-slate-500">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full rounded border-2 border-slate-400 bg-white px-2 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Continue */}
          <button className="w-full rounded cursor-pointer bg-slate-900 py-2 font-medium text-white transition hover:bg-slate-800"
          onClick={()=>signIn("credentials",{
            email,password
          })}
          >
            Continue
          </button>

          {/* OR */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-300"></div>
            <span className="text-sm text-slate-500">OR</span>
            <div className="h-px flex-1 bg-slate-300"></div>
          </div>

          {/* Google */}
          <button className="w-full cursor-pointer flex items-center justify-center gap-3 rounded border-2 border-slate-300 bg-white py-2 font-medium text-slate-700 hover:bg-slate-50"
          onClick={()=>signIn("google")}
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}