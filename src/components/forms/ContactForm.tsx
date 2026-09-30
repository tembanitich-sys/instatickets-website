"use client";

import { contactPage, contactSuccess } from "@content/site";
import { contactAction } from "@/app/actions";
import {
  Field,
  FormBanner,
  PhoneField,
  PrivacyCheckbox,
  Select,
  SubmitButton,
  SuccessPanel,
  TextArea,
  TextInput,
  errProps,
} from "./fields";
import { TurnstileWidget } from "./TurnstileWidget";
import { useSubmission } from "./useSubmission";

const t = contactPage.form;

export function ContactForm() {
  const f = useSubmission(contactAction);

  if (f.state.status === "success") return <SuccessPanel heading={contactSuccess.heading} body={contactSuccess.body} />;

  return (
    <form action={f.submit} className="space-y-5">
      <FormBanner message={f.message} />
      <Field label={t.fields.name} htmlFor="ct-name" required error={f.errors.name}>
        <TextInput
          id="ct-name"
          name="name"
          autoComplete="name"
          required
          defaultValue={f.val("name")}
          {...errProps("ct-name", f.errors.name)}
        />
      </Field>
      <Field label={t.fields.email} htmlFor="ct-email" required error={f.errors.email}>
        <TextInput
          id="ct-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={f.val("email")}
          {...errProps("ct-email", f.errors.email)}
        />
      </Field>
      <PhoneField
        id="ct-phone"
        name="phone"
        label={t.fields.phone}
        optional
        error={f.errors.phone}
        defaultCountry={f.val("phoneCountry")}
        defaultNational={f.val("phoneNational")}
      />
      <Field label={t.fields.enquiryType} htmlFor="ct-type" error={f.errors.enquiryType}>
        <Select
          id="ct-type"
          name="enquiryType"
          options={t.enquiryTypes}
          defaultValue={f.val("enquiryType")}
          {...errProps("ct-type", f.errors.enquiryType)}
        />
      </Field>
      <Field label={t.fields.message} htmlFor="ct-message" required error={f.errors.message}>
        <TextArea
          id="ct-message"
          name="message"
          rows={5}
          required
          defaultValue={f.val("message")}
          {...errProps("ct-message", f.errors.message)}
        />
      </Field>
      <PrivacyCheckbox
        id="ct-privacy"
        prefix={t.privacyPrefix}
        link={t.privacyLink}
        suffix={t.privacySuffix}
        defaultChecked={f.on("privacyAccepted")}
        error={f.errors.privacyAccepted}
      />
      <TurnstileWidget key={f.attempt} />
      <SubmitButton>{t.button}</SubmitButton>
    </form>
  );
}
