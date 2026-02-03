
import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import { Inputs, WorkspaceTask } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ROI_TURBO_PERSONA = `
You are **Social Ad ROI Turbo** — an elite, ROI-obsessed performance marketing strategist specializing in Meta, TikTok, YouTube (Long-form & Shorts), Google, and X.

Your goal is to maximize profitable growth. 

PLATFORM-SPECIFIC BRAINS (UPDATED):
- **YouTube Shorts**: Apply TikTok parallels. 
  - Hooks must be < 2 seconds. 
  - Use pattern interrupts (visual/audio changes). 
  - Content should feel like UGC (User Generated Content) or high-energy edu-tainment.
  - Emphasize "Safe Zones" (no vital info in bottom 25% or right 15%).
  - CTAs must be vocalized and visually pinned.
  - Parallel: If it works on TikTok, it likely works on Shorts, but with slightly broader appeal.
- **YouTube Long-form**: 5-10s hook. In-depth proof. Remarketing focus.
- **Meta**: Direct response, "problem-agitate-solution".
- **TikTok**: High-velocity creative. Non-ad feel.

BUDGET & CAMPAIGN CLASSIFICATION LOGIC:
1. **Winner**: Meets target ROAS/CPA. Suggest 20% budget scale.
2. **Under-tested**: Low data. Keep spend steady.
3. **Loser**: High CPA. Pause or pivot creative immediately.

OUTPUT MAPPING:
Follow the strict JSON schema provided. In your 'roiDiagnosis', always specifically mention YouTube Shorts optimization if the user selects YouTube as a platform.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        roiDiagnosis: {
            type: Type.STRING,
            description: "The core strategic analysis. Formatted in Markdown.",
        },
        moneyLeakHeatmap: {
            type: Type.ARRAY,
            description: "List of spend leaks.",
            items: {
                type: Type.OBJECT,
                properties: {
                    area: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    severity: { type: Type.STRING },
                },
                required: ["area", "issue", "severity"],
            },
        },
        viralCreativePack: {
            type: Type.OBJECT,
            properties: {
                hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                copy: { type: Type.ARRAY, items: { type: Type.STRING } },
                imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["hooks", "copy", "imagePrompts"],
        },
        trackingFixes: {
            type: Type.STRING,
        },
        roiBoostPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    week: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["week", "focus", "actions"],
            },
        },
    },
    required: ["roiDiagnosis", "moneyLeakHeatmap", "viralCreativePack", "trackingFixes", "roiBoostPlan"],
};


export const runDiagnosis = async (inputs: Inputs) => {
    const promptParts: (string | Part)[] = [
        ROI_TURBO_PERSONA,
        `INPUT DATA:`,
        `Platform: ${inputs.platform}`,
        `Spend: $${inputs.adSpend}`,
        `Metrics: ${inputs.performanceData || 'None'}`,
        `Copy: ${inputs.adCopy || 'None'}`,
        inputs.deepAudit ? `TASK: DEEP AUDIT.` : `TASK: Standard Audit.`,
        `Format: JSON object only.`
    ];

    if (inputs.adScreenshot) {
        promptParts.push({
            inlineData: {
                mimeType: inputs.adScreenshot.mimeType,
                data: inputs.adScreenshot.base64,
            },
        });
    }

    const diagnosisModel = inputs.deepAudit ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: diagnosisModel,
        contents: { parts: promptParts.map(p => typeof p === 'string' ? { text: p } : p) },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    try {
        return JSON.parse(response.text.trim());
    } catch (e) {
        throw new Error("Invalid response from AI.");
    }
};

export const generateImages = async (prompts: string[]) => {
    const images: string[] = [];
    for (const prompt of prompts) {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `High-converting ad visual for: ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        images.push(`data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`);
    }
    return images;
};

export const runSandboxTask = async (task: 'generate_hooks' | 'rewrite_copy', context: any) => {
    const prompt = `You are Social Ad ROI Turbo. ${task === 'generate_hooks' ? 'Generate 3-5 high-converting ad hooks' : 'Rewrite this ad copy'} for ${context.platform}. 
    Focus on YouTube Shorts/TikTok best practices if relevant (fast hook, UGC style). 
    Original: ${context.copy}. 
    ${task === 'generate_hooks' ? 'Return JSON array of strings.' : 'Return text only.'}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: task === 'generate_hooks' ? { responseMimeType: "application/json" } : {}
    });

    return response.text;
};

export const runWorkspaceTask = async (task: string, content: string, context?: { diagnosis?: string }) => {
    let prompt = `You are Social Ad ROI Turbo. Act as an elite media buyer. Task: ${task}.\n\n`;
    const personaPrefix = "Focus on ROI, clear CTAs, and platform-specific nuances like YouTube Shorts hooks and Meta direct response. ";

    switch (task as WorkspaceTask) {
        case WorkspaceTask.RewriteAdForYouTubeShorts:
            prompt += `${personaPrefix}Rewrite this for YouTube Shorts. Crucial: 1-2s hook, UGC feel, and verbalized CTA. Context: ${content || context?.diagnosis}`;
            break;
        case WorkspaceTask.RewriteAdForTikTok:
            prompt += `${personaPrefix}Rewrite for TikTok. Fast-paced, non-ad feel. Context: ${content || context?.diagnosis}`;
            break;
        case WorkspaceTask.RewriteAdForMeta:
            prompt += `${personaPrefix}Rewrite for Meta Sales/Leads. Benefit-stacking style. Context: ${content || context?.diagnosis}`;
            break;
        case WorkspaceTask.PolishAdCopy:
            prompt += `${personaPrefix}Polish this copy for maximum conversions. Context: ${content}`;
            break;
        case WorkspaceTask.CritiqueLandingPage:
            prompt += `${personaPrefix}Critique this landing page based on conversion optimization. Context: ${content}`;
            break;
        case WorkspaceTask.RewriteLandingPageToConvert:
            prompt += `${personaPrefix}Rewrite landing page content to sell better. Context: ${content}`;
            break;
        case WorkspaceTask.CreateClientEmail:
            prompt += `${personaPrefix}Write a professional client report email based on this diagnosis: ${context?.diagnosis}`;
            break;
        case WorkspaceTask.SummarizeForSlack:
            prompt += `${personaPrefix}Summarize for Slack (TL;DR). Context: ${context?.diagnosis}`;
            break;
        case WorkspaceTask.CreateChecklistFromPlan:
            prompt += `${personaPrefix}Turn this plan into a tactical checklist. Context: ${context?.diagnosis}`;
            break;
        default:
            prompt += `Perform ${task} on the following: ${content || context?.diagnosis}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
    });

    return response.text;
};
