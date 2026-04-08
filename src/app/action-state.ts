export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export const initialActionState: ActionState = {
  status: "idle",
};
