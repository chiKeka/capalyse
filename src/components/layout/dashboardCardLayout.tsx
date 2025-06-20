type Props = {
  children?: React.ReactNode;
  caption?: string;
  hasIcon?: boolean;
  icon?: any;
  link?: string;
  height?: string;
};

function DashboardCardLayout({
  children,
  caption,
  hasIcon,
  height = "h-auto",
  link,
}: Props) {
  return (
    <div
      className={`w-full md:w-fit p-4 ${height} rounded-md border-1 items-center border-[#E4E4E7]`}
    >
      <div className="flex flex-row itmes-start justify-between">
        <p className="font-bold text-base text-[#18181B]">{caption}</p>
      </div>
      {children}
    </div>
  );
}

export default DashboardCardLayout;
