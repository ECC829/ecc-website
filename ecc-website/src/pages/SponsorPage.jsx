import { Container, PageHeader, Section, SectionHeading, StatTile } from "../components/ui";
import SponsorGrid from "../components/Sponsors";
import { Field, Select, SuccessPanel, TextArea, TextInput } from "../components/Form";
import { isEmail, mailtoLink, useForm } from "../lib/form";
import { club, season, sponsorTiers } from "../data/club";
import { players } from "../data/players";
import { teams } from "../data/teams";
import { allEvents } from "../data/tournaments";

export default function SponsorPage() {
  const { values, errors, setErrors, setField, status, setStatus, reset } = useForm({
    business: "",
    contactName: "",
    email: "",
    phone: "",
    tier: "",
    message: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!values.business.trim()) next.business = "Business name is required.";
    if (!values.contactName.trim()) next.contactName = "Contact name is required.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!isEmail(values.email)) next.email = "Enter a valid email address.";
    if (!values.tier) next.tier = "Please choose a sponsorship type.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    window.location.href = mailtoLink({
      to: club.email,
      subject: `Sponsorship enquiry — ${values.business}`,
      fields: {
        Business: values.business,
        Contact: values.contactName,
        Email: values.email,
        Phone: values.phone,
        "Sponsorship type": values.tier,
        Notes: `\n${values.message}`,
      },
    });
    setStatus("success");
  };

  return (
    <>
      <PageHeader
        eyebrow="Partnerships"
        title="Sponsor ECC"
        lead="ECC welcomes brands, businesses and community partners who want visibility through tournaments, jerseys, digital promotion and event branding across Central Ohio."
      >
        <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
          <StatTile value={players.length} label="Players reached" />
          <StatTile value={teams.length} label="Branded squads" accent="#2ec4b6" />
          <StatTile value={allEvents.length} label="Events entered" accent="#f97316" />
        </div>
      </PageHeader>

      <Section className="border-b border-white/[0.07]">
        <Container>
          <SectionHeading
            eyebrow={`${season.year} season`}
            title="Our sponsors"
            lead="Thank you to the businesses backing ECC this season. Please support them."
          />
          <div className="mt-10">
            <SponsorGrid />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Tiers */}
            <div className="space-y-4">
              {sponsorTiers.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-2xl border border-white/[0.08] bg-ink-900 p-7 transition duration-300 hover:border-gold-400/30"
                >
                  <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                    {tier.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{tier.text}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {tier.perks.map((perk) => (
                      <li
                        key={perk}
                        className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
                      >
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="h-fit rounded-2xl border border-white/[0.08] bg-ink-900 p-8 sm:p-10">
              {status === "success" ? (
                <SuccessPanel
                  title="Enquiry ready to send"
                  text={`Your email app should have opened with the enquiry pre-filled for ${club.email}. The club will get back to you shortly.`}
                  onReset={reset}
                />
              ) : (
                <>
                  <p className="eyebrow">Sponsor enquiry</p>
                  <h2 className="headline mt-3 text-3xl">Let's talk partnership</h2>
                  <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                    <Field label="Business / sponsor name" error={errors.business} required>
                      <TextInput
                        type="text"
                        autoComplete="organization"
                        value={values.business}
                        error={errors.business}
                        onChange={(e) => setField("business", e.target.value)}
                        placeholder="Your business name"
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Contact person" error={errors.contactName} required>
                        <TextInput
                          type="text"
                          autoComplete="name"
                          value={values.contactName}
                          error={errors.contactName}
                          onChange={(e) => setField("contactName", e.target.value)}
                          placeholder="Full name"
                        />
                      </Field>
                      <Field label="Phone" hint="optional">
                        <TextInput
                          type="tel"
                          autoComplete="tel"
                          value={values.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          placeholder="Best number"
                        />
                      </Field>
                    </div>

                    <Field label="Business email" error={errors.email} required>
                      <TextInput
                        type="email"
                        autoComplete="email"
                        value={values.email}
                        error={errors.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="you@company.com"
                      />
                    </Field>

                    <Field label="Sponsorship type" error={errors.tier} required>
                      <Select
                        value={values.tier}
                        error={errors.tier}
                        onChange={(e) => setField("tier", e.target.value)}
                      >
                        <option value="" className="bg-ink-900">
                          Select an option
                        </option>
                        {sponsorTiers.map((tier) => (
                          <option key={tier.name} value={tier.name} className="bg-ink-900">
                            {tier.name}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Tell us more" hint="optional">
                      <TextArea
                        rows={5}
                        value={values.message}
                        onChange={(e) => setField("message", e.target.value)}
                        placeholder="What are you hoping to achieve with the partnership?"
                      />
                    </Field>

                    <button type="submit" className="btn-primary w-full">
                      Submit enquiry
                    </button>
                    <p className="text-center text-xs leading-6 text-slate-600">
                      This opens your email app with the enquiry pre-filled.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
