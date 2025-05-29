import { ResourcesHero } from "@/components/sections/ResourcesHero";
import { resouresData } from "@/lib/uitils/contentData";

type Props = {};

function ResourcePage({}: Props) {
  return (
    <>
      <ResourcesHero data={resouresData} />
    </>
  );
}

export default ResourcePage;
