type Props = {};

function CheckListProgressCard({}: Props) {
  return (
    <div>
      <ChecklistCard />
    </div>
  );
}

export default CheckListProgressCard;

const ChecklistCard = () => {
  return (
    <div className="border-0.5 shadow-sm  border-[#E8E8E8] shadow-gray-500 w-full md:w-[458px] h-[52px] py-2 px-4 rounded-[4px] justify-between flex items-center ">
      <div>
        <img />
        <p className="text-base font-normal text-[#0B0B0C] ">
          Complete profile
        </p>
      </div>
      <div className=" flex gap-3 bg-[#E8E8E8] rounded-[40px] py-1 px-2 items-center justify-center">
        <div className="rounded-full w-2 bg-[#A0A4A8] h-2 " />
        <p className="text-xs font-bold text-[#A0A4A8]">Not started</p>
      </div>
    </div>
  );
};
