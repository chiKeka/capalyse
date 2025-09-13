import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UserType = {
  development: 'Development_org',
  sme: 'SME',
  investor: 'Investor',
};

export const onboardingSteps = [
  {
    role: 'sme',
    steps: [
      { id: 1, label: 'personal-info' },
      { id: 2, label: 'sme-business-info' },
    ],
  },
  {
    role: 'investor',
    steps: [
      { id: 1, label: 'personal-info' },
      { id: 2, label: 'investor-investment-info' },
      { id: 3, label: 'investor-organization-info' },
    ],
  },
  {
    role: 'development_org',
    steps: [{ id: 1, label: 'dev-org-info' }],
  },
];

export const africanCountries = [
  'Algeria',
  'Angola',
  'Benin',
  'Botswana',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cameroon',
  'Central African Republic',
  'Chad',
  'Comoros',
  'Congo (Congo-Brazzaville)',
  'Democratic Republic of the Congo',
  'Djibouti',
  'Egypt',
  'Equatorial Guinea',
  'Eritrea',
  'Eswatini (fmr. Swaziland)',
  'Ethiopia',
  'Gabon',
  'Gambia',
  'Ghana',
  'Guinea',
  'Guinea-Bissau',
  'Ivory Coast',
  'Kenya',
  'Lesotho',
  'Liberia',
  'Libya',
  'Madagascar',
  'Malawi',
  'Mali',
  'Mauritania',
  'Mauritius',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Niger',
  'Nigeria',
  'Rwanda',
  'Sao Tome and Principe',
  'Senegal',
  'Seychelles',
  'Sierra Leone',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Sudan',
  'Tanzania',
  'Togo',
  'Tunisia',
  'Uganda',
  'Zambia',
  'Zimbabwe',
];
