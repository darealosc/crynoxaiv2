"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { Bot, Hammer, MessageSquare, Settings } from "lucide-react"; // updated icons
import { cn } from "@/lib/utils";
import "../app/globals.css";


export function AISidebar({ children }: { children?: React.ReactNode }) {
  const mainLinks = [

    { label: "AI", href: "/pages/ai", icon: <Bot className="h-5 w-5" /> },
    { label: "Tools", href: "#", icon: <Hammer className="h-4 w-4 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Chat", href: "#", icon: <MessageSquare className="h-4 w-4 text-neutral-700 dark:text-neutral-200" /> },
    { label: "Settings", href: "#", icon: <Settings className="h-4 w-4 text-neutral-700 dark:text-neutral-200" /> },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex w-full h-screen bg-gray-100 dark:bg-neutral-950")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6">
          <div className="flex flex-1 flex-col items-start gap-4 rounded-md">
            <LogoIcon />
            {mainLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1 p-6 md:p-10 bg-white dark:bg-neutral-900 rounded-md">
        {children ?? <Dashboard />}
      </div>
    </div>
  );
}

export const LogoIcon = () => (
  <a href="#" className="flex w-10 h-10 rounded-md overflow-hidden mr-1">
    <img
      src="https://ih1.redbubble.net/image.1023214784.7024/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg"
      alt="Logo"
      className="object-cover w-full h-full rounded-md"
    />
  </a>
);

const Dashboard = () => (
  <div className="flex items-center justify-center w-full h-full">

  </div>
);
