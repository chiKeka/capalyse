export const statusBadge = (status: string) => {
  let color = "";
  let text = status;
  if (status === "Connected" || status === "active") color = "bg-green-100 text-green-700";
  if (status === "Shortlisted" || status === "Pending") color = "bg-yellow-100 text-yellow-700";
  if (status === "Viewed") color = "bg-blue-100 text-blue-700";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${color}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status === "Connected" || status === "active"
            ? "bg-green-500"
            : status === "Shortlisted" || status === "Pending"
              ? "bg-yellow-400"
              : "bg-blue-500"
        }`}
      />
      {text || "-"}
    </span>
  );
};
