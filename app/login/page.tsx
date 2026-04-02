import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-svh w-full bg-[#F7F9F8] text-[#1E1E1E] relative overflow-hidden">
      <div className="fixed top-6 left-12 z-50">
        <Image 
          src="/images/Instroom Logo 1.png" 
          alt="Instroom Logo" 
          width={180} 
          height={180}
          priority
          quality={95}
          className="drop-shadow-sm"
        />
      </div>

      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#1FAE5B]/8 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#0F6B3E]/6 blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#2C8EC4]/5 blur-3xl" />

      <div className="min-h-svh flex items-center justify-center relative z-20">
        <LoginForm className="bg-[#1E1E1E] text-white rounded-2xl shadow-xl p-8" />
      </div>
    </div>
  )
}
