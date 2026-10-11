import { auth } from "@clerk/nextjs/server";
import InboxSignalShell from "@/components/inbox-signal-shell";
import { getAnalysisHistory } from "@/lib/history";
import { getUsageSummary, DAILY_ANALYSIS_LIMIT } from "@/lib/usage";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { userId } = await auth();
  const params = await searchParams;
  const initialNav = (params?.tab as "studio" | "analytics" | "templates" | "rubric") || "studio";

  if (!userId) {
    return (
      <InboxSignalShell
        initialHistory={[]}
        initialLimit={DAILY_ANALYSIS_LIMIT}
        initialRemaining={0}
        initialNav={initialNav}
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
      initialNav={initialNav}
    />
  );
}
