import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';

/**
 * AI Model Configuration by Subscription Tier
 */
export const AI_MODELS_BY_TIER = {
    Free: {
        model: 'gemini-3-flash-preview',
        displayName: 'Basic AI Generation',
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    },
    Pro: {
        model: 'gemini-3-flash-preview',
        displayName: 'Advanced AI Generation',
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    },
    Enterprise: {
        model: 'gemini-3-flash-preview',
        displayName: 'Ultra-fast AI Generation',
        temperature: 0.9,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
    },
};

/**
 * Get AI model configuration for a specific tier
 * @param {string} tier - User's subscription tier (Free, Pro, Enterprise)
 * @returns {object} AI model configuration
 */
export function getAIConfigForTier(tier = 'Free') {
    const config = AI_MODELS_BY_TIER[tier] || AI_MODELS_BY_TIER.Free;
    return config;
}

/**
 * Get generation config for Google AI
 * @param {string} tier - User's subscription tier
 * @returns {object} Generation configuration object
 */
export function getGenerationConfig(tier = 'Free') {
    const config = getAIConfigForTier(tier);
    return {
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens,
        responseMimeType: 'text/plain',
    };
}

/**
 * Check if a feature is available for a specific tier
 * @param {string} feature - Feature name
 * @param {string} tier - User's subscription tier
 * @returns {boolean}
 */
export function isFeatureAvailable(feature, tier) {
    const features = {
        pdfExport: ['Pro', 'Enterprise'],
        advancedAI: ['Pro', 'Enterprise'],
        ultraFastAI: ['Enterprise'],
        teamCollaboration: ['Enterprise'],
        customBranding: ['Enterprise'],
    };

    return features[feature]?.includes(tier) || false;
}
