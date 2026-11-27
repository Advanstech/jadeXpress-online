import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Link } from "@/components/Link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "JadeXpress Manager Privacy Policy",
  description:
    "Privacy policy for the JadeXpress Manager staff app and its connection to the JadeXpress management API.",
  alternates: { canonical: "/mobile-privacy" },
  openGraph: {
    title: "JadeXpress Manager Privacy Policy",
    description:
      "How JadeXpress Enterprise handles information when authorized staff use JadeXpress Manager.",
    url: "/mobile-privacy",
    type: "article",
  },
};

export default function MobilePrivacyPage() {
  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-20">
          <span className="eyebrow">Legal · Staff application</span>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            JadeXpress Manager Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-primary-foreground/80">
            How JadeXpress Enterprise handles information when authorized staff
            use the manager app and its connection to the JadeXpress management
            API.
          </p>
          <p className="mt-5 text-sm text-primary-foreground/70">
            Effective date: 27 November 2026
          </p>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <article className="mx-auto max-w-4xl space-y-6">
          <PolicySection id="scope" title="Who this policy covers">
            <p>
              JadeXpress Manager is an internal business application for
              authorized JadeXpress owners, managers and supervisors. It is not
              the customer storefront and does not offer public consumer
              registration.
            </p>
            <p>
              This policy covers the Android manager app and the JadeXpress
              management API it uses to provide staff operations tools.
            </p>
          </PolicySection>

          <PolicySection id="information" title="Information the app processes">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Staff account information:</strong> the name, email
                address, role and branch assignment associated with a staff
                account.
              </li>
              <li>
                <strong>Authentication information:</strong> access and refresh
                tokens used to keep an authorized staff member signed in.
              </li>
              <li>
                <strong>Business activity:</strong> actions performed in the
                app, such as sign-ins, branch switches, approvals and other
                audited management tasks.
              </li>
              <li>
                <strong>Technical request information:</strong> information
                received by the server when the app connects, such as IP
                address, user agent and request timestamps.
              </li>
              <li>
                <strong>Local preference:</strong> the selected System, Light
                or Dark appearance.
              </li>
            </ul>
            <p>
              The app does not request access to contacts, photos, camera,
              microphone or precise location. Its Android permission is network
              access so it can communicate with the JadeXpress API.
            </p>
          </PolicySection>

          <PolicySection id="use" title="How information is used">
            <ul className="list-disc space-y-2 pl-5">
              <li>Authenticate staff and maintain secure sessions.</li>
              <li>
                Apply role-based permissions and authorized branch scope.
              </li>
              <li>
                Provide dashboards, approvals, inventory, finance and other
                management functions.
              </li>
              <li>
                Maintain operational and financial audit records.
              </li>
              <li>
                Protect the service, investigate misuse and provide support.
              </li>
            </ul>
          </PolicySection>

          <PolicySection id="security" title="Storage and security">
            <p>
              Production app traffic uses HTTPS. Authentication tokens and
              local app preferences are stored using the device platform&apos;s
              secure storage mechanisms. Business records are held in JadeXpress
              systems with server-side role and branch controls.
            </p>
            <p>
              No method of transmission or storage is completely secure.
              JadeXpress uses technical and organizational safeguards
              appropriate to the sensitivity of business and staff information.
            </p>
          </PolicySection>

          <PolicySection id="retention" title="Retention">
            <p>
              Authentication tokens remain until they expire, are revoked or
              the staff member signs out. The appearance preference remains
              until it is changed or the app&apos;s local data is cleared.
            </p>
            <p>
              Operational, financial and audit records are retained for as long
              as needed to run the business, meet accounting or legal
              obligations, resolve disputes and enforce agreements.
            </p>
          </PolicySection>

          <PolicySection id="sharing" title="Sharing and service providers">
            <p>
              Information may be visible to authorized JadeXpress personnel
              according to their role. Trusted infrastructure and support
              providers may process information on JadeXpress&apos;s behalf to
              host, secure and support the service.
            </p>
            <p>
              JadeXpress does not sell staff information or use it for
              third-party advertising. Information may be disclosed when
              required by law or to protect the rights, safety and security of
              JadeXpress, its staff or others.
            </p>
          </PolicySection>

          <PolicySection id="choices" title="Staff choices and requests">
            <p>
              Staff can sign out to end the current session. Clearing the
              app&apos;s data removes locally stored tokens and preferences.
            </p>
            <p>
              For access, correction, deletion or other privacy questions,
              contact the JadeXpress administrator or email{" "}
              <a className="font-semibold text-primary hover:underline" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              . Requests are subject to record-retention requirements and
              identity verification.
            </p>
          </PolicySection>

          <PolicySection id="children" title="Children">
            <p>
              JadeXpress Manager is a business application for authorized staff
              and is not directed to children.
            </p>
          </PolicySection>

          <PolicySection id="changes" title="Changes to this policy">
            <p>
              JadeXpress may update this policy as the app or service changes.
              The effective date above will be updated when a revised policy is
              published.
            </p>
          </PolicySection>

          <PolicySection id="contact" title="Contact">
            <address className="not-italic">
              <strong className="text-foreground">{SITE.legalName}</strong>
              <br />
              {SITE.addressLine}, {SITE.region}
              <br />
              Email:{" "}
              <a className="font-semibold text-primary hover:underline" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              <br />
              Phone:{" "}
              <a className="font-semibold text-primary hover:underline" href={`tel:${SITE.phone}`}>
                {SITE.phone}
              </a>
              <br />
              Website:{" "}
              <a className="font-semibold text-primary hover:underline" href={`https://${SITE.domain}`}>
                {SITE.domain}
              </a>
            </address>
          </PolicySection>

          <div className="rounded-lg border border-border bg-secondary/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Questions about JadeXpress products, orders or the customer
              storefront? Visit our contact page.
            </p>
            <Link
              to="/contact"
              className="mt-3 inline-flex font-semibold text-primary hover:underline"
            >
              Contact JadeXpress
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="rounded-lg border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <h2
        id={`${id}-title`}
        className="font-display text-2xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
