import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import Documents from './Documents';

const BusinessDetails = ({
  className,
  data,
  showDocuments,
}: {
  className?: string;
  data?: any;
  showDocuments?: boolean;
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Business Details
      </h2>
      {data ? (
        <div className="space-y-6 capitalize">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Business Name</span>
            <span className="font-semibold text-gray-900">
              {data?.businessName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Industry</span>
            <span className="font-semibold text-gray-900">
              {data?.industry}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Location</span>
            <span className="font-semibold text-gray-900">
              {data?.countryOfOperation?.join(', ') ?? data?.countryOfResidence}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Registration Number</span>
            <span className="font-semibold text-gray-900">
              {data?.registrationNumber}
            </span>
          </div>
        </div>
      ) : (
        <div>No Data Found</div>
      )}
      {showDocuments && <Documents />}
    </Card>
  );
};

export default BusinessDetails;
