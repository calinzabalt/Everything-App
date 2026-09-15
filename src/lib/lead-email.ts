export const SIENA_CONTACT_EMAIL = "hello@sienaworks.com";
export const SIENA_CONTACT_URL = "https://sienaworks.com/contact";

export type LeadEmailDraft = {
  subject: string;
  intro: string;
};

export function defaultLeadEmailDraft(lead: { name: string }): LeadEmailDraft {
  const name = lead.name.trim() || "there";
  return {
    subject: `WordPress & web development for ${name}`,
    intro: [
      `Hi ${name},`,
      "",
      "I'm reaching out from SIENA, a boutique WordPress and web development studio. We help businesses and digital agencies with custom WordPress, WooCommerce, performance work and modern front-ends.",
      "",
      "If you have a project in mind — a new site, work on an existing WordPress build, or ongoing development support — I'd like to hear what you're building.",
    ].join("\n"),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function introToHtml(intro: string) {
  const blocks = intro
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return "";

  return blocks
    .map((block) => {
      const html = escapeHtml(block).replace(/\n/g, "<br>");
      return `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#141311;">${html}</p>`;
    })
    .join("");
}

const SERVICES: { title: string; copy: string }[] = [
  {
    title: "WordPress Development",
    copy: "Custom themes, ACF, PHP and JavaScript — new sites, existing sites and integrations.",
  },
  {
    title: "WooCommerce Development",
    copy: "Custom product behaviour, checkout, integrations and work on existing WooCommerce stores.",
  },
  {
    title: "WordPress Performance",
    copy: "Speed work on WordPress: queries, caching, plugins, Core Web Vitals and the server stack.",
  },
  {
    title: "React & Headless Development",
    copy: "React, Next.js and headless WordPress — CMS flexibility with a modern frontend.",
  },
  {
    title: "Ongoing Development & Support",
    copy: "Retainers and project-based work after launch: fixes, new features, WordPress care and technical support.",
  },
];

function serviceRows() {
  return SERVICES.map(
    (service, index) => `
      <tr>
        <td style="padding:${index === 0 ? "0" : "16px"} 0 ${index === SERVICES.length - 1 ? "0" : "16px"};${
          index === SERVICES.length - 1 ? "" : "border-bottom:1px solid #d4cfc4;"
        }">
          <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.4;color:#141311;">${escapeHtml(service.title)}</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#6f6b62;">${escapeHtml(service.copy)}</p>
        </td>
      </tr>`,
  ).join("");
}

export function buildLeadEmailHtml(intro: string) {
  const introHtml = introToHtml(intro);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SIENA</title>
</head>
<body style="margin:0;padding:0;background-color:#efece6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#efece6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#efece6;">
          <tr>
            <td style="padding:8px 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <div style="width:10px;height:10px;background-color:#9a3412;line-height:10px;font-size:10px;">&nbsp;</div>
                  </td>
                  <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;letter-spacing:0.22em;color:#141311;">SIENA</td>
                </tr>
              </table>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.4;color:#6f6b62;">WordPress &amp; Web Development Studio</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;">
              ${introHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;">
              <p style="margin:0 0 8px;font-family:Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6f6b62;">Studio</p>
              <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:normal;color:#141311;">WordPress &amp; Web Development for Businesses and Digital Agencies</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c2a26;">Custom WordPress, WooCommerce and modern web development for businesses that need reliable technical expertise.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0 0 16px;font-family:Consolas,'Courier New',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6f6b62;">Services</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${serviceRows()}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e5e0d6;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.35;color:#141311;">Your clients. Our development support.</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#6f6b62;">White-label WordPress, WooCommerce, custom functionality, ACF/PHP, bug fixing, performance, API integrations, ongoing development.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#141311;">
                <tr>
                  <td style="padding:32px 28px;">
                    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#efece6;">Have a project in mind?</p>
                    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#a8a39a;">Tell us what you're building.</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#efece6;">
                          <a href="${SIENA_CONTACT_URL}" style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#141311;text-decoration:none;">Start a Project &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;border-top:1px solid #d4cfc4;">
              <p style="margin:16px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6f6b62;">A boutique WordPress and web development studio. Custom builds, WooCommerce, performance work and modern front-ends for businesses and digital agencies.</p>
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6f6b62;">Working with clients in the UK, US, Canada and Europe.</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6f6b62;">
                <a href="mailto:${SIENA_CONTACT_EMAIL}" style="color:#9a3412;text-decoration:none;">${SIENA_CONTACT_EMAIL}</a>
              </p>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b7b1a4;">SIENA &nbsp;&middot;&nbsp; ${year}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildLeadEmailText(intro: string) {
  const services = SERVICES.map(
    (service) => `${service.title}\n${service.copy}`,
  ).join("\n\n");

  return [
    intro.trim(),
    "",
    "WordPress & Web Development for Businesses and Digital Agencies",
    "Custom WordPress, WooCommerce and modern web development for businesses that need reliable technical expertise.",
    "",
    "Services",
    services,
    "",
    "Your clients. Our development support.",
    "White-label WordPress, WooCommerce, custom functionality, ACF/PHP, bug fixing, performance, API integrations, ongoing development.",
    "",
    "Have a project in mind?",
    "Tell us what you're building.",
    `Start a Project: ${SIENA_CONTACT_URL}`,
    "",
    "A boutique WordPress and web development studio. Custom builds, WooCommerce, performance work and modern front-ends for businesses and digital agencies.",
    "Working with clients in the UK, US, Canada and Europe.",
    SIENA_CONTACT_EMAIL,
  ].join("\n");
}

export function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&rarr;/g, "->")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
