'use client';

import { useActionState } from "react";

import { initialActionState } from "@/app/action-state";
import { submitLeadAction } from "@/app/actions";

type LeadFormProps = {
  ctaLabel: string;
  attribution: {
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
    fbclid: string;
    landingPath: string;
  };
};

export function LeadForm({ attribution, ctaLabel }: LeadFormProps) {
  const [state, formAction, pending] = useActionState(submitLeadAction, initialActionState);

  return (
    <form className="panel formPanel" action={formAction}>
      <input name="utmSource" type="hidden" value={attribution.utmSource} />
      <input name="utmMedium" type="hidden" value={attribution.utmMedium} />
      <input name="utmCampaign" type="hidden" value={attribution.utmCampaign} />
      <input name="utmContent" type="hidden" value={attribution.utmContent} />
      <input name="fbclid" type="hidden" value={attribution.fbclid} />
      <input name="landingPath" type="hidden" value={attribution.landingPath} />

      <div className="fieldGrid">
        <label className="field">
          <span>Full name</span>
          <input name="fullName" placeholder="Jane Smith" required type="text" />
          {state.fieldErrors?.fullName ? <small>{state.fieldErrors.fullName[0]}</small> : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input name="email" placeholder="name@company.com" required type="email" />
          {state.fieldErrors?.email ? <small>{state.fieldErrors.email[0]}</small> : null}
        </label>

        <label className="field">
          <span>Phone number</span>
          <input name="phone" placeholder="+1 555 555 5555" required type="tel" />
          {state.fieldErrors?.phone ? <small>{state.fieldErrors.phone[0]}</small> : null}
        </label>

        <label className="field">
          <span>Company or companies</span>
          <textarea name="companies" placeholder="Your agency, developer, or team" required rows={3} />
          {state.fieldErrors?.companies ? <small>{state.fieldErrors.companies[0]}</small> : null}
        </label>

        <label className="field">
          <span>Property types</span>
          <textarea
            name="propertyTypes"
            placeholder="Condos, villas, plots, rentals"
            required
            rows={3}
          />
          {state.fieldErrors?.propertyTypes ? (
            <small>{state.fieldErrors.propertyTypes[0]}</small>
          ) : null}
        </label>

        <label className="field fieldWide">
          <span>What are you selling?</span>
          <textarea
            name="salesFocus"
            placeholder="Tell us what you sell and the kind of leads you want more of"
            required
            rows={4}
          />
          {state.fieldErrors?.salesFocus ? <small>{state.fieldErrors.salesFocus[0]}</small> : null}
        </label>
      </div>

      {state.message ? <p className={`formMessage ${state.status}`}>{state.message}</p> : null}

      <div className="formFooter">
        <p className="helperText">
          You will get instant access now, and later you can come back with the same email.
        </p>
        <button className="buttonPrimary" disabled={pending} type="submit">
          {pending ? "Unlocking..." : ctaLabel}
        </button>
      </div>
    </form>
  );
}
