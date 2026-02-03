
import { Platform, WorkspaceTask } from './types';

export const PLATFORMS: Platform[] = [Platform.Meta, Platform.TikTok, Platform.YouTube, Platform.Google, Platform.X];

export const WORKSPACE_TASKS: WorkspaceTask[] = [
    WorkspaceTask.PolishAdCopy,
    WorkspaceTask.RewriteAdForTikTok,
    WorkspaceTask.RewriteAdForYouTubeShorts,
    WorkspaceTask.RewriteAdForMeta,
    WorkspaceTask.CritiqueLandingPage,
    WorkspaceTask.RewriteLandingPageToConvert,
    WorkspaceTask.CreateClientEmail,
    WorkspaceTask.SummarizeForSlack,
    WorkspaceTask.CreateChecklistFromPlan,
];

export const DIAGNOSIS_DEPENDENT_TASKS: WorkspaceTask[] = [
    WorkspaceTask.CreateClientEmail,
    WorkspaceTask.SummarizeForSlack,
    WorkspaceTask.CreateChecklistFromPlan,
];


export const PRICING_PLANS = [
    {
        name: 'STARTER',
        price: '$9.99 / month',
        description: 'Best for solo founders and small accounts who want a simple monthly ROI tune-up.',
        features: [
            '1 active ad account',
            'ROI Diagnosis on your key campaigns',
            'Money Leak Heatmap (GREEN / YELLOW / RED)',
            'Viral Creative Pack (hooks, copy ideas, thumbnail concepts)',
            '30-Day ROI Boost Plan for that account',
            'Access to the Gemini Smart Workspace',
        ],
        url: 'https://socialadroiturbo.lemonsqueezy.com/buy/48c646fa-cd44-4422-995c-5678277d5ff5',
    },
    {
        name: 'GROWTH',
        price: '$29.99 / month',
        description: 'For marketers and small teams running multiple campaigns every month. Includes everything in Starter.',
        features: [
            'Higher limits for campaigns and creatives',
            'Deeper ROI diagnoses across more ad sets',
            'Extra Viral Creative ideas you can test',
            'Tracking & UTM checklists for reliable data',
            'A reusable 30-Day ROI Boost Playbook',
        ],
        url: 'https://socialadroiturbo.lemonsqueezy.com/buy/0b1436e9-50c3-4d6a-aab5-fc22cab7b521',
    },
    {
        name: 'AGENCY',
        price: '$99.99 / month',
        description: 'Built for agencies and high-volume media buyers managing multiple client accounts.',
        features: [
            'Deep ROI Diagnoses across multiple client accounts',
            'Money Leak Heatmaps per client',
            'Client-ready Viral Creative Packs',
            'Tracking & UTM frameworks for your whole roster',
            'A 30-Day ROI Boost Plan you can clone per client',
            'Workspace prompts for client emails, proposals, etc.',
        ],
        url: 'https://socialadroiturbo.lemonsqueezy.com/buy/2fb693d4-36f6-4a77-b4c6-750db0235e39',
    },
];
