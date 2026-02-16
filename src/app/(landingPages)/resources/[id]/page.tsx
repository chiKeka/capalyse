import ResourceCard from "@/components/sections/ResourceCard";
import { resouresData } from "@/lib/uitils/contentData";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return resouresData.map((r) => ({ id: r.id }));
}
const getRandomThree = (arr: typeof resouresData) => {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, 3);
};

export default async function ResourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = resouresData.find((r) => r.id === id);

  if (!resource) return notFound();

  const randomThree = getRandomThree(resouresData);
  return (
    <div className="max-w-7xl mx-auto py-20 px-4">
      <img src={resource.image} alt={resource.header} className="w-full h-auto" />
      <div className="w-full items-center justify-center flex flex-col">
        <h1 className="text-[56px] font-bold mb-2 text-center">{resource.header}</h1>
        <div className="flex items-center justify-center gap-2">
          <p className="mt-4 text-center">May 19, 2025 </p>
          <p className="mt-4 text-center">6 minutes read</p>
        </div>
      </div>

      <div>
        <p className="mt-4 text-center">{resource.text}</p>
      </div>

      <div className="w-full mt-12 flex flex-col">
        <p className="font-bold text-4xl  text-[#282828]">Other Resources </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
          {randomThree.map((item, index) => (
            <Link href={`/resources/${item.id}`} key={index}>
              <ResourceCard
                href={`/resources/${item.id}`}
                header={item.header}
                text={item.text}
                image={item.image}
                index={index}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
