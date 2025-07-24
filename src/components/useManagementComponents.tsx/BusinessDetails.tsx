import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import Documents from './Documents';

const BusinessDetails = ({
  className,
  showDocuments,
}: {
  className?: string;
  showDocuments?: boolean;
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Business Details
      </h2>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Business Name</span>
          <span className="font-semibold text-gray-900">Investor A</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Industry</span>
          <span className="font-semibold text-gray-900">Packaging</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Location</span>
          <span className="font-semibold text-gray-900">Nigeria</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Registration Number</span>
          <span className="font-semibold text-gray-900">12345678</span>
        </div>
      </div>
      {showDocuments && <Documents />}
    </Card>
  );
};

export default BusinessDetails;
