
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import type { VocabularyInfo, GrammarCorrection } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const vocabularySchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    definition: { type: Type.STRING },
    examples: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    synonyms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['word', 'definition', 'examples', 'synonyms'],
};

const grammarSchema = {
  type: Type.OBJECT,
  properties: {
    originalText: { type: Type.STRING },
    correctedText: { type: Type.STRING },
    errors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          error: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['error', 'explanation'],
      },
    },
  },
  required: ['originalText', 'correctedText', 'errors'],
};


export const getWordInfo = async (word: string): Promise<VocabularyInfo> => {
  const prompt = `Provide a detailed analysis of the English word "${word}". Include its primary definition, three distinct example sentences, and a list of common synonyms.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: 'application/json',
        responseSchema: vocabularySchema,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as VocabularyInfo;
};

export const checkGrammar = async (text: string): Promise<GrammarCorrection> => {
  const prompt = `Analyze the following English text for grammatical errors. Provide the original text, a corrected version, and a list of errors with explanations for each. If there are no errors, return the original text as corrected and an empty errors array. Text: "${text}"`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Using Pro for more complex analysis
    contents: prompt,
    config: {
        responseMimeType: 'application/json',
        responseSchema: grammarSchema,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as GrammarCorrection;
};

export const getStory = async (prompt: string, level: string): Promise<string> => {
  const fullPrompt = `Write a short, engaging story in English based on the following prompt. The story should be suitable for an English learner at the ${level} level. Keep the language clear and appropriate for that level. Prompt: "${prompt}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
  });

  return response.text;
};

export const getPronunciation = async (word: string): Promise<string> => {
  const prompt = `Say the word: ${word}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data received from API.");
  }
  return base64Audio;
};

export const createConversation = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a friendly and patient English tutor named Alex. Your goal is to help me practice my English conversation skills. Keep your responses encouraging and not too long. Ask questions to keep the conversation going. Correct my major grammar mistakes gently.',
        },
    });
};
