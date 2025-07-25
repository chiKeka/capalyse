import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/uitils/fns';

const IconCards = ({ ...card }) => {
  return (
    <Card className="min-h-[159px] h-full shadow-none">
      <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
        <div className="flex items-center justify-between gap-2 ">
          <span className="font-bold">{card.label}</span>
          <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
            {card.icon()}
          </div>
        </div>
        <span className="text-5xl font-bold mt-auto">
          {card.currency
            ? formatCurrency(card.amount, 0, 0, card.currency)
            : card.amount}
        </span>
        {card?.extraContent}
      </CardContent>
    </Card>
  );
};

export default IconCards;
