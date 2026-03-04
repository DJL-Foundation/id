import { Body, Container, Head, Html, Link, Preview, Text } from '@react-email/components'
import { render } from '@react-email/render'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

function AuthEmailTemplate({
  ctaLabel,
  ctaUrl,
  intro,
}: {
  ctaLabel: string
  ctaUrl: string
  intro: string
}) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{intro}</Preview>
      <Body style={{ backgroundColor: '#f4f8f6', margin: 0, padding: '24px 0' }}>
        <Container
          style={{
            border: '1px solid #c9ddd5',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            margin: '0 auto',
            padding: '24px',
            fontFamily: 'Manrope, system-ui, sans-serif',
          }}
        >
          <Text style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>
            DJL Foundation Identity
          </Text>
          <Text style={{ color: '#254c52', lineHeight: 1.5 }}>{intro}</Text>
          <Text style={{ margin: '20px 0' }}>
            <Link
              href={ctaUrl}
              style={{
                backgroundColor: '#2f6a4a',
                color: '#ffffff',
                borderRadius: '999px',
                padding: '10px 18px',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: 700,
              }}
            >
              {ctaLabel}
            </Link>
          </Text>
          <Text style={{ color: '#4f666b', fontSize: '12px' }}>
            Falls Sie diese Aktion nicht angefordert haben, ignorieren Sie diese E-Mail.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export async function sendAuthEmail({
  to,
  subject,
  intro,
  ctaLabel,
  ctaUrl,
}: {
  to: string
  subject: string
  intro: string
  ctaLabel: string
  ctaUrl: string
}) {
  if (!resend) {
    return
  }

  const html = await render(
    <AuthEmailTemplate ctaLabel={ctaLabel} ctaUrl={ctaUrl} intro={intro} />,
  )

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'DJL Foundation <noreply@djl.foundation>',
    to,
    subject,
    html,
  })
}
