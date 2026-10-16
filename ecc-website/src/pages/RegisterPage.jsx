import { Container, PageHeader, Section } from "../components/ui";
import { Field, Select, SuccessPanel, TextArea, TextInput } from "../components/Form";
import { digitCount, isEmail, mailtoLink, useForm } from "../lib/form";
import { club, formats, joinCriteria, season } from "../data/club";
import { roles } from "../data/players";
import { teams } from "../data/teams";

export default function RegisterPage() {
  const { values, errors, setErrors, setField, status, setStatus, reset } = useForm({
    name: "",
    email: "",
    phone: "",
    role: "",
    format: "",
    team: "",
    experience: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!isEmail(values.email)) next.email = "Enter a valid email address.";
    if (!values.phone.trim()) next.phone = "Phone number is required.";
    else if (digitCount(values.phone) < 10) next.phone = "Enter a valid 10-digit number.";
    if (!values.role) next.role = "Please select a role.";
    if (!values.format) next.format = "Please select a format.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    window.location.href = mailtoLink({
      to: club.email,
      subject: `Player registration — ${values.name}`,
      fields: {
        Name: values.name,
        Email: values.email,
        Phone: values.phone,
        Role: values.role,
        "Preferred format": values.format,
        "Team interest": values.team || "No preference",
        Experience: `\n${values.experience}`,
      },
    });
    setStatus("success");
  };

  return (
    <>
      <PageHeader
        eyebrow="Join the club"
        title="Play for ECC"
        lead={`Interested players can register their details, preferred role and format ahead of the ${season.start} season start. The club will follow up directly.`}
      />

      <Section>
        <Container>
          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Info */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8">
                <p className="eyebrow">What we look for</p>
                <ul className="mt-6 space-y-4">
                  {joinCriteria.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8">
                <p className="eyebrow">Formats on offer</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {formats.map((format) => (
                    <div
                      key={format.code}
                      className="rounded-xl border border-white/[0.07] bg-ink-950 p-4"
                    >
                      <p className="font-display text-3xl font-bold leading-none text-gold-400/80">
                        {format.code}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {format.overs}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="h-fit rounded-2xl border border-white/[0.08] bg-ink-900 p-8 sm:p-10">
              {status === "success" ? (
                <SuccessPanel
                  title="Registration ready to send"
                  text={`Your email app should have opened with your details pre-filled for ${club.email}. The club will be in touch before the season starts.`}
                  onReset={reset}
                />
              ) : (
                <>
                  <p className="eyebrow">Registration</p>
                  <h2 className="headline mt-3 text-3xl">Tell us about your game</h2>
                  <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                    <Field label="Full name" error={errors.name} required>
                      <TextInput
                        type="text"
                        autoComplete="name"
                        value={values.name}
                        error={errors.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Your full name"
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Email" error={errors.email} required>
                        <TextInput
                          type="email"
                          autoComplete="email"
                          value={values.email}
                          error={errors.email}
                          onChange={(e) => setField("email", e.target.value)}
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field label="Phone" error={errors.phone} required>
                        <TextInput
                          type="tel"
                          autoComplete="tel"
                          value={values.phone}
                          error={errors.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          placeholder="Best number"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Preferred role" error={errors.role} required>
                        <Select
                          value={values.role}
                          error={errors.role}
                          onChange={(e) => setField("role", e.target.value)}
                        >
                          <option value="" className="bg-ink-900">
                            Select a role
                          </option>
                          {[...roles, "Wicket Keeper"].map((role) => (
                            <option key={role} value={role} className="bg-ink-900">
                              {role}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Preferred format" error={errors.format} required>
                        <Select
                          value={values.format}
                          error={errors.format}
                          onChange={(e) => setField("format", e.target.value)}
                        >
                          <option value="" className="bg-ink-900">
                            Select a format
                          </option>
                          {formats.map((format) => (
                            <option key={format.code} value={format.code} className="bg-ink-900">
                              {format.code} — {format.overs}
                            </option>
                          ))}
                          <option value="Any" className="bg-ink-900">
                            Happy with any
                          </option>
                        </Select>
                      </Field>
                    </div>

                    <Field label="Team interest" hint="optional">
                      <Select
                        value={values.team}
                        onChange={(e) => setField("team", e.target.value)}
                      >
                        <option value="" className="bg-ink-900">
                          No preference
                        </option>
                        {teams.map((team) => (
                          <option key={team.slug} value={team.name} className="bg-ink-900">
                            {team.name} ({team.format})
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Cricket experience & availability" hint="optional">
                      <TextArea
                        rows={5}
                        value={values.experience}
                        onChange={(e) => setField("experience", e.target.value)}
                        placeholder="Where have you played before, and when are you usually available?"
                      />
                    </Field>

                    <button type="submit" className="btn-primary w-full">
                      Submit registration
                    </button>
                    <p className="text-center text-xs leading-6 text-slate-600">
                      This opens your email app with your details pre-filled.
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
