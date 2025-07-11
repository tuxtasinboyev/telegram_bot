import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GroqService {
  private readonly groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly apiKey = process.env.GROQ_API_KEY;

  async ask(prompt: string): Promise<string> {
    const res = await axios.post(this.groqUrl, {
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return res.data.choices[0]?.message?.content || '😔 Hech narsa topilmadi.';
  }
}
