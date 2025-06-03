import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaGithub, FaInstagram, FaTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-green text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href={'/'} className="flex items-center space-x-2 mb-6">
              <Image
                src={'/logo-white.png'}
                width={185.88}
                height={44.43}
                alt="Capalyse"
              />
            </Link>

            <div className="flex space-x-4">
              <div className="w-8 h-8">
                <FaTwitter />
              </div>
              <div className="w-8 h-8">
                <FaFacebookF />
              </div>
              <div className="w-8 h-8">
                <FaInstagram />
              </div>
              <div className="w-8 h-8">
                <FaGithub />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {company?.map((item) => (
                <li key={item.text}>
                  <a href={item.url} className="text-teal-100 hover:text-white">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              {resources?.map((item) => (
                <li key={item.text}>
                  <a href={item.url} className="text-teal-100 hover:text-white">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Help</h3>
            <ul className="space-y-3">
              {help?.map((item) => (
                <li key={item.text}>
                  <a href={item.url} className="text-teal-100 hover:text-white">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

const company = [
  { url: '#', text: 'About' },
  { url: '/SMEs', text: 'For SMEs' },
  { url: '/investors', text: 'For Investors' },
  { url: '#', text: 'Contact' },
];
const resources = [
  { url: '#', text: 'Trade Compliance' },
  { url: '#', text: 'Readiness Toolkit' },
  { url: '#', text: 'Investment Toolkit' },
];
const help = [
  { url: '#', text: 'Terms & Conditions' },
  { url: '#', text: 'Privacy Policy' },
];
