import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AiService,
  RagChatResponse,
  SearchResultItem
} from '../../core/services/ai.service';


interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  sources?: any[];
}


@Component({
  selector: 'app-ai-assistant',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './ai-assistant.component.html'
})
export class AiAssistantComponent {

  /* ==========================================================
   * ONGLET
   * ========================================================== */

  activeTab:
    | 'chat'
    | 'search'
    | 'summarize' = 'chat';


  /* ==========================================================
   * CHAT
   * ========================================================== */

  messages: ChatMessage[] = [
    {
      sender: 'bot',

      text:
        'Bonjour ! Je suis l’assistant IA du Laboratoire STN (ESMT). Posez-moi vos questions sur les thèses, les livrables scientifiques, les documents de recherche ou les niveaux TRL.',

      time: 'Maintenant'
    }
  ];

  userPrompt = '';

  isTyping = false;


  /* ==========================================================
   * RECHERCHE SÉMANTIQUE
   * ========================================================== */

  searchQuery = '';

  searchResults: SearchResultItem[] = [];

  isSearching = false;


  /* ==========================================================
   * RÉSUMÉ
   * ========================================================== */

  selectedLivrableId: number | null = null;

  summaryStyle = 'ACADEMIQUE';

  maxWords = 250;

  generatedSummary = '';

  keyPoints: string[] = [];

  methodologyDetected = '';

  estimatedTRL: number | null = null;

  isSummarizing = false;


  /* ==========================================================
   * ERREUR
   * ========================================================== */

  errorMessage = '';


  constructor(
    private aiService: AiService
  ) {}


  /* ==========================================================
   * CHAT RAG
   * ========================================================== */

  sendMessage(): void {

    const question =
      this.userPrompt.trim();

    if (
      !question ||
      this.isTyping
    ) {
      return;
    }

    this.errorMessage = '';

    this.messages.push({
      sender: 'user',
      text: question,
      time: this.getCurrentTime()
    });

    this.userPrompt = '';

    this.isTyping = true;


    this.aiService
      .askChatbot(question)
      .subscribe({

        next:
          (response: RagChatResponse) => {

            this.isTyping = false;

            this.messages.push({

              sender: 'bot',

              text:
                response.answer ||
                'Aucune réponse n’a été retournée par le service IA.',

              sources:
                response.sources || [],

              time:
                this.getCurrentTime()

            });

          },


        error:
          (error) => {

            this.isTyping = false;

            console.error(
              'Erreur AI-SERVICE - Chat RAG :',
              error
            );

            this.errorMessage =
              'Impossible de communiquer avec AI-SERVICE. Vérifiez que le service IA et le Gateway sont démarrés.';

            this.messages.push({

              sender: 'bot',

              text:
                'Une erreur est survenue lors de la communication avec le service IA.',

              time:
                this.getCurrentTime()

            });

          }

      });
  }


  /* ==========================================================
   * QUESTIONS SUGGÉRÉES
   * ========================================================== */

  askSuggested(
    question: string
  ): void {

    this.userPrompt =
      question;

    this.sendMessage();
  }


  /* ==========================================================
   * RECHERCHE SÉMANTIQUE
   * ========================================================== */

  runSearch(): void {

    const query =
      this.searchQuery.trim();

    if (
      !query ||
      this.isSearching
    ) {
      return;
    }

    this.errorMessage = '';

    this.isSearching = true;

    this.searchResults = [];


    this.aiService
      .semanticSearch(
        query,
        5
      )
      .subscribe({

        next:
          (response) => {

            this.isSearching = false;

            this.searchResults =
              response.results || [];

          },


        error:
          (error) => {

            this.isSearching = false;

            console.error(
              'Erreur recherche sémantique :',
              error
            );

            this.errorMessage =
              'Impossible d’effectuer la recherche sémantique.';

          }

      });
  }


  /* ==========================================================
   * RÉSUMÉ IA
   * ========================================================== */

  generateSummary(): void {

    if (
      !this.selectedLivrableId ||
      this.isSummarizing
    ) {
      return;
    }

    this.errorMessage = '';

    this.generatedSummary = '';

    this.keyPoints = [];

    this.methodologyDetected = '';

    this.estimatedTRL = null;

    this.isSummarizing = true;


    this.aiService
      .summarize(
        this.selectedLivrableId,
        this.summaryStyle,
        this.maxWords
      )
      .subscribe({

        next:
          (response) => {

            this.isSummarizing = false;

            this.generatedSummary =
              response.summaryText || '';

            this.keyPoints =
              response.keyPoints || [];

            this.methodologyDetected =
              response.methodologyDetected || '';

            this.estimatedTRL =
              response.estimatedTRL ?? null;

          },


        error:
          (error) => {

            this.isSummarizing = false;

            console.error(
              'Erreur résumé IA :',
              error
            );

            this.errorMessage =
              'Impossible de générer le résumé du livrable.';

          }

      });
  }


  /* ==========================================================
   * AFFICHAGE DES SOURCES
   * ========================================================== */

  getSourceTitle(
    source: any
  ): string {

    return (
      source.titreDocument ||
      'Document source'
    );
  }


  /* ==========================================================
   * HEURE
   * ========================================================== */

  private getCurrentTime(): string {

    return new Date()
      .toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );
  }
}
