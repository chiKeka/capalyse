import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const ResourceCard = ({ ...card }) => {
  const router = useRouter();
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-100">
        <img src={card.image} alt={card.header} />
      </div>
      <div className="p-4">
        <p className="text-sm bg-yellow-100 text-yellow-900 mb-2 w-max rounded-full px-2 py-0.5">
          {card.category}
        </p>
        <h4 className="font-medium text-black-600 mb-4">{card.header}</h4>
        <div className="flex flex-col">
          <div className="flex-1 text-xs">
            Explore how the AfCFTA is transforming cross-border trade, reducing
            barriers, and creating new opportunities for African businesses
          </div>
          <Button
            variant="tertiary"
            iconPosition="right"
            className="text-green ml-auto"
            onClick={() => router.push(`/investor/resources/${card.id}`)}
          >
            Read
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard;
