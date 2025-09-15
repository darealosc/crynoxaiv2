"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "./ui/sidebar";
import { Home, Bot, Hammer, LayoutDashboard, Settings, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import countries from "world-countries";

export function Signup({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  const mainLinks = [
    { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Tools", href: "/pages/tools", icon: <Hammer className="h-5 w-5" /> },
    { label: "AI", href: "/pages/ai", icon: <Bot className="h-5 w-5" /> },
    { label: "Others", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
  ];
  const bottomLinks = [{ label: "Settings", href: "/", icon: <Settings className="h-5 w-5" /> }];

  return (
    <div className="flex w-full h-screen">
      <div className="relative h-full">
        <Sidebar open={open} setOpen={setOpen} animate>
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
                      "hover:bg-neutral-200 dark:hover:bg-neutral-800",
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-200"
                />
              ))}
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg rounded-2xl bg-white/20 dark:bg-neutral-900/20 backdrop-blur-xl border border-white/30 dark:border-neutral-800/30 shadow-xl p-8 flex items-center justify-center">
          {children ?? <SignupForm />}
        </div>
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

const Dropdown = ({
  value,
  setValue,
  options,
  placeholder,
}: {
  value: string;
  setValue: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg border px-3 py-2 bg-neutral-900 text-neutral-100 border-neutral-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
      >
        <span>{value ? options.find((o) => o.value === value)?.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>
      {open && (
        <div className="absolute mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-lg z-20 max-h-64 overflow-auto">
          <div className="flex items-center px-2 py-1 border-b border-neutral-700">
            <Search className="h-4 w-4 opacity-50 mr-1" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
          {filtered.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                setValue(o.value);
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-neutral-800 cursor-pointer text-sm"
            >
              {o.label}
            </div>
          ))}
          {filtered.length === 0 && <div className="px-3 py-2 text-sm opacity-50">No results</div>}
        </div>
      )}
    </div>
  );
};

const SignupForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [submitted, setSubmitted] = useState<null | Record<string, string>>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const passwordErrorLive = password && password.length < 4 ? "Password must be 4 characters or more" : undefined;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name required";
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) e.email = "Valid email required";
    if (password.length < 4) e.password = "Password must be 4 characters or more";
    if (!state) e.state = "Select a state";
    if (!country) e.country = "Select a country";
    return e;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSubmitted({ name, email, state, country });
    } else {
      setSubmitted(null);
    }
  };

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setState("");
    setCountry("");
    setErrors({});
    setSubmitted(null);
  };

  const statesList = [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
  ];

  const countriesList = countries.map((c: any) => ({
    value: c.cca2,
    label: c.name.common,
  }));

  return (
    <form onSubmit={onSubmit} onReset={reset} className="w-full space-y-6 text-neutral-200">
      <div>
        <label className="block text-[13px] font-medium mb-1 tracking-wide">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(
            "w-full rounded-lg border px-3 py-2 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500",
            errors.name ? "border-red-500" : "border-neutral-700 focus:border-blue-600",
            "focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
          )}
          placeholder="Jane Doe"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1 tracking-wide">Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "w-full rounded-lg border px-3 py-2 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500",
            errors.email ? "border-red-500" : "border-neutral-700 focus:border-blue-600",
            "focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
          )}
          placeholder="name@example.com"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1 tracking-wide">Password *</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(
            "w-full rounded-lg border px-3 py-2 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500",
            (errors.password || passwordErrorLive) ? "border-red-500" : "border-neutral-700 focus:border-blue-600",
            "focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
          )}
          placeholder="••••••"
        />
        {(passwordErrorLive || errors.password) && (
          <p className="text-xs text-red-500 mt-1">{passwordErrorLive || errors.password}</p>
        )}
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1 tracking-wide">State *</label>
        <Dropdown value={state} setValue={setState} options={statesList} placeholder="Select a state" />
        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
      </div>
      <div>
        <label className="block text-[13px] font-medium mb-1 tracking-wide">Country *</label>
        <Dropdown value={country} setValue={setCountry} options={countriesList} placeholder="Select a country" />
        {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-sm font-medium transition shadow-sm"
        >
          Submit
        </button>
        <button
          type="reset"
          className="rounded-xl border border-neutral-600 px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition"
        >
          Reset
        </button>
      </div>
      {submitted && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
          <p className="font-semibold">Submitted:</p>
          <pre className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded text-[10px] overflow-x-auto">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      )}
    </form>
  );
};
