"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "./ui/sidebar";
import { Home, Bot, Hammer, LayoutDashboard, Settings, Search, ChevronDown, HatGlasses, Calendar, BookOpen, Clock, Users, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import "../app/globals.css";

const THEMES = {
  light: { name: "Light" },
  dark: { name: "Dark" },
  rosepine: { name: "Rose Pine" },
};

const coursesData = [
  {
    id: 1,
    title: "Global Studies I (Eng 9 & World Geography)",
    teacher: "Someone",
    color: "bg-blue-500",
    notifications: 3
  },
  {
    id: 2,
    title: "Biology",
    teacher: "Someone",
    color: "bg-green-500",
    notifications: 1
  },
  {
    id: 3,
    title: "French III (VIRTUAL)",
    teacher: "Someone",
    color: "bg-blue-700",
    notifications: 0
  },
  {
    id: 4,
    title: "Geometry",
    teacher: "Someone",
    color: "bg-green-600",
    notifications: 2
  },
  {
    id: 5,
    title: "Computer Science Investigations",
    teacher: "Someone",
    color: "bg-purple-600",
    notifications: 5
  },
  // {
  //   id: 6,
  //   title: "Raptor Rotation 25-26",
  //   teacher: "",
  //   color: "bg-blue-600",
  //   notifications: 0
  // },
  {
    id: 7,
    title: "Health and PE 10",
    teacher: "Someone",
    color: "bg-red-600",
    notifications: 1
  },
  {
    id: 8,
    title: "9th Grade Academy 2025",
    teacher: "Someone",
    color: "bg-orange-700",
    notifications: 0
  }
];

export function courses({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [theme, setTheme] = useState("rosepine");

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
    <div className="flex w-full h-screen transition-colors bg-grey-50 dark:bg-neutral-900">
      <Sidebar
        open={open}
        setOpen={setOpen}
        animate
        className="relative"
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

            <CustomDropdown
              hovered={hovered}
              theme={theme}
              setTheme={setTheme}
            />
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
  <div className="flex flex-col w-full h-full text-gray-800 dark:text-gray-200">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Your courses</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here are your enrolled courses.</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <BookOpen className="h-4 w-4" />
          All Courses
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors">
          <Calendar className="h-4 w-4" />
          Calendar
        </button>
      </div>
    </div>

    <div className="flex gap-6 mb-6">
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium">8 Enrolled Courses</span>
      </div>
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-red-700 dark:text-red-400 rounded-lg">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">12 Unfinished Assignments</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">4 New Announcements</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {coursesData.map((course) => (
        <div
          key={course.id}
          className="bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className={cn("h-32 relative", course.color)}>
            <div className="absolute top-3 right-3">
              <button className="w-8 h-8 bg-black/20 backdrop-blur-sm rounded-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            {course.notifications > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {course.notifications}
              </div>
            )}
            <div className="absolute bottom-3 left-3 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {course.teacher}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Last accessed 2 days ago</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Enrolled</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

  </div>
);