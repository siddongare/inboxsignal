export type ImpactLevel = "low" | "medium" | "high" | "critical";

export interface DiagnosisItem {
  issue: string;
  impact: ImpactLevel;
  whyItMatters: string;
  fix: string;
}

export interface Signals {
  clarity: number;
  relevance: number;
  credibility: number;
  ctaStrength: number;
}

export interface EmailBreakdown {
  hook: string;
  valueProp: string;
  personalization: string;
  cta: string;
}

export interface RewriteData {
  email: string;
  subjectLines: string[];
  whyThisWorks: string;
}

export interface FollowUps {
  day3: string;
  day7: string;
}

export interface AnalysisResult {
  diagnosis: DiagnosisItem[];
  signals: Signals;
  emailBreakdown: EmailBreakdown;
  rewrite: RewriteData;
  followUps: FollowUps;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  title: string;
  email: string;
  prospect: string;
  result: AnalysisResult;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditApiResponse {
  success?: boolean;
  data?: AnalysisResult;
  savedAnalysis?: SavedAnalysis;
  error?: string;
  remaining: number;
  limit: number;
}

export function getSignalScore(signals: Signals): number {
  return Math.round(
    (signals.clarity +
      signals.relevance +
      signals.credibility +
      signals.ctaStrength) /
      4,
  );
}
