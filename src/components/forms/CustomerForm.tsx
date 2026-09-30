import { customerForm as t, ui } from "@content/site";
import {
  Checkbox,
  CheckboxGroup,
  Field,
  PhoneField,
  PrivacyCheckbox,
  SubmitButton,
  TextInput,
} from "./fields";

export function CustomerForm() {
  return (
    <form className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.firstName} htmlFor="cf-first" required>
          <TextInput id="cf-first" name="firstName" autoComplete="given-name" required />
        </Field>
        <Field label={t.fields.lastName} htmlFor="cf-last" required>
          <TextInput id="cf-last" name="lastName" autoComplete="family-name" required />
        </Field>
      </div>
      <PhoneField id="cf-phone" name="phone" label={t.fields.mobile} required />
      <Field label={t.fields.email} htmlFor="cf-email" optional={ui.optional}>
        <TextInput id="cf-email" name="email" type="email" autoComplete="email" />
      </Field>
      <CheckboxGroup legend={t.fields.interestedIn} name="interests" options={t.interests} />
      <div>
        <Checkbox id="cf-marketing" name="marketingConsent">
          {t.marketing}
        </Checkbox>
        <PrivacyCheckbox id="cf-privacy" prefix={t.privacyPrefix} link={t.privacyLink} suffix={t.privacySuffix} />
      </div>
      <SubmitButton>{t.button}</SubmitButton>
    </form>
  );
}
