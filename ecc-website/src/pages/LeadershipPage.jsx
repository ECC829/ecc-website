import { Container, PageHeader, Section } from "../components/ui";
import { Field, SuccessPanel, TextInput, ToggleGroup } from "../components/Form";
import { digitCount, isEmail, useForm } from "../lib/form";
import { season } from "../data/club";
import { teamBySlug } from "../data/teams";

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbziWvPSEJ2SP7wtQV_306-9HjyT-1Hnu6ne2M67QsCGVZQg78JoxF7kCm3l2UNNTjk1oA/exec";

const initialValues = {
  submitterName: "",
  submitterContact: "",
  submitterEmail: "",
  vajrasCaptainChange: "",
  vajrasCaptainNominee: "",
  vajrasViceCaptainChange: "",
  vajrasViceCaptainNominee: "",
  garudasCaptainInterested: "",
  garudasCaptainNominee: "",
  garudasViceCaptainInterested: "",
  garudasViceCaptainNominee: "",
};

/** Each nomination question: a Yes/No toggle that reveals a name field. */
const questions = [
  {
    teamSlug: "vajras",
    section: "Vajras leadership",
    items: [
      {
        toggle: "vajrasCaptainChange",
        nominee: "vajrasCaptainNominee",
        label: "Should the Vajras captaincy change from last year?",
        placeholder: "Nominate a Vajras captain",
        nomineeError: "Please nominate a captain.",
      },
      {
        toggle: "vajrasViceCaptainChange",
        nominee: "vajrasViceCaptainNominee",
        label: "Should the Vajras vice-captaincy change from last year?",
        placeholder: "Nominate a Vajras vice-captain",
        nomineeError: "Please nominate a vice-captain.",
      },
    ],
  },
  {
    teamSlug: "garudas",
    section: "Garudas leadership",
    items: [
      {
        toggle: "garudasCaptainInterested",
        nominee: "garudasCaptainNominee",
        label: "Should the Garudas captaincy change from last year?",
        placeholder: "Nominate a Garudas captain",
        nomineeError: "Please nominate a captain.",
      },
      {
        toggle: "garudasViceCaptainInterested",
        nominee: "garudasViceCaptainNominee",
        label: "Should the Garudas vice-captaincy change from last year?",
        placeholder: "Nominate a Garudas vice-captain",
        nomineeError: "Please nominate a vice-captain.",
      },
    ],
  },
];

