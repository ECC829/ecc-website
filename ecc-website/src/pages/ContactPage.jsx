import { Link } from "react-router-dom";
import { Container, PageHeader, Section } from "../components/ui";
import { Field, SuccessPanel, TextArea, TextInput } from "../components/Form";
import { isEmail, mailtoLink, useForm } from "../lib/form";
import { club, showLeadership, socialLinks } from "../data/club";

const quickActions = [
  {
    to: "/register",
    title: "Player registration",
    text: "Interested in playing? Share your details and preferred format.",
  },
  {
    to: "/sponsor",
    title: "Sponsor enquiry",
    text: "Brands and partners looking for visibility with ECC.",
  },
  {
    to: "/leadership",
    title: "Leadership nominations",
    text: "Nominate a captain or vice-captain for the season.",
  },
  {
    to: "/social",
    title: "Social channels",
    text: "Instagram, WhatsApp, YouTube and Facebook.",
  },
].filter((action) => showLeadership || action.to !== "/leadership");

export default function ContactPage() {
  const { values, errors, setErrors, setField, status, setStatus, reset } = useForm({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Please tell us your name.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!isEmail(values.email)) next.email = "Enter a valid email address.";
    if (!values.message.trim()) next.message = "Please add a message.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    window.location.href = mailtoLink({
      to: club.email,
      subject: values.subject.trim() || `Website enquiry from ${values.name}`,
      fields: {
        Name: values.name,
        Email: values.email,
        Message: `\n${values.message}`,
      },
    });
    setStatus("success");
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        lead="Questions about joining, fixtures, sponsorship or anything else — the club is happy to hear from you."
      />

      <Section>
        <Container>
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Details */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8">
                <p className="eyebrow">Club contact</p>
                <dl className="mt-6 space-y-5">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      Email
                    </dt>
                    <dd className="mt-1.5">
                      <a
                        href={`mailto:${club.email}`}
                        className="break-all font-medium text-white transition hover:text-gold-300"
                      >
                        {club.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      Phone
                    </dt>
                    <dd className="mt-1.5">
                      <a
                        href={club.phoneHref}
                        className="font-medium text-white transition hover:text-gold-300"
                      >
                        {club.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      Based in
                    </dt>
                    <dd className="mt-1.5 font-medium text-white">{club.base}</dd>
                  </div>
                </dl>

                <div className="mt-8 border-t border-white/[0.07] pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    Follow the club
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 transition hover:border-gold-400/50 hover:text-gold-300"
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8">
                <p className="eyebrow">Quick links</p>
                <div className="mt-6 grid gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <p className="flex items-center justify-between gap-3 font-semibold text-white">
                        {action.title}
                        <span
                          className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-gold-300"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{action.text}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-8 sm:p-10">
              {status === "success" ? (
                <SuccessPanel
                  title="Message ready to send"
                  text={`Your email app should have opened with the message pre-filled for ${club.email}. If it didn't, email the club directly.`}
                  onReset={reset}
                />
              ) : (
                <>
                  <p className="eyebrow">Send a message</p>
                  <h2 className="headline mt-3 text-3xl">Drop the club a line</h2>
                  <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Name" error={errors.name} required>
                        <TextInput
                          type="text"
                          autoComplete="name"
                          value={values.name}
                          error={errors.name}
                          onChange={(e) => setField("name", e.target.value)}
                          placeholder="Your name"
                        />
                      </Field>
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
                    </div>

                    <Field label="Subject" hint="optional">
                      <TextInput
                        type="text"
                        value={values.subject}
                        onChange={(e) => setField("subject", e.target.value)}
                        placeholder="What's this about?"
                      />
                    </Field>

                    <Field label="Message" error={errors.message} required>
                      <TextArea
                        rows={6}
                        value={values.message}
                        error={errors.message}
                        onChange={(e) => setField("message", e.target.value)}
                        placeholder="Tell us a bit more…"
                      />
                    </Field>

                    <button type="submit" className="btn-primary w-full">
                      Send message
                    </button>
                    <p className="text-center text-xs leading-6 text-slate-600">
                      This opens your email app with the message pre-filled.
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
