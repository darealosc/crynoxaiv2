"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "./ui/sidebar";
import { Home, Bot, Hammer, LayoutDashboard, Settings, Search, ChevronDown, HatGlasses, HammerIcon, Upload, FileText, BookOpen, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import "../app/globals.css";
import { signup } from "./form";

export function AISidebar({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(true);

const mainLinks = [
  { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Tools", href: "/pages/tools", icon: <Hammer className="h-5 w-5" /> },
  { label: "AI", href: "/pages/ai", icon: <Bot className="h-5 w-5" /> },
  { label: "Classes", href: "/classes", icon: <HatGlasses className="h-5 w-5" /> },

];


  const bottomLinks = [
    { label: "Settings", href: "/", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex w-full h-screen transition-colors">
      <Sidebar
        open={open}
        setOpen={setOpen}
        animate
        className="relative"
      >
        <SidebarBody className="flex flex-col justify-between h-full py-4 px-3 relative">
          <div className="flex flex-col gap-6">
            <LogoWithText />
            <div className="flex flex-col gap-1">
              {mainLinks.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                    "hover:bg-base-200 dark:hover:bg-neutral-800",
                    "text-gray-800 dark:text-gray-200"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 relative">
            {bottomLinks.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-base-200 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200"
              />
            ))}
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex flex-1 p-6 md:p-10 rounded-xl shadow-inner overflow-auto">
        {children ?? <Dashboard />}
      </main>
    </div>
  );
}

const LogoWithText = () => {
  const { open, animate } = useSidebar();
  return (
    <a href="#" className="flex items-center gap-3 px-2">
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
        <img
          src="https://ih1.redbubble.net/image.1023214784.7024/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg"
          alt="Logo"
          className="object-cover w-full h-full"
        />
      </div>
      <span
        className={cn(
          "text-lg font-bold text-neutral-800 dark:text-neutral-200 whitespace-nowrap transition-all duration-300",
          animate
            ? open
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-2 w-0 overflow-hidden"
            : "opacity-100"
        )}
      >
        learn.ai
      </span>
    </a>
  );
};

const Dashboard = () => (
  <div className="flex flex-col items-center justify-center w-full h-full text-gray-800 dark:text-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 rounded-lg relative overflow-hidden">

    {/* Glass input */}
    <div className="relative z-10 w-full max-w-2xl">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Ask me anything..." 
          className="w-full px-4 py-3 pr-12 bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-300" 
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
    
    {/* Glass shortcut cards */}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl relative z-10">
      <div className="p-6 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 cursor-pointer group">
        <FileText className="h-8 w-8 text-blue-400 mb-3 " />
        <p className="font-semibold text-gray-800 dark:text-gray-100">Upload an Assignment</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Submit your homework</p>
      </div>
      
      <div className="p-6 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 cursor-pointer group">
        <Upload className="h-8 w-8 text-green-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
        <p className="font-semibold text-gray-800 dark:text-gray-100">Upload a File</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Add documents or resources</p>
      </div>
      
      <div className="p-6 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 cursor-pointer group">
        <BookOpen className="h-8 w-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
        <p className="font-semibold text-gray-800 dark:text-gray-100">Set a Course</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Configure your learning path</p>
      </div>
    </div>
  </div>
);
