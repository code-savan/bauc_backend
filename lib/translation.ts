import axios from 'axios';

const LIBRETRANSLATE_URL = 'https://libretranslate.com';

export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await axios.post(`${LIBRETRANSLATE_URL}/detect`, {
      q: text,
    });
    return response.data[0]?.language || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const response = await axios.post(`${LIBRETRANSLATE_URL}/translate`, {
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text',
      alternatives: 3,
      api_key: '',
    }, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}
