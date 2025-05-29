import Button from '../ui/Button';

type Props = {
  heading: React.ReactNode;
  text?: string;
};

const Cta = ({ heading, text }: Props) => {
  return (
    <section className="py-20 px-4">
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
          <Button iconPosition="right" size="medium">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Cta;
