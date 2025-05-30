type Props = {
  header: string;
  text: string;
  image: string;
};

function ResourceCard({ header, text, image }: Props) {
  return (
    <div className="max-w-sm bg-[#FCFCFC] border-[#E8E8E8] border rounded-3xl gap-[24px] items-start flex flex-col">
      <img src={image} />
      <div className="flex flex-col gap-4 p-3 mb-6">
        <p className="text-2xl text-start font-bold text-[#121212]">{header}</p>
        <p className="text-[#121212] font-normal text-base text-start">
          {text}
        </p>
      </div>
    </div>
  );
}

export default ResourceCard;
