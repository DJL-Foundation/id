import { render } from "@react-email/components";
import OrganizationInviteEmail, {
	subject as organizationInviteSubject,
} from "#/emails/organization-invite";
import PasswordResetEmail, {
	subject as passwordResetSubject,
} from "#/emails/password-reset";
import VerificationEmail, {
	subject as verificationSubject,
} from "#/emails/verification";
import WelcomeEmail, { subject as welcomeSubject } from "#/emails/welcome";
import { resend } from "#/lib/email";

const FROM_ADDRESS = "DJL Foundation ID <noreply@djl-foundation.org>";

export async function sendVerificationEmail(
	to: string,
	name: string,
	url: string,
) {
	if (!resend) {
		console.warn("Resend is not configured — skipping verification email");
		return;
	}

	const html = await render(<VerificationEmail url={url} name={name} />);

	await resend.emails.send({
		from: FROM_ADDRESS,
		to,
		subject: verificationSubject,
		html,
	});
}

export async function sendPasswordResetEmail(
	to: string,
	name: string,
	url: string,
) {
	if (!resend) {
		console.warn("Resend is not configured — skipping password reset email");
		return;
	}

	const html = await render(<PasswordResetEmail url={url} name={name} />);

	await resend.emails.send({
		from: FROM_ADDRESS,
		to,
		subject: passwordResetSubject,
		html,
	});
}

export async function sendOrganizationInviteEmail(
	to: string,
	inviterName: string,
	orgName: string,
	inviteeName: string,
	url: string,
) {
	if (!resend) {
		console.warn(
			"Resend is not configured — skipping organization invite email",
		);
		return;
	}

	const html = await render(
		<OrganizationInviteEmail
			url={url}
			inviterName={inviterName}
			orgName={orgName}
			inviteeName={inviteeName}
		/>,
	);

	await resend.emails.send({
		from: FROM_ADDRESS,
		to,
		subject: organizationInviteSubject({ orgName }),
		html,
	});
}

export async function sendWelcomeEmail(to: string, name: string) {
	if (!resend) {
		console.warn("Resend is not configured — skipping welcome email");
		return;
	}

	const html = await render(<WelcomeEmail name={name} />);

	await resend.emails.send({
		from: FROM_ADDRESS,
		to,
		subject: welcomeSubject,
		html,
	});
}
