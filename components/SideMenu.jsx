import React from "react";
import Logo from "@/components/ui/Logo";
import { X } from "lucide-react";
import { headerData } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialMedia from "./SocialMedia";
import { useOutsideClick } from "@/hooks/hook";

const SideMenu = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const sidebarRef = useOutsideClick(onClose);
  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-50 
        w-full bg-black/50 text-white/60 shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } hoverEffect`}
    >
      <div className="min-w-72 max-w-96 bg-green-900/90 h-screen p-10 border-r border-r-green-500 flex flex-col gap-6">
        <div ref={sidebarRef} className="flex items-center justify-between gap-5">
          <Logo className="text-white" />
          <button onClick={onClose} className="hover:text-green-500 hoverEffect w-5 h-5">
            <X />
          </button>
        </div>
        <div className="flex flex-col space-y-3.5 font-semibold tracking-wide">
          {headerData.map((item) => (
            <Link
              href={item.href}
              key={item.title}
              className={`hover:text-green-500 hoverEffect ${
                pathname === item?.href && "text-white"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
        <SocialMedia />
      </div>
    </div>
  );
};

export default SideMenu;