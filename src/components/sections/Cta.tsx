import Button from '../ui/Button';

const Cta = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto text-center bg-[#E4F9F3] border border-primary-green-2 rounded-3xl relative">
        <div className="absolute inset-0 h-full">
          <img
            src={'/images/cta-img.png'}
            alt="image"
            className="object-cover xl:object-end h-full w-full"
          />
        </div>
        <div className="py-20">
          <h2 className="text-4xl font-bold mb-6">
            Ready to make{' '}
            <span className="text-green">
              smarter <br />
              capital moves?
            </span>
          </h2>
          <Button iconPosition="right" size="medium">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Cta;
