import { containerVariants, itemVariants } from "@/lib/animations";
import { motion } from "framer-motion";
import { useState } from "react";
import Button from "../ui/Button";
import { Waitlist } from "./waitlist";

type Props = {
  heading: React.ReactNode;
  text?: string;
  buttonText?: string;
};

const Cta = ({ heading, text, buttonText }: Props) => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className="py-20 px-4"
    >
      <motion.div
        variants={itemVariants}
        className="container mx-auto text-center bg-[#E4F9F3] border border-primary-green-2 rounded-3xl relative"
      >
        <div className="absolute inset-0 h-full">
          <img
            src={"/images/cta-img.png"}
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
            {buttonText ? "Explore Opportunities" : "Get Started"}
          </Button>
        </div>
      </motion.div>
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
