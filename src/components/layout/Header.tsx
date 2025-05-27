'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Button from '../ui/Button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="bg-white border-b-[0.5px] border-[#EEF6F4] sticky top-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Image
                src={'/logo.png'}
                width={159.26}
                height={37.9}
                alt="capalyze"
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#"
                className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
              >
                For SMEs
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
              >
                For Investors
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
              >
                Resources
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-teal-600 px-3 py-2 text-sm font-medium"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="tertiary"
              size="medium"
              className="hover:text-gray-700 text-sm !font-bold text-green"
            >
              Log In
            </Button>
            <Button variant="primary" size="medium" iconPosition="right">
              Save Changes
            </Button>
          </div>

          <div className="md:hidden">
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
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <a
              href="#"
              className="text-gray-500 block px-3 py-2 text-base font-medium"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-500 block px-3 py-2 text-base font-medium"
            >
              For SMEs
            </a>{' '}
            <a
              href="#"
              className="text-gray-900 block px-3 py-2 text-base font-medium"
            >
              For Investors
            </a>
            <a
              href="#"
              className="text-gray-500 block px-3 py-2 text-base font-medium"
            >
              Resources
            </a>
            <a
              href="#"
              className="text-gray-500 block px-3 py-2 text-base font-medium"
            >
              Contact
            </a>
            <div className="px-3 py-2">
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
