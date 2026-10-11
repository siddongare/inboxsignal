import { auth } from "@clerk/nextjs/server";
import InboxSignalShell from "@/components/inbox-signal-shell";
import { getAnalysisHistory } from "@/lib/history";
import { getUsageSummary, DAILY_ANALYSIS_LIMIT } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <InboxSignalShell
        initialHistory={[]}
        initialLimit={DAILY_ANALYSIS_LIMIT}
        initialRemaining={0}
      />
    );
  }

  const [history, usage] = await Promise.all([
    getAnalysisHistory(userId),
    getUsageSummary(userId),
  ]);

  return (
    <InboxSignalShell
      initialHistory={history}
      initialLimit={usage.limit}
      initialRemaining={usage.remaining}
    />
  );
}
