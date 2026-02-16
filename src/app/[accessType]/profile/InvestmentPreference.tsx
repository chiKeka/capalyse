import InvestmentPreference from "@/app/(auth)/[accessType]/onboarding/investmesntPrefernce";
import { getCurrentProfile } from "@/hooks/useUpdateProfile";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import "react-country-state-city/dist/react-country-state-city.css";
import { toast } from "sonner";

type Props = {};

type InvestmentPreferenceormProps = {
  setLoading: Dispatch<SetStateAction<boolean>>;
  onFinish?: () => void;
};

const InvestmentPreferenceWrapper = () => {
  const [loading, setLoading] = useState(false);
  const { data: user } = getCurrentProfile();

  const investmentPreferenceRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);

  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6">
      <div className="max-w-[832px]">
        <InvestmentPreference
          ref={investmentPreferenceRef}
          setLoading={setLoading}
          onFinish={() => {
            setLoading(false);
            toast.success("Investment preference updated successfully");
          }}
          initialData={user}
          isProfile={true}
        />
      </div>
    </div>
  );
};

export default InvestmentPreferenceWrapper;
