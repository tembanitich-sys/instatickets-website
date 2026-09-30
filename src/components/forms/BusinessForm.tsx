"use client";

import { forBusinesses } from "@content/site";
import { registerBusinessAction } from "@/app/actions";
import {
  Checkbox,
  CheckboxGroup,
  Field,
  FormBanner,
  PhoneField,
  PrivacyCheckbox,
  RadioGroup,
  Select,
  SubmitButton,
  SuccessPanel,
  TextArea,
  TextInput,
  errProps,
} from "./fields";
import { TurnstileWidget } from "./TurnstileWidget";
import { useSubmission } from "./useSubmission";

const t = forBusinesses.form;

export function BusinessForm() {
  const f = useSubmission(registerBusinessAction);

  if (f.state.status === "success") return <SuccessPanel heading={t.successHeading} body={t.successBody} />;

  return (
    <form action={f.submit} className="space-y-5">
      <FormBanner message={f.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.organisationName} htmlFor="bf-org" required error={f.errors.organisationName}>
          <TextInput
            id="bf-org"
            name="organisationName"
            autoComplete="organization"
            required
            defaultValue={f.val("organisationName")}
            {...errProps("bf-org", f.errors.organisationName)}
          />
        </Field>
        <Field label={t.fields.contactPerson} htmlFor="bf-contact" required error={f.errors.contactPerson}>
          <TextInput
            id="bf-contact"
            name="contactPerson"
            autoComplete="name"
            required
            defaultValue={f.val("contactPerson")}
            {...errProps("bf-contact", f.errors.contactPerson)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <PhoneField
          id="bf-phone"
          name="phone"
          label={t.fields.mobile}
          required
          error={f.errors.phone}
          defaultCountry={f.val("phoneCountry")}
          defaultNational={f.val("phoneNational")}
        />
        <Field label={t.fields.email} htmlFor="bf-email" required error={f.errors.email}>
          <TextInput
            id="bf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={f.val("email")}
            {...errProps("bf-email", f.errors.email)}
          />
        </Field>
      </div>
      <Field label={t.fields.businessType} htmlFor="bf-type" error={f.errors.businessType}>
        <Select
          id="bf-type"
          name="businessType"
          options={t.businessTypes}
          defaultValue={f.val("businessType")}
          {...errProps("bf-type", f.errors.businessType)}
        />
      </Field>
      <CheckboxGroup
        legend={t.fields.offerings}
        name="offerings"
        options={t.offerings}
        defaultValues={f.vals("offerings")}
        error={f.errors.offerings}
      />
      <RadioGroup
        legend={t.fields.hasTicketingSystem}
        name="hasTicketingSystem"
        options={t.ticketingSystem}
        defaultValue={f.val("hasTicketingSystem")}
        error={f.errors.hasTicketingSystem}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.ticketingSystemName} htmlFor="bf-system" optional error={f.errors.ticketingSystemName}>
          <TextInput
            id="bf-system"
            name="ticketingSystemName"
            defaultValue={f.val("ticketingSystemName")}
            {...errProps("bf-system", f.errors.ticketingSystemName)}
          />
        </Field>
        <Field label={t.fields.website} htmlFor="bf-web" optional error={f.errors.website}>
          <TextInput
            id="bf-web"
            name="website"
            inputMode="url"
            autoComplete="url"
            defaultValue={f.val("website")}
            {...errProps("bf-web", f.errors.website)}
          />
        </Field>
      </div>
      <Field label={t.fields.details} htmlFor="bf-details" optional hint={t.fields.detailsHint} error={f.errors.details}>
        <TextArea id="bf-details" name="details" defaultValue={f.val("details")} {...errProps("bf-details", f.errors.details)} />
      </Field>
      <div>
        <Checkbox id="bf-marketing" name="marketingConsent" defaultChecked={f.on("marketingConsent")}>
          {t.marketing}
        </Checkbox>
        <PrivacyCheckbox
          id="bf-privacy"
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
