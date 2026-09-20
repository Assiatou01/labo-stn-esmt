import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';
import { AuthService } from '../../core/services/auth.service';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  sources?: string[];
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html'
})
export class AiAssistantComponent {
  activeTab: 'chat' | 'search' | 'summarize' = 'chat';

  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Bonjour ! Je suis l\'assistant IA du Laboratoire STN (ESMT). Posez-moi des questions sur les thèses en cours, les livrables scientifiques ou les niveaux TRL.',
      time: 'Maintenant'
    }
  ];
  userPrompt: string = '';
  isTyping: boolean = false;

  searchQuery: string = '';
  searchResults: any[] = [];

  textToSummarize: string = '';
  generatedSummary: string = '';

  constructor(
    private aiService: AiService,
    public authService: AuthService
  ) {}

  sendMessage(): void {
    if (!this.userPrompt.trim()) return;

    const q = this.userPrompt;
    this.messages.push({ sender: 'user', text: q, time: new Date().toLocaleTimeString() });
    this.userPrompt = '';
    this.isTyping = true;

    this.aiService.askChatbot(q).subscribe(res => {
      this.isTyping = false;
      this.messages.push({
        sender: 'bot',
        text: res.reply,
        sources: res.sources,
        time: new Date().toLocaleTimeString()
      });
    });
  }

  askSuggested(q: string): void {
    this.userPrompt = q;
    this.sendMessage();
  }

  runSearch(): void {
    if (!this.searchQuery.trim()) return;
    this.aiService.semanticSearch(this.searchQuery).subscribe(res => {
      this.searchResults = res.results || [];
    });
  }

  generateSummary(): void {
    if (!this.textToSummarize.trim()) return;
    this.aiService.summarize(this.textToSummarize).subscribe(res => {
      this.generatedSummary = res.summary;
    });
  }
}
