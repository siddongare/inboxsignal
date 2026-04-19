import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import InboxSignalApp from "@/components/inbox-signal-app";
import { getUsageSummary } from "@/lib/usage";

export const dynamic = "force-dynamic";

function AuthGate() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 32%), #06090E",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "32px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
          color: "#E2E8F0",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#818CF8",
          }}
        >
          InboxSignal
        </p>
        <h1
          style={{
            margin: "14px 0 10px",
            fontSize: "32px",
            lineHeight: 1.1,
          }}
        >
          Login to use InboxSignal
        </h1>
        <p
          style={{
            margin: 0,
            color: "#94A3B8",
            lineHeight: 1.7,
          }}
        >
          Login to start analyzing your emails.
        </p>
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <SignInButton mode="modal">
            <button
              style={{
                minWidth: "120px",
                minHeight: "44px",
                padding: "0 18px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#6366F1",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              style={{
                minWidth: "120px",
                minHeight: "44px",
                padding: "0 18px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "#E2E8F0",
                cursor: "pointer",
              }}
            >
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </main>
  );
}

export default async function AppPage() {
  const { userId } = await auth();

  if (!userId) {
    return <AuthGate />;
  }

  const usage = await getUsageSummary(userId);

  return (
    <InboxSignalApp
      initialLimit={usage.limit}
      initialRemaining={usage.remaining}
    />
  );
}
