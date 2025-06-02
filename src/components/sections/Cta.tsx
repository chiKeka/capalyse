import Button from '../ui/Button';
import { motion } from 'framer-motion';
import { Waitlist } from './waitlist';
import { useState } from 'react';

type Props = {
  heading: React.ReactNode;
  text?: string;
};

const Cta = ({ heading, text }: Props) => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  return (
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0.5 }}
      viewport={{ once: true, amount: 0.8 }}
      className="py-20 px-4"
      transition={{ ease: 'easeInOut', duration: 0.75 }}
    >
      <div className="container mx-auto text-center bg-[#E4F9F3] border border-primary-green-2 rounded-3xl relative">
        <div className="absolute inset-0 h-full">
          <img
            src={'/images/cta-img.png'}
            alt="image"
            className="object-cover xl:object-end h-full w-full"
          />
        </div>
        <div className="py-20 relative z-10">
          <h2 className="text-4xl font-bold mb-6">{heading}</h2>
          <p className="font-normal text-black my-3 text-base ">
            {text ?? text}
          </p>
          <Button
            onClick={() => setWaitlistOpen(true)}
            iconPosition="right"
            size="medium"
          >
            Get Started
          </Button>
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
};

export default Cta;
