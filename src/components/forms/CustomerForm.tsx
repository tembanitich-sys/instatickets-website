"use client";

import { customerForm as t } from "@content/site";
import { preregisterAction } from "@/app/actions";
import {
  Checkbox,
  CheckboxGroup,
  Field,
  FormBanner,
  PhoneField,
  PrivacyCheckbox,
  SubmitButton,
  SuccessPanel,
  TextInput,
  errProps,
} from "./fields";
import { TurnstileWidget } from "./TurnstileWidget";
import { useSubmission } from "./useSubmission";

export function CustomerForm() {
  const f = useSubmission(preregisterAction);

  if (f.state.status === "success") return <SuccessPanel heading={t.successHeading} body={t.successBody} />;

  return (
    <form action={f.submit} className="space-y-5">
      <FormBanner message={f.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.firstName} htmlFor="cf-first" required error={f.errors.firstName}>
          <TextInput
            id="cf-first"
            name="firstName"
            autoComplete="given-name"
            required
            defaultValue={f.val("firstName")}
            {...errProps("cf-first", f.errors.firstName)}
          />
        </Field>
        <Field label={t.fields.lastName} htmlFor="cf-last" required error={f.errors.lastName}>
          <TextInput
            id="cf-last"
            name="lastName"
            autoComplete="family-name"
            required
            defaultValue={f.val("lastName")}
            {...errProps("cf-last", f.errors.lastName)}
          />
        </Field>
      </div>
      <PhoneField
        id="cf-phone"
        name="phone"
        label={t.fields.mobile}
        required
        error={f.errors.phone}
        defaultCountry={f.val("phoneCountry")}
        defaultNational={f.val("phoneNational")}
      />
      <Field label={t.fields.email} htmlFor="cf-email" optional error={f.errors.email}>
        <TextInput
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={f.val("email")}
          {...errProps("cf-email", f.errors.email)}
        />
      </Field>
      <CheckboxGroup
        legend={t.fields.interestedIn}
        name="interests"
        options={t.interests}
        defaultValues={f.vals("interests")}
        error={f.errors.interests}
      />
      <div>
        <Checkbox id="cf-marketing" name="marketingConsent" defaultChecked={f.on("marketingConsent")}>
          {t.marketing}
        </Checkbox>
        <PrivacyCheckbox
          id="cf-privacy"
          prefix={t.privacyPrefix}
          link={t.privacyLink}
          suffix={t.privacySuffix}
          defaultChecked={f.on("privacyAccepted")}
          error={f.errors.privacyAccepted}
        />
      </div>
      <TurnstileWidget key={f.attempt} />
      <SubmitButton>{t.button}</SubmitButton>
    </form>
  );
}
