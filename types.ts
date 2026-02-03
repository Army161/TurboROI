
export enum Platform {
    Meta = "Meta",
    TikTok = "TikTok",
    YouTube = "YouTube",
    Google = "Google",
    X = "X (Twitter)",
}

export enum WorkspaceTask {
    PolishAdCopy = "Polish ad copy",
    RewriteAdForTikTok = "Rewrite ad for TikTok/Reels",
    RewriteAdForYouTubeShorts = "Rewrite ad for YouTube Shorts",
    RewriteAdForMeta = "Rewrite ad for Meta",
    CritiqueLandingPage = "Critique landing page",
    RewriteLandingPageToConvert = "Rewrite landing page to convert better",
    CreateClientEmail = "Turn my diagnosis into a client email",
    SummarizeForSlack = "Summarize for Slack / internal update",
    CreateChecklistFromPlan = "Create a step-by-step checklist",
}

export interface Inputs {
    platform: Platform;
    performanceData: string;
    adCopy: string;
    adSpend: number;
    adScreenshot: {
        base64: string;
        mimeType: string;
    } | null;
    deepAudit: boolean;
}

export interface HeatmapItem {
    area: string;
    issue: string;
    severity: 'High' | 'Medium' | 'Low';
}

export interface CreativePack {
    hooks: string[];
    copy: string[];
    imagePrompts: string[];
}

export interface PlanItem {
    week: string;
    focus: string;
    actions: string[];
}

export interface DiagnosisOutput {
    roiDiagnosis: string;
    moneyLeakHeatmap: HeatmapItem[];
    viralCreativePack: CreativePack;
    trackingFixes: string;
    roiBoostPlan: PlanItem[];
}

export interface HistoryItem {
    id: string;
    timestamp: number;
    inputs: Inputs;
    output: DiagnosisOutput;
}
