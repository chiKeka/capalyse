type Props = {
  value: number; // 0-100
  className?: string;
};

function StraightBar({ value = 70, className = "" }: Props) {
  return (
    <div
      className={`w-full h-2 bg-gray-200 rounded-[16px] overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-green transition-all rounded-[12px] duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export default StraightBar;