export default function LeadershipPage() {
  const { values, errors, setErrors, setField, status, setStatus, reset } =
    useForm(initialValues);

  const handleToggle = (item, value) => {
    // Clearing the toggle to "No" also clears any nominee already typed.
    setField(item.toggle, value, value !== "Yes" ? { [item.nominee]: "" } : {});
    if (value !== "Yes") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[item.nominee];
        return next;
      });
    }
  };

  const validate = () => {
    const next = {};

    if (!values.submitterName.trim()) next.submitterName = "Name is required.";
    if (!values.submitterContact.trim()) {
      next.submitterContact = "Contact number is required.";
    } else if (digitCount(values.submitterContact) < 10) {
      next.submitterContact = "Enter a valid 10-digit contact number.";
    }
    if (!values.submitterEmail.trim()) {
      next.submitterEmail = "Email is required.";
    } else if (!isEmail(values.submitterEmail)) {
      next.submitterEmail = "Enter a valid email address.";
    }

    questions.forEach((group) =>
      group.items.forEach((item) => {
        if (!values[item.toggle]) next[item.toggle] = "Please select Yes or No.";
        if (values[item.toggle] === "Yes" && !values[item.nominee].trim()) {
          next[item.nominee] = item.nomineeError;
        }
      })
    );

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      document
        .querySelector("[data-error='true']")
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      setStatus(result.status === "success" ? "success" : "error");
    } catch (error) {
      console.error("Leadership form submission failed", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <>
        <PageHeader eyebrow="Leadership" title="Nomination received" />
        <Container className="py-16">
          <div className="mx-auto max-w-lg">
            <SuccessPanel
              title="Thank you"
              text="Your nomination has been recorded. The club will review all submissions before confirming leadership for the season."
              onReset={reset}
            />
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Leadership"
        title={`${season.year} captaincy nominations`}
        lead={`Nominate the captain and vice-captain for ECC Vajras and ECC Garudas for the ${season.year} season. You can nominate yourself or recommend a player you believe is best suited to the role.`}
      />

      <Section>
        <Container className="max-w-3xl">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Submitter */}
            <fieldset className="rounded-2xl border border-white/[0.08] bg-ink-900 p-7 sm:p-8">
              <legend className="eyebrow px-1">Your details</legend>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <div data-error={Boolean(errors.submitterName)}>
                  <Field label="Name" error={errors.submitterName} required>
                    <TextInput
                      type="text"
                      autoComplete="name"
                      value={values.submitterName}
                      error={errors.submitterName}
                      onChange={(e) => setField("submitterName", e.target.value)}
                      placeholder="Your full name"
                    />
                  </Field>
                </div>
                <div data-error={Boolean(errors.submitterContact)}>
                  <Field label="Contact" error={errors.submitterContact} required>
                    <TextInput
                      type="tel"
                      autoComplete="tel"
                      value={values.submitterContact}
                      error={errors.submitterContact}
                      onChange={(e) => setField("submitterContact", e.target.value)}
                      placeholder="Phone number"
                    />
                  </Field>
                </div>
                <div data-error={Boolean(errors.submitterEmail)}>
                  <Field label="Email" error={errors.submitterEmail} required>
                    <TextInput
                      type="email"
                      autoComplete="email"
                      value={values.submitterEmail}
                      error={errors.submitterEmail}
                      onChange={(e) => setField("submitterEmail", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>
              </div>
            </fieldset>

            {/* Nominations */}
            {questions.map((group) => {
              const team = teamBySlug[group.teamSlug];
              return (
                <fieldset
                  key={group.section}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 p-7 sm:p-8"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: team.accent }}
                    aria-hidden="true"
                  />
                  <legend className="px-1 text-[11px] font-semibold uppercase tracking-ultra" style={{ color: team.accent }}>
                    {group.section}
                  </legend>

                  <div className="mt-7 space-y-8">
                    {group.items.map((item) => (
                      <div key={item.toggle} data-error={Boolean(errors[item.toggle])}>
                        <p className="text-[15px] font-medium text-white">{item.label}</p>
                        <div className="mt-4">
                          <ToggleGroup
                            name={item.label}
                            value={values[item.toggle]}
                            error={errors[item.toggle]}
                            onChange={(value) => handleToggle(item, value)}
                          />
                        </div>
                        {errors[item.toggle] && (
                          <p className="mt-2 text-xs text-red-400">{errors[item.toggle]}</p>
                        )}

                        {values[item.toggle] === "Yes" && (
                          <div className="mt-4 animate-fade-up">
                            <Field label="Nomination" error={errors[item.nominee]} required>
                              <TextInput
                                type="text"
                                value={values[item.nominee]}
                                error={errors[item.nominee]}
                                onChange={(e) => setField(item.nominee, e.target.value)}
                                placeholder={item.placeholder}
                              />
                            </Field>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </fieldset>
              );
            })}

            {status === "error" && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/40 bg-red-500/[0.08] px-5 py-4 text-sm text-red-300"
              >
                Something went wrong submitting the form. Please try again, or email
                the club directly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn-primary w-full"
            >
              {status === "submitting" ? "Submitting…" : "Submit nomination"}
            </button>

            <p className="text-center text-xs leading-6 text-slate-600">
              Nominations are reviewed by club organisers. Your contact details are
              used only to follow up on this submission.
            </p>
          </form>
        </Container>
      </Section>
    </>
  );
}
