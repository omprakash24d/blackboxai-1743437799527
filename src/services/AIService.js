import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import annotationService from './annotationService';

const API_KEY = 'YOUR_OPENAI_API_KEY';
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Cache for storing AI responses
const responseCache = {};
const textCache = {};

export const cachePageText = (pageNum, text) => {
  textCache[`page_${pageNum}`] = text;
};

export const getCachedText = (pageNum) => {
  return textCache[`page_${pageNum}`];
};

export const clearTextCache = () => {
  Object.keys(textCache).forEach(key => delete textCache[key]);
};

export const generateFlashcards = async (text, context) => {
  const cacheKey = `flashcards:${text.substring(0, 50)}`;
  if (responseCache[cacheKey]) return responseCache[cacheKey];

  try {
    const response = await axios.post(API_URL, {
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Generate flashcards from this text. Context: ${context}`
      }, {
        role: "user",
        content: text
      }],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const flashcards = parseFlashcards(response.data.choices[0].message.content);
    responseCache[cacheKey] = flashcards;
    return flashcards;
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    throw error;
  }
};

export const generateSummary = async (text, context) => {
  const cacheKey = `summary:${text.substring(0, 50)}`;
  if (responseCache[cacheKey]) return responseCache[cacheKey];

  try {
    const response = await axios.post(API_URL, {
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Summarize this text for studying. Context: ${context}`
      }, {
        role: "user",
        content: text
      }],
      temperature: 0.5,
      max_tokens: 300
    });

    const summary = response.data.choices[0].message.content;
    responseCache[cacheKey] = summary;
    return summary;
  } catch (error) {
    console.error("Summary generation failed:", error);
    throw error;
  }
};

// Helper functions
const parseFlashcards = (text) => {
  return text.split('\n\n').map(card => {
    const [question, answer] = card.split('\n').filter(Boolean);
    return { question, answer };
  });
};

export const askQuestion = async (context, question) => {
  const cacheKey = `qa:${context.substring(0,30)}:${question}`;
  if (responseCache[cacheKey]) return responseCache[cacheKey];

  try {
    const response = await axios.post(API_URL, {
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Answer questions based on this context: ${context}`
      }, {
        role: "user",
        content: question
      }],
      temperature: 0.3,
      max_tokens: 500
    });

    const answer = response.data.choices[0].message.content;
    responseCache[cacheKey] = answer;
    return answer;
  } catch (error) {
    console.error("Q&A failed:", error);
    throw error;
  }
};

export const extractKeyConcepts = async (text) => {
  const cacheKey = `concepts:${text.substring(0,50)}`;
  if (responseCache[cacheKey]) return responseCache[cacheKey];

  try {
    const response = await axios.post(API_URL, {
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Extract 5-7 most important key concepts from this text. Return as JSON array."
      }, {
        role: "user",
        content: text
      }],
      temperature: 0.1,
      max_tokens: 300
    });

    const concepts = JSON.parse(response.data.choices[0].message.content);
    responseCache[cacheKey] = concepts;
    return concepts;
  } catch (error) {
    console.error("Concept extraction failed:", error);
    throw error;
  }
};

export default {
  generateFlashcards,
  generateSummary,
  askQuestion,
  extractKeyConcepts
};
