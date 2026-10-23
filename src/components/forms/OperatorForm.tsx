"use client";

import { operators } from "@content/site";
import { operatorAction } from "@/app/actions";
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

const t = operators.form;
const choose = { value: "", label: t.fields.choose };
const heardOptions = [choose, ...t.heardFromOptions];

export function OperatorForm() {
  const f = useSubmission(operatorAction);

  if (f.state.status === "success") {
    const ref = f.state.reference;
    return <SuccessPanel heading={t.successHeading} body={ref ? `${t.successReference(ref)} ${t.successBody}` : t.successBody} />;
  }

  return (
    <form action={f.submit} className="space-y-5">
      <FormBanner message={f.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.companyName} htmlFor="of-company" required error={f.errors.companyName}>
          <TextInput
            id="of-company"
            name="companyName"
            autoComplete="organization"
            required
            defaultValue={f.val("companyName")}
            {...errProps("of-company", f.errors.companyName)}
          />
        </Field>
        <Field label={t.fields.tradingName} htmlFor="of-trading" optional error={f.errors.tradingName}>
          <TextInput
            id="of-trading"
            name="tradingName"
            defaultValue={f.val("tradingName")}
            {...errProps("of-trading", f.errors.tradingName)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.contactPerson} htmlFor="of-contact" required error={f.errors.contactPerson}>
          <TextInput
            id="of-contact"
            name="contactPerson"
            autoComplete="name"
            required
            defaultValue={f.val("contactPerson")}
            {...errProps("of-contact", f.errors.contactPerson)}
          />
        </Field>
        <Field label={t.fields.contactRole} htmlFor="of-role" optional error={f.errors.contactRole}>
          <TextInput
            id="of-role"
            name="contactRole"
            autoComplete="organization-title"
            defaultValue={f.val("contactRole")}
            {...errProps("of-role", f.errors.contactRole)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <PhoneField
          id="of-phone"
          name="phone"
          label={t.fields.mobile}
          required
          error={f.errors.phone}
          defaultCountry={f.val("phoneCountry")}
          defaultNational={f.val("phoneNational")}
        />
        <Field label={t.fields.email} htmlFor="of-email" required error={f.errors.email}>
          <TextInput
            id="of-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={f.val("email")}
            {...errProps("of-email", f.errors.email)}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.fields.fleetSize} htmlFor="of-fleet" required error={f.errors.fleetSize}>
          <TextInput
            id="of-fleet"
            name="fleetSize"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            required
            defaultValue={f.val("fleetSize")}
            {...errProps("of-fleet", f.errors.fleetSize)}
          />
        </Field>
        <RadioGroup
          legend={t.fields.routeType}
          name="routeType"
          options={t.routeTypes}
          defaultValue={f.val("routeType")}
          error={f.errors.routeType}
        />
      </div>
      <Field
        label={t.fields.mainRoutes}
        htmlFor="of-routes"
        required
        hint={t.fields.mainRoutesHint}
        error={f.errors.mainRoutes}
      >
        <TextArea
          id="of-routes"
          name="mainRoutes"
          rows={2}
          required
          defaultValue={f.val("mainRoutes")}
          {...errProps("of-routes", f.errors.mainRoutes)}
        />
      </Field>
      <RadioGroup
        legend={t.fields.hasTicketingSystem}
        name="hasTicketingSystem"
        options={t.ticketingOptions}
        defaultValue={f.val("hasTicketingSystem")}
        error={f.errors.hasTicketingSystem}
      />
      <Field label={t.fields.ticketingSystemName} htmlFor="of-system" optional error={f.errors.ticketingSystemName}>
        <TextInput
          id="of-system"
          name="ticketingSystemName"
          defaultValue={f.val("ticketingSystemName")}
          {...errProps("of-system", f.errors.ticketingSystemName)}
        />
      </Field>
      <CheckboxGroup
        legend={t.fields.currencies}
        name="currencies"
        options={t.currencyOptions}
        defaultValues={f.vals("currencies")}
        error={f.errors.currencies}
      />
      <Field label={t.fields.heardFrom} htmlFor="of-heard" optional error={f.errors.heardFrom}>
        <Select
          id="of-heard"
          name="heardFrom"
          options={heardOptions}
          defaultValue={f.val("heardFrom")}
          {...errProps("of-heard", f.errors.heardFrom)}
        />
      </Field>
      <Field label={t.fields.details} htmlFor="of-details" optional error={f.errors.details}>
        <TextArea id="of-details" name="details" defaultValue={f.val("details")} {...errProps("of-details", f.errors.details)} />
      </Field>
      <div>
        <Checkbox id="of-marketing" name="marketingConsent" defaultChecked={f.on("marketingConsent")}>
          {t.marketing}
        </Checkbox>
        <PrivacyCheckbox
          id="of-privacy"
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
