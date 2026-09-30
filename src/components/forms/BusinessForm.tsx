import { forBusinesses } from "@content/site";
import {
  Checkbox,
  CheckboxGroup,
  Field,
  PhoneField,
  PrivacyCheckbox,
  RadioGroup,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from "./fields";

const t = forBusinesses.form;

export function BusinessForm() {
  return (
    <form className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.organisationName} htmlFor="bf-org" required>
          <TextInput id="bf-org" name="organisationName" autoComplete="organization" required />
        </Field>
        <Field label={t.fields.contactPerson} htmlFor="bf-contact" required>
          <TextInput id="bf-contact" name="contactPerson" autoComplete="name" required />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <PhoneField id="bf-phone" name="phone" label={t.fields.mobile} required />
        <Field label={t.fields.email} htmlFor="bf-email" required>
          <TextInput id="bf-email" name="email" type="email" autoComplete="email" required />
        </Field>
      </div>
      <Field label={t.fields.businessType} htmlFor="bf-type">
        <Select id="bf-type" name="businessType" options={t.businessTypes} />
      </Field>
      <CheckboxGroup legend={t.fields.offerings} name="offerings" options={t.offerings} />
      <RadioGroup legend={t.fields.hasTicketingSystem} name="hasTicketingSystem" options={t.ticketingSystem} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.ticketingSystemName} htmlFor="bf-system" optional={t.fields.optional}>
          <TextInput id="bf-system" name="ticketingSystemName" />
        </Field>
        <Field label={t.fields.website} htmlFor="bf-web" optional={t.fields.optional}>
          <TextInput id="bf-web" name="website" type="url" inputMode="url" autoComplete="url" />
        </Field>
      </div>
      <Field label={t.fields.details} htmlFor="bf-details" optional={t.fields.optional} hint={t.fields.detailsHint}>
        <TextArea id="bf-details" name="details" />
      </Field>
      <div>
        <Checkbox id="bf-marketing" name="marketingConsent">
          {t.marketing}
        </Checkbox>
        <PrivacyCheckbox id="bf-privacy" prefix={t.privacyPrefix} link={t.privacyLink} suffix={t.privacySuffix} />
      </div>
      <SubmitButton>{t.button}</SubmitButton>
    </form>
  );
}
