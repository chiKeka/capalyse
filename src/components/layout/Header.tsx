"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import Button from "../ui/Button";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  useClickOutside<HTMLDivElement>(mobileNavRef, () => {
    setMobileMenuOpen(false);
  });

  return (
    <nav className="bg-white border-b-[0.5px] border-[#EEF6F4] sticky top-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center space-x-2">
              <Image
                src={"/logo.png"}
                width={159.26}
                height={37.9}
                alt="capalyze"
              />
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navlinks.map((link) => (
                <Link
                  key={link.text}
                  href={link.url}
                  className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="tertiary"
              size="medium"
              className="hover:text-gray-700 text-sm !font-bold text-green"
            >
              Log In
            </Button>
            <Button variant="primary" size="medium" iconPosition="right">
              Get Started
            </Button>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden" ref={mobileNavRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navlinks.map((link) => (
              <Link
                key={link.text}
                href={link.url}
                className="text-gray-500 block px-3 py-2 text-base font-medium"
              >
                {link.text}
              </Link>
            ))}

            <div className="px-3 py-2 space-x-2">
              <Button
                variant="tertiary"
                size="medium"
                className="hover:text-gray-700 text-sm !font-bold text-green"
              >
                Log In
              </Button>
              <Button variant="primary" size="medium" iconPosition="right">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
const navlinks = [
  {
    text: "About",
    url: "/about",
  },
  {
    text: "For SMEs",
    url: "/SMEs",
  },
  {
    text: "For Investors",
    url: "/investors",
  },
  {
    text: "Resources",
    url: "/resources",
  },
  {
    text: "Contact",
    url: "/contact",
  },
];
