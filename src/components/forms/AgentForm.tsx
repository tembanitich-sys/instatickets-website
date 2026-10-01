"use client";

import { agents } from "@content/site";
import { agentAction } from "@/app/actions";
import {
  Checkbox,
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

const t = agents.form;
const choose = { value: "", label: t.fields.choose };
const provinceOptions = [choose, ...t.provinces.map((p) => ({ value: p, label: p }))];
const typeOptions = [choose, ...t.applicantTypes];
const locationOptions = [choose, ...t.sellingLocations];

export function AgentForm() {
  const f = useSubmission(agentAction);

  if (f.state.status === "success") return <SuccessPanel heading={t.successHeading} body={t.successBody} />;

  return (
    <form action={f.submit} className="space-y-5">
      <FormBanner message={f.message} />
      <Field label={t.fields.fullName} htmlFor="af-name" required error={f.errors.fullName}>
        <TextInput
          id="af-name"
          name="fullName"
          autoComplete="name"
          required
          defaultValue={f.val("fullName")}
          {...errProps("af-name", f.errors.fullName)}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <PhoneField
          id="af-phone"
          name="phone"
          label={t.fields.mobile}
          required
          error={f.errors.phone}
          defaultCountry={f.val("phoneCountry")}
          defaultNational={f.val("phoneNational")}
        />
        <Field label={t.fields.email} htmlFor="af-email" optional error={f.errors.email}>
          <TextInput
            id="af-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={f.val("email")}
            {...errProps("af-email", f.errors.email)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.applicantType} htmlFor="af-type" required error={f.errors.applicantType}>
          <Select
            id="af-type"
            name="applicantType"
            required
            options={typeOptions}
            defaultValue={f.val("applicantType")}
            {...errProps("af-type", f.errors.applicantType)}
          />
        </Field>
        <Field label={t.fields.businessName} htmlFor="af-business" optional error={f.errors.businessName}>
          <TextInput
            id="af-business"
            name="businessName"
            autoComplete="organization"
            defaultValue={f.val("businessName")}
            {...errProps("af-business", f.errors.businessName)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.province} htmlFor="af-province" required error={f.errors.province}>
          <Select
            id="af-province"
            name="province"
            required
            options={provinceOptions}
            defaultValue={f.val("province")}
            {...errProps("af-province", f.errors.province)}
          />
        </Field>
        <Field label={t.fields.town} htmlFor="af-town" required error={f.errors.town}>
          <TextInput
            id="af-town"
            name="town"
            autoComplete="address-level2"
            required
            defaultValue={f.val("town")}
            {...errProps("af-town", f.errors.town)}
          />
        </Field>
      </div>
      <Field label={t.fields.sellingLocation} htmlFor="af-where" required error={f.errors.sellingLocation}>
        <Select
          id="af-where"
          name="sellingLocation"
          required
          options={locationOptions}
          defaultValue={f.val("sellingLocation")}
          {...errProps("af-where", f.errors.sellingLocation)}
        />
      </Field>
      <RadioGroup
        legend={t.fields.hasDevice}
        name="hasDevice"
        options={t.hasDevice}
        defaultValue={f.val("hasDevice")}
        error={f.errors.hasDevice}
      />
      <Field label={t.fields.details} htmlFor="af-details" optional error={f.errors.details}>
        <TextArea id="af-details" name="details" defaultValue={f.val("details")} {...errProps("af-details", f.errors.details)} />
      </Field>
      <div>
        <Checkbox id="af-marketing" name="marketingConsent" defaultChecked={f.on("marketingConsent")}>
          {t.marketing}
        </Checkbox>
        <PrivacyCheckbox
          id="af-privacy"
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
