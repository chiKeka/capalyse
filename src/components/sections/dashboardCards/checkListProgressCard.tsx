type Props = {
  img?: string;
  status?: string;
  caption?: string;
};

function CheckListProgressCard({ img, caption, status }: Props) {
  const renderStatus = () => {
    const numStatus = Number(status);
    if (numStatus === 100) return "Completed";
    if (numStatus <= 99) return "In Progress";
    return "Not Started";
  };

  const getStatusBgClass = () => {
    const status = renderStatus();
    if (status === "Completed") return "bg-[#DCFCE7] text-[#14532D]";
    if (status === "In Progress") return "bg-[#FEF9C3] text-[#713F12]";
    if (status === "Not Started") return "bg-[#E8E8E8] text-[#A0A4A8]";
    return "";
  };
  const getIconBgClass = () => {
    const status = renderStatus();
    if (status === "Completed") return "bg-[#22C55E] ";
    if (status === "In Progress") return "bg-[#FACC15]";
    if (status === "Not Started") return "bg-[#A0A4A8]";
    return "";
  };
  return (
    <div className="border-0.5 shadow-sm  border-[#E8E8E8] shadow-gray-500 w-full  h-[52px] py-2 px-4 rounded-[4px] justify-between flex items-center ">
      <div className="flex gap-2 items-center">
        <img className="w-5 h-5" src={img} />
        <p className="text-base font-normal text-[#0B0B0C] ">{caption}</p>
      </div>
      <div
        className={`${getStatusBgClass()} flex gap-3 rounded-[40px] py-1 px-2 items-center justify-center`}
      >
        <div className={`rounded-full w-2 ${getIconBgClass()}  h-2 `} />
        <p className="text-xs font-bold">{renderStatus()}</p>
      </div>
    </div>
  );
}

export default CheckListProgressCard;
