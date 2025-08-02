import { Info, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Dialog, DialogContent } from "../ui/dialog";

const StatusChangeModal = ({
  handleCancel,
  routename,
  showModal,
  title,
  description,
  handleAction,
  modalType,
  action,
  timer,
}: {
  handleCancel?: () => void;
  selectedStatus?: string;
  showModal?: boolean;
  title?: string;
  routename?: string;
  description?: string;
  handleAction?: () => void;
  action?: boolean;
  modalType?: "success" | "error" | "warning" | "info";
  timer?: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState(59 * 60); // 59 minutes in seconds

  useEffect(() => {
    if (showModal && timer) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showModal, timer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const icon = {
    success: <img src="icons/successCheck.svg" className="w-20 h-20 " />,
    error: <XCircle className="w-20 h-20 text-red-500" />,
    warning: <img src="icons/pending.svg" className="w-20 h-20" />,
    info: <Info className="w-20 h-20 text-blue-500" />,
  };
  return (
    <Dialog open={showModal} onOpenChange={handleCancel}>
      <DialogContent className="lg:max-w-lg" hideIcon>
        <div className="flex justify-end  items-end mb-6">
          <button
            onClick={handleCancel}
            className="text-[#DC2626] bg-[#DC2626]/20 rounded-lg p-1 border-none  hover:text-[#DC2626]/80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-2 w-full flex flex-col items-center justify-center mx-auto">
          <p className="mb-4">{icon[modalType || "success"]}</p>
          <p className="text-green font-bold text-xl text-center font-bolg mb-2">
            {title}
          </p>
          <p className="text-gray-700">{description}</p>
        </div>

        {action && (
          <div className=" mx-auto space-x-4 justify-end">
            <Button onClick={handleAction} variant="primary" size="small">
              {routename}
            </Button>
          </div>
        )}

        {timer && (
          <span className="text-gray-700 text-sm text-center">
            Didn’t receive a mail?{" "}
            <span className="font-bold">
              <button className="px-0  hover:cursor  text-green mx-0">
                Resend
              </button>{" "}
              in <span className="text-[#DC2626]">{formatTime(timeLeft)}</span>
            </span>
          </span>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeModal;
