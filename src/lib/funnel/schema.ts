import { z } from "zod";

const separatorPattern = /[\n,]+/;

function splitListField(value: string) {
  return value
    .split(separatorPattern)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePhone(value: string) {
  const trimmed = value.trim();
  const hasPlusPrefix = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");

  return `${hasPlusPrefix ? "+" : ""}${digitsOnly}`;
}

export const leadFormSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email."),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((value) => value.replace(/\D/g, "").length >= 7, {
      message: "Please enter a valid phone number.",
    }),
  companies: z
    .string()
    .transform(splitListField)
    .refine((value) => value.length > 0, {
      message: "Please add at least one company.",
    }),
  propertyTypes: z
    .string()
    .transform(splitListField)
    .refine((value) => value.length > 0, {
      message: "Please add at least one property type.",
    }),
  salesFocus: z.string().trim().min(2, "Tell us what you sell."),
});

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type ParsedLeadFormInput = z.output<typeof leadFormSchema>;

export function parseLeadFormInput(input: LeadFormInput) {
  const result = leadFormSchema.safeParse(input);

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid lead submission.");
  }

  return result.data;
}
