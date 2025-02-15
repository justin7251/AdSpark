import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Renamed to avoid conflict
export const createMarketingHook = async (hookParams) => {
  const { product, audience, tone, platform } = hookParams;
  
  try {
    const response = await axios.post('/api/generate-hook', {
      product,
      audience,
      tone,
      platform
    }, {
      // Increased timeout and detailed error handling
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Default
      }
    });

    console.log('API Response:', response.data);

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.hooks)) {
      console.error('Invalid API response:', response.data);
      throw new Error('Invalid hook generation response');
    }

    // Ensure consistent return format
    return response.data.hooks.map((hook, index) => ({
      id: index + 1,
      content: hook,
      hashtags: [
        product.replace(/\s/g, '').toLowerCase(),
        platform.toLowerCase(),
        tone.toLowerCase()
      ]
    }));
  } catch (error) {
    console.error('Hook generation error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    throw new Error('Hook Generation Failed: ' + (
      error.response?.data?.details || 
      error.response?.data?.message || 
      error.message
    ));
  }
};

export const continueHookConversation = async (previousHook, context) => {
  try {
    const response = await axios.post('/api/continue-hook', {
      previousHook,
      context
    }, {
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });

    console.log('Continue Hook API Response:', response.data);

    // Validate response structure
    if (!response.data || !response.data.continuedHook) {
      console.error('Invalid continuation response:', response.data);
      throw new Error('Invalid hook continuation response');
    }

    return {
      content: response.data.continuedHook,
      hashtags: [
        context.product.replace(/\s/g, '').toLowerCase(),
        context.platform.toLowerCase(),
        context.tone.toLowerCase()
      ]
    };
  } catch (error) {
    console.error('Hook continuation error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    throw new Error('Hook Continuation Failed: ' + (
      error.response?.data?.details || 
      error.response?.data?.message || 
      error.message
    ));
  }
};

export async function generateHookVariations(baseHook, params) {
  try {
    const response = await axios.post('/api/generate-hook', {
      contents: [{
        parts: [{
          text: `Hook Variation Challenge:

Original Hook Context:
- Original Hook: "${baseHook}"
- Product: ${params.product}
- Target Audience: ${params.audience}
- Tone Preference: ${params.tone}

Variation Objectives:
1. Maintain core message essence
2. Explore different emotional angles
3. Adapt to audience segments
4. Showcase unique perspectives

Variation Guidelines:
- Generate 3 distinct hook variations
- Maximum 150 characters each
- Preserve original hook's core message
- Use creative, engaging language
- Highlight different product benefits`
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 300
      }
    });

    // Extract variations from the response
    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Split and process variations
    const variations = generatedText.split('\n')
      .filter(hook => 
        hook.trim() !== '' && 
        hook.length <= 150 && 
        !/^\d+\./.test(hook.trim())  // Remove numbered prefixes
      )
      .map(hook => ({
        content: hook.trim(),
        createdAt: new Date().toISOString(),
        id: uuidv4()
      }))
      .slice(0, 3);  // Limit to 3 variations

    return variations;
  } catch (error) {
    console.error("Gemini Hook Variations Error:", error);
    throw error;
  }
}
