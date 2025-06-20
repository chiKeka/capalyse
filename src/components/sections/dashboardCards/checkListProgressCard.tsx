type Props = {
  img?: string;
  status?: string;
  caption?: string;
};

function CheckListProgressCard({ img, caption, status }: Props) {
  return (
    <div className="border-0.5 shadow-sm  border-[#E8E8E8] shadow-gray-500 w-full  h-[52px] py-2 px-4 rounded-[4px] justify-between flex items-center ">
      <div className="flex gap-2 items-center">
        <img className="w-5 h-5" src={img} />
        <p className="text-base font-normal text-[#0B0B0C] ">{caption}</p>
      </div>
      <div className=" flex gap-3 bg-[#E8E8E8] rounded-[40px] py-1 px-2 items-center justify-center">
        <div className="rounded-full w-2 bg-[#A0A4A8] h-2 " />
        <p className="text-xs font-bold text-[#A0A4A8]">{status}</p>
      </div>
    </div>
  );
}

export default CheckListProgressCard;
