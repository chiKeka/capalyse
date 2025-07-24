import { FileText } from 'lucide-react';

const Documents = () => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Documents</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">
                CAC Registration.pdf
              </div>
              <div className="text-sm text-gray-500">200 KB</div>
            </div>
          </div>
          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
            View Document
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Pitch Deck.pptx</div>
              <div className="text-sm text-gray-500">200 KB</div>
            </div>
          </div>
          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
            View Document
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">
                Financial Statement.pdf
              </div>
              <div className="text-sm text-gray-500">200 KB</div>
            </div>
          </div>
          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
            View Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documents;
