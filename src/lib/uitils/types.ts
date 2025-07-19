export type RegisterCredentials = {
  email: string;
  password: string;
  role: string;
};

export type PersonalInfoInputs = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  countryOfResidence: string;
  stateOfResidence: string;
};

export type SMEsBusinessInfo = {
  businessName: string;
  registrationNumber: string;
  countryOfOperation: string;
  businessStage: string;
  industry: string;
  website: string;
};

export type AuthState = {
  createdAt: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  id: string;
  lastName: string;
  profileCompletionStep: number;
  role: string;
  status: string;
  updatedAt: string;
};
