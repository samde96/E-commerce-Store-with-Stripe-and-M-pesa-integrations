import React from "react";
import { Facebook, Instagram, TwitterIcon } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const socialLinks = [
  {
    title: "Facebook",
    href: "https://www.facebook.com/",
    icon: <Facebook />,
  },
  {
    title: "Twitter",
    href: "https://twitter.com/",
    icon: <TwitterIcon />,
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/",
    icon: <Instagram />,
  },
];

const SocialMedia = ({ className, iconClassName, tooltipClassName }) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3.5", className)}>
        {socialLinks.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 border rounded-full hover:text-white hover:border-green-500 hoverEffect",
                  iconClassName
                )}
              >
                {item.icon}
              </Link>
            </TooltipTrigger>
            <TooltipContent
              className={cn("bg-white font-semibold", tooltipClassName)}
            >
              {item.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SocialMedia;