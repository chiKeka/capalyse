export const ApiEndPoints = {
  // Wait list
  Waitlist_Count: "/waitlist",
  wait_list: "/waitlist",
  Get_Waitlist: (email: string) => `waitlist/status/${email}`,

  //Resources

  Resources: "/resources",
  Single_Resource: (id: string) => `/resources/${id}`,
  Resource_Category: (category: any) => `/resources/category/${category}`,
  Search_Resources: "/resources/search",
  Popular_Resources: "/resources/popular",

  //Authentication
  Auth_Activity: (action: string) => `/auth/${action}`, // this actions is either {login, google, refresh, me, logout, verify-email, forgot-password, reset-password, token, register etc}
  Register_Activity: (action: string) => `/auth/register/${action}`, // this action is either (initiate, personal-info, dev-org-info, sma-business-info, investor-investment-info)

  //Assesment
  Assessments: "/assessments",
  Single_Assessment: (id: string) => `assessments/${id}`,
  Assessment_progress: (id: string) => `assessments/${id}/progress`,
  Submit_Assessment: (id: string) => `assessments/${id}/submit`,

  //files

  Upload_File: "/files/upload",
  Files: "/files",
  Single_Files: (id: string) => `/files/{id}`,

  // profile management
  Profile: "/me",
  Profile_Completion: "/me/profile-completion",
  Profile_Info: "/me/personal-info",

  //SMEs
  SMEs_Profile: (action?: string) => `/smes/me/${action}`,
  Delete_SMEs_profile: (memberId?: string) => `/smes/me/team/${memberId}`,
  SMEs_Assessments: (action?: string) => `/smes/me/assessment/${action}`,
  All_Assessments: `/smes/me/assessment`,

  //investor

  Investor_Investments: "/investors/me/investment-info",
  Investor_Organisation: "/investors/me/organization-info",

  // development
  Dev_Org: "/dev-orgs/me/organisation-info",

  // invest readiness scoring

  Investment_Readiness: (action: string) => `/scoring/me/${action}`,

  //scoring administration

  Administration_Config: `/scoring/admin/config`,
  Administration_Queue: `/scoring/admin/queue`,

  //investmenst interest for investor matches

  Investment_interest: (action?: string) => `/investments/interest/${action}`,
  Request_due_delegene: (id: string) =>
    `/investments/interests/${id}/due-diligence`,
};
