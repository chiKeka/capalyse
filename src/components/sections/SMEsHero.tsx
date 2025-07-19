import { ReactNode, useState } from 'react';
import Button from '../ui/Button';
import { motion } from 'framer-motion';
import { Waitlist } from './waitlist';
import { containerVariants } from '@/lib/animations';
import { useRouter } from 'next/navigation';

type Props = {
  reverse?: boolean;
  text?: string;
  header: ReactNode;
  headerImage: string;
  tag: string;
};

function SMEsHero({ reverse, text, header, tag, headerImage }: Props) {
  const router = useRouter();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: '-100px' }}
      className="py-20 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex max-md:flex-col-reverse  justify-end gap-12 items-center ${
            reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
          }`}
        >
          <div className="xl:max-w-[588px] lg:max-w-[450px]">
            <p className="text-green text-sm font-normal mb-6">{tag}</p>
            <h1 className="text-5xl lg:text-4xl xl:text-[3rem] font-bold leading-tight mb-6">
              {header}
            </h1>

            <p className="mb-8 leading-relaxed">
              {text?.split('<br/>').map((line, index, arr) => (
                <span key={index}>
                  {line}
                  {index !== arr.length - 1 && <br />}
                </span>
              ))}
            </p>

            <Button
              onClick={() => router.push('/sme/signup')}
              iconPosition="right"
              className="font-bold"
            >
              Get Started
            </Button>
          </div>

          <div className="relative md:h-[35rem]">
            <img
              src={headerImage}
              alt="SME Hero"
              className="rounded-2xl shadow-2xl w-full h-[35rem] object-cover"
            />
          </div>
        </div>
      </div>
      <Waitlist
        isOpen={waitlistOpen}
        setIsOpen={setWaitlistOpen}
        title="Don’t Miss Out, Join the Waitlist"
        desc="Join our waitlist to secure your spot and get early access. Be part of the growing community of businesses preparing to unlock the full experience."
      />
    </motion.section>
  );
}

export default SMEsHero;
