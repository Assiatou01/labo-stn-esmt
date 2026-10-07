import { Injectable, signal, computed } from '@angular/core';

export interface AppNotification {
  id: string;
  titre: string;
  message: string;
  date: string;
  lue: boolean;
  type: 'info' | 'success' | 'warning' | 'these' | 'livrable' | 'trl' | 'financement';
  lien?: string;
  cibleRole?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'stn_notifications_v1';

  private notificationsSignal = signal<AppNotification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  readonly unreadCount = computed(() => {
    return this.notificationsSignal().filter(n => !n.lue).length;
  });

  constructor() {
    this.chargerNotifications();
  }

  private chargerNotifications(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.notificationsSignal.set(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Erreur lecture notifications:', e);
      }
    }

    // Notifications initiales réelles basées sur les activités du laboratoire STN
    const initialNotifications: AppNotification[] = [
      {
        id: 'notif-1',
        titre: 'Nouveau Financement Disponible',
        message: 'L\'appel à projet Sonatel 5G & IoT (25M FCFA) est ouvert aux candidatures.',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        lue: false,
        type: 'financement',
        lien: '/financements'
      },
      {
        id: 'notif-2',
        titre: 'Comité de Thèse & Évaluation TRL',
        message: 'La campagne semestrielle d\'évaluation de maturité technologique TRL est lancée.',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        lue: false,
        type: 'trl',
        lien: '/trl-evaluation'
      },
      {
        id: 'notif-3',
        titre: 'Dépôt des Livrables Semestriels',
        message: 'N\'oubliez pas de déposer vos rapports d\'avancement pour la revue scientifique.',
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        lue: true,
        type: 'livrable',
        lien: '/livrables'
      }
    ];

    this.notificationsSignal.set(initialNotifications);
    this.sauvegarder();
  }

  private sauvegarder(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notificationsSignal()));
  }

  ajouterNotification(titre: string, message: string, type: AppNotification['type'], lien?: string, cibleRole?: string): void {
    const notif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      titre,
      message,
      date: new Date().toISOString(),
      lue: false,
      type,
      lien,
      cibleRole
    };

    this.notificationsSignal.update(list => [notif, ...list]);
    this.sauvegarder();
  }

  marquerCommeLue(id: string): void {
    this.notificationsSignal.update(list =>
      list.map(n => n.id === id ? { ...n, lue: true } : n)
    );
    this.sauvegarder();
  }

  toutMarquerCommeLu(): void {
    this.notificationsSignal.update(list =>
      list.map(n => ({ ...n, lue: true }))
    );
    this.sauvegarder();
  }

  supprimerNotification(id: string): void {
    this.notificationsSignal.update(list => list.filter(n => n.id !== id));
    this.sauvegarder();
  }

  effacerTout(): void {
    this.notificationsSignal.set([]);
    this.sauvegarder();
  }
}
