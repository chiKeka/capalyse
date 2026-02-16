import Button from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

const ConfirmationModal = ({
  handleCancel,
  selectedInvestment,
  handleUpdate,
  showConfirmModal,
}: {
  handleCancel: () => void;
  selectedInvestment: any;
  handleUpdate: () => void;
  showConfirmModal: boolean;
}) => {
  return (
    <Dialog open={showConfirmModal} onOpenChange={handleCancel}>
      <DialogContent className="lg:max-w-lg" hideIcon>
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Investment</h3>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            You are about to change this business{" "}
            <span className="font-semibold">"{selectedInvestment?.metadata?.smeName}"</span>{" "}
            verification status from <span className="font-semibold">"In-Review"</span> to{" "}
            <span className="font-semibold">"{selectedInvestment?.metadata?.investmentType}"</span>
          </p>
          <p className="text-gray-700">Do you want to proceed?</p>
        </div>
        <div className="flex space-x-4 justify-end">
          <Button
            onClick={handleCancel}
            variant="secondary"
            size="small"
            className="px-6 py-3 !border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium"
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} size="small">
            Yes, Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
