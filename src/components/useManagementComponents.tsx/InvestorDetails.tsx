import EmptyBox from '../sections/dashboardCards/emptyBox';
import Button from '../ui/Button';
import { Card } from '../ui/card';
import ContactDetails from './ContactDetails';
import Documents from './Documents';
import Verification from './Verification';

const InvestorDetails = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 mt-6">
      <div className="space-y-6 lg:col-span-2">
        <ContactDetails />
        <Verification />
      </div>
      <div className="lg:col-span-3 space-y-6">
        <Card className="px-6">
          <Documents />
        </Card>
        <Card className="p-6">
          <div className="flex items-center mb-8 gap-2 justify-between">
            <p className="font-bold whitespace-nowrap text-base flex gap-1 items-center text-[#18181B]">
              <span>
                <span>Interaction History with SMEs</span>
              </span>
              <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                3
              </span>
            </p>
            <Button variant="primary">
              Message Investor
              <img className="w-[20px] h-[20px]" src={'/icons/message.svg'} />
            </Button>
          </div>
          <EmptyBox
            showButton={false}
            caption2="Interaction history with SMEs will be found here"
            caption="No Interaction History Found"
          />
        </Card>
      </div>
    </div>
  );
};

export default InvestorDetails;
