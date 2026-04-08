export type LeadFormStep = {
  name: "fullName" | "email" | "phone";
  label: string;
  placeholder: string;
  inputType: "text" | "email" | "tel" | "textarea";
  rows?: number;
};

const leadFormSteps: LeadFormStep[] = [
  {
    name: "fullName",
    label: "Name",
    placeholder: "Juan Dela Cruz",
    inputType: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "pangalan@company.com",
    inputType: "email",
  },
  {
    name: "phone",
    label: "Phone number",
    placeholder: "09XX XXX XXXX",
    inputType: "tel",
  },
];

export function getLeadFormSteps() {
  return leadFormSteps;
}
