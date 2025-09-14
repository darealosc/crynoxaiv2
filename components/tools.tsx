"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "./ui/sidebar";
import { Home, Bot, Hammer, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextHoverEffectDemo } from "./TextHoverEffectDemo"
import { usePathname } from "next/navigation";
import { BackgroundBoxesDemo } from "./BackgroundBoxesDemo";
import "../app/globals.css";

const THEMES = {
  light: { name: "Light" },
  dark: { name: "Dark" },
  rosepine: { name: "Rose Pine" },
};

export function SidebarDemo1({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [theme, setTheme] = useState("rosepine");
  const pathname = usePathname();

  const mainLinks = [
    { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Tools", href: "/pages/tools", icon: <Hammer className="h-5 w-5" /> },
    { label: "AI", href: "/", icon: <Bot className="h-5 w-5" /> },
    { label: "Others", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
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
     className={cn(
    "relative transition-all duration-300",
    hovered ? "w-50" : "w-50" 
  )}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
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
                    "text-gray-800 dark:text-gray-200",
                    pathname === link.href ? "active" : ""
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
            <CustomDropdown hovered={hovered} theme={theme} setTheme={setTheme} />
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex flex-1 p-6 md:p-10 rounded-xl shadow-inner overflow-auto">
        {children ?? <Dashboard />}
      </main>
    </div>
  );
}

const CustomDropdown = ({
  hovered,
  theme,
  setTheme,
}: {
  hovered: boolean;
  theme: string;
  setTheme: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "absolute bottom-14 left-0 right-0 px-3 transition-all duration-300",
        hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-base-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg shadow-md"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              open ? "rotate-180" : "rotate-0"
            )}
          />
        </button>

        {open && (
          <ul className="absolute left-0 right-0 mt-2 bg-base-100 dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-50">
            {Object.entries(THEMES).map(([key, val]) => (
              <li
                key={key}
                onClick={() => {
                  setTheme(key);
                  setOpen(false);
                }}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-base-200 dark:hover:bg-neutral-800 rounded-md",
                  theme === key ? "font-semibold bg-base-200 dark:bg-neutral-800" : ""
                )}
              >
                {val.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

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
  <div className="flex flex-col items-center justify-center w-full h-full gap-6 rounded-md">
    <div>
      
    </div>
  </div>
);
