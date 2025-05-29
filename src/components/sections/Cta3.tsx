import { ReactNode } from "react";

type Props = {
  smsEcardData: { caption: string; text: string }[];
  header: ReactNode;
  text: string;
};

function InverstmentReadiness({ smsEcardData, header, text }: Props) {
  return (
    <section className="py-20  relative">
      <div className="lg:max-w-7xl w-[95%] mx-auto py-8 px-4 lg:py-[69px] lg:px-[176px] bg-[#F4FFFC] rounded-[24px] border-1 border-[#ABD2C7]">
        <div className="w-full items-center flex-col flex ">
          <h3 className="text-4xl font-bold text-center">{header}</h3>
          <p className="text-base text-black/500 mt-6 font-normal leading-[25px] text-center lg:max-w-[585px]">
           {text}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 items-center justify-center py-8  w-full gap-4 h-auto">
          {smsEcardData.map((list, i) => {
            return <Cards {...list} />;
          })}
        </div>
      </div>
    </section>
  );
}

export default InverstmentReadiness;

const Cards = ({ caption, text }: { caption: string; text: string }) => {
  return (
    <div className="rounded-2xl border-1 flex flex-row gap-3 px-6 py-7 xl:h-[131px] lg:h-[155px] border-[#E4E4E7] bg-white ">
      <img src={"/icons/checkIcon.svg"} className=" w-4 h-4" />
      <p className="text-base font-bold">
        {caption}
        <span className="font-normal">{text}</span>
      </p>
    </div>
  );
};
