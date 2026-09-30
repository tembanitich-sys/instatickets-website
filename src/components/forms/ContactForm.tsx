import { contactPage, ui } from "@content/site";
import { Field, PhoneField, PrivacyCheckbox, Select, SubmitButton, TextArea, TextInput } from "./fields";

const t = contactPage.form;

export function ContactForm() {
  return (
    <form className="space-y-5">
      <Field label={t.fields.name} htmlFor="ct-name" required>
        <TextInput id="ct-name" name="name" autoComplete="name" required />
      </Field>
      <Field label={t.fields.email} htmlFor="ct-email" required>
        <TextInput id="ct-email" name="email" type="email" autoComplete="email" required />
      </Field>
      <PhoneField id="ct-phone" name="phone" label={t.fields.phone} optional={ui.optional} />
      <Field label={t.fields.enquiryType} htmlFor="ct-type">
        <Select id="ct-type" name="enquiryType" options={t.enquiryTypes} />
      </Field>
      <Field label={t.fields.message} htmlFor="ct-message" required>
        <TextArea id="ct-message" name="message" rows={5} required />
      </Field>
      <PrivacyCheckbox id="ct-privacy" prefix={t.privacyPrefix} link={t.privacyLink} suffix={t.privacySuffix} />
      <SubmitButton>{t.button}</SubmitButton>
    </form>
  );
}
