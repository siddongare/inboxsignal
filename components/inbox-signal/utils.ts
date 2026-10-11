export const demoEmail = `Subject: Quick question

Hi Sarah,

I saw Acme is hiring more AEs. We help SaaS teams improve outbound replies by finding what is unclear, generic, or too hard to act on.

Worth a quick chat next week?`;

export const demoProspect =
  "VP Sales at Series A SaaS company. Hiring 3 AEs after raising funding. Team is sending cold email but reply rates are flat.";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function scoreLabel(score: number) {
  if (score >= 80) return "Strong signal";
  if (score >= 60) return "Recoverable";
  if (score >= 40) return "Needs work";
  return "Low reply odds";
}

export function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
