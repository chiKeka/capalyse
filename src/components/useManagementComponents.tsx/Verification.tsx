import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

const Verification = ({
  verificationStatus,
}: {
  verificationStatus: string;
}) => {
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(verificationStatus);

  const handleStatusClick = () => {
    setShowStatusOptions(!showStatusOptions);
  };

  const handleStatusSelect = (status: string) => {
    if (status !== selectedStatus) {
      setSelectedStatus(status);
      setShowStatusOptions(false);
      setShowConfirmModal(true);
    } else {
      setShowStatusOptions(false);
    }
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setSelectedStatus(verificationStatus); // Reset to original status
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Verification</h2>
      <p className="text-gray-600 mb-6">
        After reviewing SME information carefully, change the status of their
        registration by clicking on one status
      </p>
      <div className="relative">
        <button
          onClick={handleStatusClick}
          className="w-full bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 rounded-lg p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="font-medium text-gray-900">In Review</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              showStatusOptions ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Status Options Dropdown */}
        {showStatusOptions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleStatusSelect('Pending')}
              className="w-full bg-yellow-100 hover:bg-yellow-200 p-4 flex items-center space-x-3 text-left border-b border-gray-200"
            >
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium text-gray-900">In Review</span>
            </button>

            <button
              onClick={() => handleStatusSelect('Verified')}
              className="w-full bg-green-100 hover:bg-green-200 p-4 flex items-center space-x-3 text-left border-b border-gray-200"
            >
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Verified</span>
            </button>

            <button
              onClick={() => handleStatusSelect('Rejected')}
              className="w-full bg-red-100 hover:bg-red-200 p-4 flex items-center space-x-3 text-left"
            >
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium text-gray-900">Rejected</span>
            </button>
          </div>
        )}
      </div>
      <ConfirmationModal
        showConfirmModal={showConfirmModal}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        selectedStatus={selectedStatus}
      />
    </div>
  );
};

export default Verification;
