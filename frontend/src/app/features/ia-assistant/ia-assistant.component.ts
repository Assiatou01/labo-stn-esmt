import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService } from '../../core/services/ia.service';
import { ChatMessage, SearchResultItem } from '../../core/models/ia.model';
import { LivrableService } from '../../core/services/livrable.service';
import { LivrableResponse } from '../../core/models/livrable.model';

@Component({
  selector: 'app-ia-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-[#0f1b56] via-[#1a2d8a] to-[#2563eb] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-blue-950 flex items-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>Pipeline RAG • Embeddings + Cosinus Java</span>
            </span>
          </div>
          <h1 class="text-2xl font-extrabold tracking-tight mt-2">
            Assistant Documentaire Intelligent STN
          </h1>
          <p class="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
            Interrogation conversationnelle en langage naturel, recherche sémantique ciblée et génération automatique de synthèses sur les thèses et livrables du laboratoire.
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 bg-blue-950/50 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            (click)="activeTab = 'chat'"
            [class.bg-white]="activeTab === 'chat'"
            [class.text-blue-950]="activeTab === 'chat'"
            [class.font-bold]="activeTab === 'chat'"
            [class.text-blue-100]="activeTab !== 'chat'"
            class="px-3.5 py-2 rounded-lg text-xs transition">
            Chatbot RAG
          </button>
          <button
            (click)="activeTab = 'search'"
            [class.bg-white]="activeTab === 'search'"
            [class.text-blue-950]="activeTab === 'search'"
            [class.font-bold]="activeTab === 'search'"
            [class.text-blue-100]="activeTab !== 'search'"
            class="px-3.5 py-2 rounded-lg text-xs transition">
            Recherche Sémantique
          </button>
          <button
            (click)="activeTab = 'summary'"
            [class.bg-white]="activeTab === 'summary'"
            [class.text-blue-950]="activeTab === 'summary'"
            [class.font-bold]="activeTab === 'summary'"
            [class.text-blue-100]="activeTab !== 'summary'"
            class="px-3.5 py-2 rounded-lg text-xs transition">
            Synthèse Automatique
          </button>
        </div>
      </div>

      <!-- TAB 1: CONVERSATIONAL RAG CHAT -->
      @if (activeTab === 'chat') {
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">

          <!-- Suggested Quick Prompts -->
          <div class="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span class="text-slate-400 font-semibold flex-shrink-0 text-[11px]">Suggestions :</span>
            <button (click)="askPreset(1)" class="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 hover:border-blue-900 transition flex-shrink-0">
              TRL du projet Assiatou BAH ?
            </button>
            <button (click)="askPreset(2)" class="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 hover:border-blue-900 transition flex-shrink-0">
              Architecture & Sécurité du laboratoire STN ?
            </button>
            <button (click)="askPreset(3)" class="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 hover:border-blue-900 transition flex-shrink-0">
              Circuit de validation des livrables ?
            </button>
          </div>

          <!-- Chat Messages Area -->
          <div class="flex-1 p-6 overflow-y-auto space-y-4">
            @for (msg of messages; track msg.id) {
              <div class="flex gap-3" [class.justify-end]="msg.expediteur === 'user'">

                @if (msg.expediteur === 'ia') {
                  <div class="w-8 h-8 rounded-full bg-blue-900 text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                    IA
                  </div>
                }

                <div class="max-w-2xl rounded-2xl p-4 text-xs leading-relaxed"
                  [class.bg-[#0f1b56]]="msg.expediteur === 'user'"
                  [class.text-white]="msg.expediteur === 'user'"
                  [class.bg-slate-100]="msg.expediteur === 'ia'"
                  [class.text-slate-800]="msg.expediteur === 'ia'">

                  @if (msg.expediteur === 'ia') {
                    <div class="whitespace-pre-line" [innerHTML]="formatAssistantMessage(msg.texte)"></div>
                  } @else {
                    <p class="whitespace-pre-line">{{ msg.texte }}</p>
                  }

                  <!-- Citations & Sources box -->
                  @if (msg.sources && msg.sources.length > 0) {
                    <div class="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sources documentaires certifiées :</span>
                      @for (src of msg.sources; track src.documentId + '-' + $index) {
                        <div class="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700">
                          <div class="flex items-center justify-between font-bold text-blue-900">
                            <span>📄 {{ src.documentTitre }}</span>
                            <span class="text-emerald-700 font-mono text-[10px]">Pertinence: {{ (src.scorePertinence * 100) | number:'1.0-0' }}%</span>
                          </div>
                          <p class="mt-1 text-slate-500">Auteur : {{ src.auteur || 'Auteur non renseigné' }} · Thèse : {{ src.theseId ?? '—' }}</p>
                          <p class="mt-1 text-slate-600 italic">"{{ src.extrait }}"</p>
                        </div>
                      }
                    </div>
                  }

                  <span class="block mt-2 text-[10px] text-right" [class.text-blue-200]="msg.expediteur === 'user'" [class.text-slate-400]="msg.expediteur === 'ia'">
                    {{ msg.date | date:'HH:mm' }}
                  </span>
                </div>

                @if (msg.expediteur === 'user') {
                  <div class="w-8 h-8 rounded-full bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                    VOUS
                  </div>
                }
              </div>
            }

            @if (isTyping) {
              <div class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-900 text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  IA
                </div>
                <div class="p-3 bg-slate-100 rounded-2xl flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-blue-900 animate-bounce"></span>
                  <span class="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:0.2s]"></span>
                  <span class="w-2 h-2 rounded-full bg-blue-900 animate-bounce [animation-delay:0.4s]"></span>
                  <span class="text-xs text-slate-500 ml-2">Recherche vectorielle dans les thèses...</span>
                </div>
              </div>
            }
          </div>

          <!-- Input form -->
          <div class="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
            <input
              type="text"
              [(ngModel)]="chatInput"
              (keyup.enter)="sendMessage()"
              placeholder="Posez une question scientifique sur les thèses du laboratoire STN..."
              class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-900" />

            <button
              (click)="sendMessage()"
              [disabled]="!chatInput.trim() || isTyping"
              class="px-5 py-3 bg-[#0f1b56] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2">
              <span>Envoyer</span>
              <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>

        </div>
      }

      <!-- TAB 2: SEMANTIC SEARCH -->
      @if (activeTab === 'search') {
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div class="max-w-2xl mx-auto text-center space-y-3">
            <h2 class="text-xl font-bold text-[#0f1b56]">Moteur de Recherche Sémantique</h2>
            <p class="text-xs text-slate-500">Recherchez par sens et concepts scientifiques plutôt que par simples mots-clés exacts</p>

            <div class="flex items-center gap-2">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="executeSemanticSearch()"
                placeholder="Ex: allocation dynamique des fréquences radio 5G, résilience microservices..."
                class="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />

              <button
                (click)="executeSemanticSearch()"
                class="px-5 py-3 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800">
                Rechercher
              </button>
            </div>
          </div>

          <!-- Results -->
          @if (searchResults.length > 0) {
            <div class="space-y-4 max-w-3xl mx-auto pt-4 border-t border-slate-100">
              <span class="text-xs font-semibold text-slate-500">Résultats trouvés ({{ searchResults.length }}) :</span>
              @for (item of searchResults; track item.livrableId + '-' + $index) {
                <div class="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 transition text-xs">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-blue-950 text-sm">{{ item.titre }}</span>
                    <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      Score: {{ (item.score * 100) | number:'1.0-0' }}%
                    </span>
                  </div>
                  <p class="text-slate-600 mt-2 italic bg-white p-3 rounded-lg border border-slate-200/80">
                    {{ item.extrait }}
                  </p>
                  <div class="mt-2 text-[11px] text-slate-400">
                    Type de livrable : <strong class="text-slate-600">{{ item.typeLivrable }}</strong>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB 3: AUTOMATIC SUMMARY -->
      @if (activeTab === 'summary') {
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div class="max-w-2xl mx-auto space-y-4">
            <div>
              <h2 class="text-lg font-bold text-[#0f1b56]">Génération de Synthèse Documentaire IA</h2>
              <p class="text-xs text-slate-500">Sélectionnez un livrable pour générer un condensé analytique, ses points clés et concepts dominants</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Choisir le document :</label>
              <select [(ngModel)]="selectedLivrableIdForSummary" [disabled]="livrables.length === 0" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900">
                @if (livrables.length === 0) {
                  <option [ngValue]="null">Aucun livrable disponible</option>
                }
                @for (liv of livrables; track liv.id) {
                  <option [ngValue]="liv.id">{{ liv.titre }} ({{ liv.nomOriginal }})</option>
                }
              </select>
            </div>

            <button
              (click)="generateSummary()"
              [disabled]="isGeneratingSummary || selectedLivrableIdForSummary === null || livrables.length === 0"
              class="w-full py-3 bg-[#0f1b56] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50">
              {{ isGeneratingSummary ? 'Génération du résumé en cours...' : 'Générer la Synthèse IA' }}
            </button>
          </div>

          @if (summaryResult) {
            <div class="max-w-2xl mx-auto p-5 bg-blue-50/50 rounded-2xl border border-blue-200 text-xs space-y-3">
              <h3 class="font-bold text-blue-950 text-sm">Résumé Analytique Généré :</h3>
              <p class="text-slate-700 leading-relaxed">{{ summaryResult.resume }}</p>

              <div>
                <h4 class="font-bold text-blue-900 mb-1">Points Clés :</h4>
                <ul class="list-disc list-inside space-y-1 text-slate-700">
                  @for (pt of summaryResult.pointsCles; track pt) {
                    <li>{{ pt }}</li>
                  }
                </ul>
              </div>

              <div class="pt-2">
                <span class="font-bold text-blue-900 block mb-1">Mots-clés sémantiques :</span>
                <div class="flex flex-wrap gap-1.5">
                  @for (kw of summaryResult.motsCles; track kw) {
                    <span class="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-semibold text-[10px]">{{ kw }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class IaAssistantComponent implements OnInit {
  private iaService = inject(IaService);
  private livrableService = inject(LivrableService);

  activeTab: 'chat' | 'search' | 'summary' = 'chat';
  chatInput = '';
  isTyping = false;

  messages: ChatMessage[] = [
    {
      id: '1',
      expediteur: 'ia',
      texte: 'Bonjour ! Je suis l\'assistant documentaire intelligent du Laboratoire STN (ESMT). Je suis connecté au corpus des thèses et livrables via l\'architecture RAG (Spring AI & PGVector). Comment puis-je vous aider aujourd\'hui ?',
      date: new Date()
    }
  ];

  searchQuery = '';
  searchResults: SearchResultItem[] = [];

  livrables: LivrableResponse[] = [];
  selectedLivrableIdForSummary: number | null = null;
  summaryResult: any = null;
  isGeneratingSummary = false;

  ngOnInit(): void {
    this.livrableService.getLivrables().subscribe({
      next: data => {
        this.livrables = data || [];
        if (!this.livrables.some(livrable => livrable.id === this.selectedLivrableIdForSummary)) {
          this.selectedLivrableIdForSummary = this.livrables[0]?.id ?? null;
        }
      },
      error: error => {
        console.error('Impossible de charger les livrables pour la synthèse IA:', error);
        this.livrables = [];
        this.selectedLivrableIdForSummary = null;
      }
    });
  }

  askPreset(id: number): void {
    if (id === 1) {
      this.askPrompt("Quel est le niveau TRL du projet de thèse de Mme Assiatou BAH ?");
    } else if (id === 2) {
      this.askPrompt("Décris l'architecture microservices et la sécurité de la plateforme STN de l'ESMT.");
    } else if (id === 3) {
      this.askPrompt("Comment fonctionne le circuit de validation des livrables scientifiques ?");
    }
  }

  askPrompt(p: string): void {
    this.chatInput = p;
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.chatInput.trim() || this.isTyping) return;

    const question = this.chatInput;
    this.chatInput = '';

    this.messages.push({
      id: Date.now().toString(),
      expediteur: 'user',
      texte: question,
      date: new Date()
    });

    this.isTyping = true;

    this.iaService.chatRag({ question }).subscribe(res => {
      this.isTyping = false;
      this.messages.push({
        id: (Date.now() + 1).toString(),
        expediteur: 'ia',
        texte: res.answer,
        sources: res.sources,
        date: new Date()
      });
    });
  }

  executeSemanticSearch(): void {
    if (!this.searchQuery.trim()) return;
    this.iaService.searchSemantic({ query: this.searchQuery }).subscribe(res => {
      this.searchResults = res.results;
    });
  }

  generateSummary(): void {
    if (this.selectedLivrableIdForSummary === null) return;
    this.isGeneratingSummary = true;
    this.summaryResult = null;
    const livrableId = this.selectedLivrableIdForSummary;
    this.requestSummary(livrableId, true);
  }

  private requestSummary(livrableId: number, mayIndex: boolean): void {
    this.iaService.generateSummary({ livrableId }).subscribe({
      next: res => {
        this.isGeneratingSummary = false;
        this.summaryResult = res;
      },
      error: error => {
        console.error('Erreur de génération de la synthèse IA:', error);
        const detail = error?.error?.message || '';
        if (mayIndex && error?.status === 404 && detail.includes('Aucun contenu indexé')) {
          this.livrableService.indexerPourIA(livrableId).subscribe({
            next: () => this.requestSummary(livrableId, false),
            error: indexError => {
              this.isGeneratingSummary = false;
              console.error('Erreur d’indexation avant synthèse:', indexError);
              alert(indexError?.error?.message || 'L’indexation du livrable a échoué. Vérifiez vos droits et le service IA.');
            }
          });
          return;
        }
        this.isGeneratingSummary = false;
        alert(detail || 'Impossible de générer la synthèse.');
      }
    });
  }

  formatAssistantMessage(message: string): string {
    const entities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    const escaped = (message || '')
      .replace(/\\([*_])/g, '$1')
      .replace(/[&<>"']/g, character => entities[character]);
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/^\s*[•*-]\s+/gm, '• ')
      .replace(/\n/g, '<br>');
  }
}
