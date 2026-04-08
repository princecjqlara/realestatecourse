'use client';

import { useActionState } from "react";

import { initialActionState } from "@/app/action-state";
import { resumeCourseAction } from "@/app/actions";

export function ResumeForm() {
  const [state, formAction, pending] = useActionState(resumeCourseAction, initialActionState);

  return (
    <form className="panel formPanel compactPanel" action={formAction}>
      <label className="field">
        <span>Email used on the form</span>
        <input name="email" placeholder="name@company.com" required type="email" />
      </label>

      {state.message ? <p className={`formMessage ${state.status}`}>{state.message}</p> : null}

      <button className="buttonPrimary" disabled={pending} type="submit">
        {pending ? "Checking..." : "Access my course"}
      </button>
    </form>
  );
}
