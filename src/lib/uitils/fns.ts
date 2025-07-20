import axios from 'axios';

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
  await axios.post(uploadUrl, formData).then(({ data }) => {
    console.log({ data });
    onSuccess?.(data);
    return data?.secure_url;
  });
};
