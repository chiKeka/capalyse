import axios from "axios";
import { toast } from "sonner";

export function formatCurrency(
  value: number,
  minFD = 2,
  maxFD = 2,
  currency: string
) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency ?? "NGN",
    maximumFractionDigits: maxFD,
    minimumFractionDigits: minFD,
  }).format(value);
}

export function validateAuthForm(form: { email: string; password: string }) {
  const errors: { email?: string; password?: string } = {};
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!form.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Email is invalid";
  }
  if (!form.password) {
    errors.password = "Password is required";
  } else if (!passwordPattern.test(form.password)) {
    errors.password =
      "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character (@$!%*?&)";
  }
  return errors;
}

export function getKeyByValue(obj: any, value: string) {
  const lowercasedValue = value?.toLowerCase();
  const lowercasedObj = Object?.fromEntries(
    Object?.entries(obj)?.map(([key, val]) => [key, String(val)?.toLowerCase()])
  );
  const foundKey = Object?.keys(obj)?.find(
    (key) => lowercasedObj[key] === lowercasedValue
  );
  return foundKey ? foundKey.toLowerCase() : undefined;
}

export const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

export const handleImageUpload = async (
  file: File,
  onSuccess?: (x: string) => void
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_PRESET as string
  );
  await axios
    .post(uploadUrl, formData)
    .then(({ data }) => {
      console.log({ data });
      onSuccess?.(data);
      return data?.secure_url;
    })
    .catch((err) => toast.error(err?.message));
};

function generateRandomHex() {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
}

// Function to ensure all colors are unique
function generateUniqueColors(count: number) {
  const colors = new Set();
  while (colors.size < count) {
    colors.add(generateRandomHex());
  }
  return Array.from(colors);
}

// Main function to transform the data
export function formatInvestmentData(inputArray: any[]) {
  const uniqueColors = generateUniqueColors(inputArray.length);

  return inputArray.map((item, index) => ({
    name: item.industry,
    value: item.amount,
    color: uniqueColors[index],
  }));
}

/**
 * Formats a date range string to the pattern "May 1 — August 31, 2025"
 * @param dateRange - Date range string in format "2025-09-11T00:00:00.000Z – 2025-09-18T00:00:00.000Z"
 * @returns Formatted date range string
 */
export function formatDateRange(dateRange: string): string {
  try {
    // Try different possible separators
    let startDateStr: string;
    let endDateStr: string;

    if (dateRange.includes(" – ")) {
      [startDateStr, endDateStr] = dateRange.split(" – ");
    } else if (dateRange.includes(" - ")) {
      [startDateStr, endDateStr] = dateRange.split(" - ");
    } else if (dateRange.includes("–")) {
      [startDateStr, endDateStr] = dateRange.split("–");
    } else if (dateRange.includes("-")) {
      [startDateStr, endDateStr] = dateRange.split("-");
    } else {
      return dateRange;
    }

    if (!startDateStr || !endDateStr) {
      return dateRange; // Return original if format is unexpected
    }

    const startDate = new Date(startDateStr.trim());
    const endDate = new Date(endDateStr.trim());

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return dateRange; // Return original if dates are invalid
    }

    // Format the dates
    const startFormatted = startDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    const endFormatted = endDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    const year = startDate.getFullYear();

    return `${startFormatted} — ${endFormatted}, ${year}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return dateRange; // Return original string if there's an error
  }
}
