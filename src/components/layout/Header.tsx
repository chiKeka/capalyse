"use client";
import { useClickOutside } from "@/hooks/use-click-outside";
import { classNames } from "@/lib/uitils";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import GetStarted from "./GetStarted";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useClickOutside<HTMLDivElement>(mobileNavRef, () => {
    setMobileMenuOpen(false);
  });

  return (
    <motion.nav
      initial={{
        y: 0,
        backgroundColor: "rgba(255, 255, 255, 0)",
      }}
      animate={{
        y: isVisible ? 0 : -138,
        backgroundColor:
          isVisible && lastScrollY > 0 ? "rgba(255, 255, 255,1)" : "rgba(255, 255, 255, 0)",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white border-b-[0.5px] border-[#EEF6F4] sticky top-0 z-50 py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center space-x-2">
              <Image src={"/logo.png"} width={159.26} height={37.9} alt="Capalyse" />
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navlinks.map((link) => (
                <Link
                  key={link.text}
                  href={link.url}
                  className={classNames(
                    "hover:text-teal-600 px-3 py-2 text-sm transition-all duration-300",
                    pathname === link.url ? "text-green font-medium" : "",
                  )}
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
              onClick={() => router.push("/signin")}
              className="hover:text-gray-700 text-sm !font-bold text-green"
            >
              Log In
            </Button>

            <GetStarted
              component={
                <Button variant="primary" size="medium" iconPosition="right">
                  Get Started
                </Button>
              }
            />
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                onClick={() => setMobileMenuOpen(false)}
                className={classNames(
                  "block px-3 py-2 text-base transition-all duration-300",
                  pathname === link.url ? "text-green font-medium" : "",
                )}
              >
                {link.text}
              </Link>
            ))}

            <div className="px-3 py-2 space-x-2">
              <Button
                onClick={() => router.push("/signin")}
                variant="tertiary"
                size="medium"
                className="hover:text-gray-700 text-sm !font-bold text-green"
              >
                Log In
              </Button>

              <GetStarted
                component={
                  <Button variant="primary" size="medium" iconPosition="right">
                    Get Started
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </motion.nav>
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
  // {
  //   text: "For Organisations",
  //   url: "/organizations",
  // },
  {
    text: "Resources",
    url: "/resources",
  },
  {
    text: "Contact",
    url: "/contact",
  },
];
