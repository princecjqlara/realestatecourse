'use client';

import { useActionState, useMemo, useRef, useState } from "react";

import { initialActionState } from "@/app/action-state";
import { submitLeadAction } from "@/app/actions";
import { getLeadFormSteps } from "@/lib/funnel/lead-form-steps";

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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const steps = useMemo(() => getLeadFormSteps(), []);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const stepError = state.fieldErrors?.[currentStep.name]?.[0];

  function goNext() {
    const currentField = formRef.current?.elements.namedItem(currentStep.name);
    if (
      currentField instanceof HTMLInputElement ||
      currentField instanceof HTMLTextAreaElement
    ) {
      if (!currentField.reportValidity()) {
        return;
      }
    }

    setCurrentStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function goBack() {
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <form className="panel formPanel" action={formAction} ref={formRef}>
      <input name="utmSource" type="hidden" value={attribution.utmSource} />
      <input name="utmMedium" type="hidden" value={attribution.utmMedium} />
        <input name="utmCampaign" type="hidden" value={attribution.utmCampaign} />
        <input name="utmContent" type="hidden" value={attribution.utmContent} />
        <input name="fbclid" type="hidden" value={attribution.fbclid} />
        <input name="landingPath" type="hidden" value={attribution.landingPath} />
        <input name="companies" type="hidden" value="" />

      <div className="stepHeader">
        <span className="stepIndicator">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
        <div className="stepProgressTrack">
          <div
            className="stepProgressFill"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="stepFields">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;

          return (
            <label className={`field wizardField ${isActive ? "activeWizardField" : "hiddenWizardField"}`} key={step.name}>
              <span>{step.label}</span>
              {step.inputType === "textarea" ? (
                <textarea
                  defaultValue=""
                  name={step.name}
                  placeholder={step.placeholder}
                  required
                  rows={step.rows ?? 3}
                />
              ) : (
                <input defaultValue="" name={step.name} placeholder={step.placeholder} required type={step.inputType} />
              )}
            </label>
          );
        })}

        {stepError ? <small className="wizardError">{stepError}</small> : null}
      </div>

      {state.message ? <p className={`formMessage ${state.status}`}>{state.message}</p> : null}

      <div className="formFooter">
        <p className="helperText">
          Pag-submit mo, may instant access ka agad. Puwede ka ring bumalik later gamit ang same email.
        </p>

        <div className="wizardActions">
          {currentStepIndex > 0 ? (
            <button className="buttonSecondary" onClick={goBack} type="button">
              Back
            </button>
          ) : null}

          {isLastStep ? (
            <button className="buttonPrimary" disabled={pending} type="submit">
              {pending ? "Ina-unlock..." : ctaLabel}
            </button>
          ) : (
            <button className="buttonPrimary" onClick={goNext} type="button">
              Next
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
