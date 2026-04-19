import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import InboxSignalApp from "@/components/inbox-signal-app";

// Daily limit constant — keep in sync with route.ts
const DAILY_ANALYSIS_LIMIT = 5;

export default async function Page() {
  // auth() is the correct server-side Clerk helper in App Router.
  // It never throws — returns { userId: null } when unauthenticated.
  const { userId } = await auth();

  // Not signed in — render Clerk's pre-built SignIn component.
  // This avoids any custom auth UI rendering bugs.
  if (!userId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#06090E",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)",
              border: "1px solid rgba(99,102,241,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(99,102,241,0.2)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="1.5" fill="#818CF8" />
              <circle
                cx="6"
                cy="6"
                r="3.5"
                stroke="rgba(129,140,248,0.5)"
                strokeWidth="0.8"
                fill="none"
              />
              <circle
                cx="6"
                cy="6"
                r="5.2"
                stroke="rgba(129,140,248,0.2)"
                strokeWidth="0.6"
                fill="none"
              />
            </svg>
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: "#E2E8F0",
              letterSpacing: "-0.02em",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Inbox<span style={{ color: "#818CF8" }}>Signal</span>
          </span>
        </div>

        {/* Clerk's pre-built SignIn handles all auth flows including
            SignUp — the afterSignIn/afterSignUp redirects go back to /  */}
        <SignIn
          routing="hash"
          afterSignInUrl="/"
          afterSignUpUrl="/"
          appearance={{
            variables: {
              colorBackground: "#0D1117",
              colorInputBackground: "#161B22",
              colorInputText: "#E2E8F0",
              colorText: "#E2E8F0",
              colorTextSecondary: "#64748B",
              colorPrimary: "#6366F1",
              colorDanger: "#F87171",
              borderRadius: "10px",
            },
            elements: {
              card: {
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              },
              formButtonPrimary: {
                background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
                fontWeight: 700,
              },
            },
          }}
        />
      </div>
    );
  }

  // Signed in — render the main app.
  // Pass DAILY_ANALYSIS_LIMIT as both values; the API response will
  // correct `remaining` on the first audit call.
  return (
    <InboxSignalApp
      initialLimit={DAILY_ANALYSIS_LIMIT}
      initialRemaining={DAILY_ANALYSIS_LIMIT}
    />
  );
}
