import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MessageChat {
  emetteur: 'user' | 'ia';
  texte: string;
  sources?: string[];
  date: string;
}

@Component({
  selector: 'app-ai-rag',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Intelligence Artificielle & RAG
          </span>
          <h1 class="text-2xl font-bold text-slate-900">Assistant de Recherche Documentaire</h1>
          <p class="text-sm text-slate-500 mt-1">Interrogez la base documentaire scientifique du laboratoire STN via recherche sémantique.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-medium text-slate-600">Modèle Mistral-7B / RAG actif</span>
        </div>
      </div>

      <!-- Zone de conversation -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
        <div class="flex-1 p-6 overflow-y-auto space-y-4">
          <div *ngFor="let msg of messages()" [class.justify-end]="msg.emetteur === 'user'" class="flex">
            <div [class.bg-[#002B49]]="msg.emetteur === 'user'"
                 [class.text-white]="msg.emetteur === 'user'"
                 [class.bg-slate-100]="msg.emetteur === 'ia'"
                 [class.text-slate-800]="msg.emetteur === 'ia'"
                 class="max-w-2xl rounded-2xl p-4 shadow-sm text-sm">
              <p class="leading-relaxed whitespace-pre-wrap">{{ msg.texte }}</p>
              <div *ngIf="msg.sources && msg.sources.length > 0" class="mt-3 pt-3 border-t border-slate-200/50 text-xs">
                <span class="font-semibold text-purple-600">Documents sources :</span>
                <ul class="list-disc list-inside mt-1 text-slate-500">
                  <li *ngFor="let src of msg.sources">{{ src }}</li>
                </ul>
              </div>
              <span class="block text-[10px] mt-2 opacity-60 text-right">{{ msg.date }}</span>
            </div>
          </div>
        </div>

        <!-- Saisie du message -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <input type="text" [(ngModel)]="questionSaisie" (keyup.enter)="envoyerMessage()"
                 placeholder="Posez votre question sur les thèses, les méthodologies ou les livrables..."
                 class="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002B49]"/>
          <button (click)="envoyerMessage()" class="px-5 py-2.5 bg-[#002B49] hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition cursor-pointer">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  `
})
export class AiRagComponent {
  questionSaisie = '';
  messages = signal<MessageChat[]>([
    {
      emetteur: 'ia',
      texte: 'Bonjour ! Je suis l\'assistant IA du laboratoire STN. Je peux analyser vos livrables, résumer des articles ou vous orienter selon les niveaux TRL. Quelle est votre question ?',
      sources: ['Guide_Methodologique_STN.pdf', 'Referentiel_TRL_2026.pdf'],
      date: '10:00'
    }
  ]);

  envoyerMessage() {
    if (!this.questionSaisie.trim()) return;

    const nouvelleQuestion = this.questionSaisie;
    this.messages.update(m => [...m, {
      emetteur: 'user',
      texte: nouvelleQuestion,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    this.questionSaisie = '';

    // Simulation de réponse RAG instantanée
    setTimeout(() => {
      this.messages.update(m => [...m, {
        emetteur: 'ia',
        texte: `Analyse documentaire pour : "${nouvelleQuestion}"\nLes travaux associés dans le laboratoire portent principalement sur l'axe Réseaux Télécoms et Sécurité IoT. Vous pouvez consulter les livrables récents validés pour plus de détails.`,
        sources: ['These_Diop_5G_Consommation.pdf (Page 14)', 'Livrable_TRL4_Rapport.pdf'],
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  }
}
