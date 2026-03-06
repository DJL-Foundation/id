import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface WelcomeEmailProps {
	name: string;
}

export const subject = "Welcome to DJL Foundation ID";

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>{subject}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={logo}>DJL Foundation</Heading>
					<Hr style={hr} />
					<Heading as="h2" style={heading}>
						Welcome to DJL Foundation ID
					</Heading>
					<Text style={paragraph}>Hi {name},</Text>
					<Text style={paragraph}>
						Your email has been verified and your DJL Foundation ID account is
						ready to use. You can now sign in and manage your account.
					</Text>
					<Section style={buttonContainer}>
						<Link style={button} href="https://id.djl-foundation.org">
							Go to dashboard
						</Link>
					</Section>
					<Text style={paragraph}>
						If you have any questions, feel free to reach out to our support
						team.
					</Text>
					<Hr style={hr} />
					<Text style={footer}>DJL Foundation</Text>
				</Container>
			</Body>
		</Html>
	);
}

const main: React.CSSProperties = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "40px 20px",
	maxWidth: "560px",
	borderRadius: "8px",
};

const logo: React.CSSProperties = {
	fontSize: "20px",
	fontWeight: 700,
	color: "#111827",
	textAlign: "center" as const,
	margin: "0 0 16px",
};

const heading: React.CSSProperties = {
	fontSize: "24px",
	fontWeight: 600,
	color: "#111827",
	margin: "24px 0 16px",
};

const paragraph: React.CSSProperties = {
	fontSize: "15px",
	lineHeight: "26px",
	color: "#374151",
	margin: "0 0 12px",
};

const buttonContainer: React.CSSProperties = {
	textAlign: "center" as const,
	margin: "24px 0",
};

const button: React.CSSProperties = {
	backgroundColor: "#111827",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "15px",
	fontWeight: 600,
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "12px 24px",
};

const hr: React.CSSProperties = {
	borderColor: "#e5e7eb",
	margin: "24px 0",
};

const footer: React.CSSProperties = {
	fontSize: "13px",
	color: "#9ca3af",
	textAlign: "center" as const,
	margin: "0",
};
