'use client';

import { useActionState } from "react";

import { initialActionState } from "@/app/action-state";
import { adminLoginAction } from "@/app/actions";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialActionState);

  return (
    <form className="panel formPanel compactPanel" action={formAction}>
      <label className="field">
        <span>Admin email</span>
        <input name="email" placeholder="admin@example.com" required type="email" />
      </label>

      <label className="field">
        <span>Password</span>
        <input name="password" placeholder="Your admin password" required type="password" />
      </label>

      {state.message ? <p className={`formMessage ${state.status}`}>{state.message}</p> : null}

      <button className="buttonPrimary" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Open admin"}
      </button>
    </form>
  );
}
