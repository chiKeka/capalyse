import Button from '../ui/Button';
import Input from '../ui/Inputs';
import { motion } from 'framer-motion';

type Props = {};

function Contact({}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0.5 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ ease: 'easeInOut', duration: 0.75 }}
      className=" py-20 relative"
    >
      <div className="max-w-7xl lg:flex-row flex flex-col  justify-between mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="w-full max-w-md mb-8">
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Contact <span className="text-green"> our team</span>
            <br />
          </h1>

          <p>
            Got any questions or concerns about any of our services? We really
            can't wait to hear from you!
          </p>
        </div>
        <div className="w-full lg:max-w-xl">
          <Input
            name="name"
            onChange={() => {}}
            type="text"
            value=""
            label="Full Name"
            placeholder="John Doe"
          />
          <Input
            name="email"
            onChange={() => {}}
            type="email"
            value=""
            label="Email"
            placeholder="You@company.com"
          />
          <Input
            name="phone"
            onChange={() => {}}
            type="phone"
            value=""
            label="Phone Number"
            placeholder="2340000000"
          />
          <Input
            name="message"
            onChange={() => {}}
            type="textarea"
            value=""
            label="Message"
            placeholder="Leave us a message"
          />
          <div className="w-full justify-end items-end flex">
            <Button>Send Message</Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Contact;
