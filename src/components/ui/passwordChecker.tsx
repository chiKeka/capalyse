import { IconCheck } from "./icons";

export default function PasswordChecker({ password }: { password: string }) {
  const criterials = [
    {
      icon: <IconCheck passed={/[A-Z]/.test(password)} />,
      criteria: "At least one uppercase letter",
      passed: /[A-Z]/.test(password),
    },
    {
      icon: <IconCheck passed={password?.length >= 8} />,
      criteria: "Minimum of 8 characters",
      passed: password?.length >= 8,
    },
    {
      icon: <IconCheck passed={/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)} />,
      criteria: "At least one number and a character",
      passed: /(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password),
    },
  ];

  return (
    <div className="mb-2">
      {criterials.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          {item.icon}
          {item.criteria}
        </div>
      ))}
    </div>
  );
}
