import Button from "../ui/Button";

type Props = {
  data: string[];
  imageSrc: string;
  headerTag: string;
  reverse?: boolean;
};

function Cta2({ data, imageSrc, headerTag, reverse }: Props) {
  return (
    <section className="bg-green  w-full h-auto">
      <div
        className={`max-w-7xl items-center gap-8 justify-center mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        } py-[64px]`}
      >
        <img
          src={imageSrc}
          alt="SME benefit"
          className="rounded-2xl shadow-2xl w-auto lg:h-[35rem] "
        />
        <div className="flex flex-col gap-10">
          <p className="text-4xl text-[#F4F6F8] font-bold text-start">
            {headerTag}
          </p>
          <div className="flex flex-col items-start gap-6">
            {data.map((list, i) => {
              return (
                <div className="flex gap-3 items-center">
                  <img src={"/icons/verifyCheck.svg"} className=" w-8 h-8" />
                  <p className="text-base font-normal text-[#F4F6F8] ">
                    {list}
                  </p>
                </div>
              );
            })}
            <Button variant="secondary">Sign Up Now</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cta2;
