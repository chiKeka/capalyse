import axios from 'axios';
import { toast } from 'sonner';

export function formatCurrency(
  value: number,
  minFD = 2,
  maxFD = 2,
  currency: string
) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency ?? 'NGN',
    maximumFractionDigits: maxFD,
    minimumFractionDigits: minFD,
  }).format(value);
}

export function validateAuthForm(form: { email: string; password: string }) {
  const errors: { email?: string; password?: string } = {};
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!form.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid';
  }
  if (!form.password) {
    errors.password = 'Password is required';
  } else if (!passwordPattern.test(form.password)) {
    errors.password =
      'Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character (@$!%*?&)';
  }
  return errors;
}

export function getKeyByValue(obj: any, value: string) {
  return Object.keys(obj).find((key) => obj[key] === value);
}
export const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

export const handleImageUpload = async (
  file: File,
  onSuccess?: (x: string) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
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
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
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
