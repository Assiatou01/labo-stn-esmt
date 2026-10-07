import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TheseResponse,
  TheseCreateRequest,
  AxeRecherche,
  DomaineRecherche,
  ProjetRecherche,
  AvancementThese,
  ContributionThese
} from '../models/these.model';

@Injectable({ providedIn: 'root' })
export class TheseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/theses`;
  private readonly axesUrl = `${environment.apiUrl}/axes-recherche`;
  private readonly domainesUrl = `${environment.apiUrl}/domaines-recherche`;
  private readonly projetsUrl = `${environment.apiUrl}/projets-recherche`;

  getAllTheses(params?: {
    statut?: string;
    doctorantId?: number;
    encadreurId?: number;
    axeId?: number;
    page?: number;
    size?: number;
  }): Observable<TheseResponse[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.statut) httpParams = httpParams.set('statut', params.statut);
      if (params.doctorantId) httpParams = httpParams.set('doctorantId', params.doctorantId.toString());
      if (params.encadreurId) httpParams = httpParams.set('encadreurId', params.encadreurId.toString());
      if (params.axeId) httpParams = httpParams.set('axeId', params.axeId.toString());
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    }
    return this.http.get<TheseResponse[]>(this.baseUrl, { params: httpParams });
  }

  getTheses(params?: { statut?: string; doctorantId?: number; encadreurId?: number; axeId?: number }): Observable<TheseResponse[]> {
    return this.getAllTheses(params);
  }

  getTheseById(id: number): Observable<TheseResponse> {
    return this.http.get<TheseResponse>(`${this.baseUrl}/${id}`);
  }

  createThese(req: TheseCreateRequest): Observable<TheseResponse> {
    return this.http.post<TheseResponse>(this.baseUrl, req);
  }

  updateThese(id: number, req: Partial<TheseCreateRequest>): Observable<TheseResponse> {
    return this.http.put<TheseResponse>(`${this.baseUrl}/${id}`, req);
  }

  deleteThese(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getThesesByDoctorant(doctorantId: number): Observable<TheseResponse[]> {
    return this.http.get<TheseResponse[]>(`${this.baseUrl}/doctorant/${doctorantId}`);
  }

  getThesesByEncadreur(encadreurId: number): Observable<TheseResponse[]> {
    return this.http.get<TheseResponse[]>(`${this.baseUrl}/encadreur/${encadreurId}`);
  }

  // --- Axes & Domaines ---

  getAllAxes(): Observable<AxeRecherche[]> {
    return this.http.get<AxeRecherche[]>(this.axesUrl);
  }

  getAxesRecherche(): Observable<AxeRecherche[]> {
    return this.getAllAxes();
  }

  getAxeById(id: number): Observable<AxeRecherche> {
    return this.http.get<AxeRecherche>(`${this.axesUrl}/${id}`);
  }

  createAxe(axe: Partial<AxeRecherche>): Observable<AxeRecherche> {
    return this.http.post<AxeRecherche>(this.axesUrl, axe);
  }

  createAxeRecherche(axe: Partial<AxeRecherche>): Observable<AxeRecherche> {
    return this.createAxe(axe);
  }

  updateAxe(id: number, axe: Partial<AxeRecherche>): Observable<AxeRecherche> {
    return this.http.put<AxeRecherche>(`${this.axesUrl}/${id}`, axe);
  }

  deleteAxe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.axesUrl}/${id}`);
  }

  deleteAxeRecherche(id: number): Observable<void> {
    return this.deleteAxe(id);
  }

  getAllDomaines(axeId?: number): Observable<DomaineRecherche[]> {
    if (axeId) {
      return this.getDomainesByAxe(axeId);
    }
    return this.http.get<DomaineRecherche[]>(this.domainesUrl);
  }

  getDomainesRecherche(axeId?: number): Observable<DomaineRecherche[]> {
    return this.getAllDomaines(axeId);
  }

  getDomainesByAxe(axeId: number): Observable<DomaineRecherche[]> {
    return this.http.get<DomaineRecherche[]>(this.domainesUrl, {
      params: { axeId: axeId.toString() }
    });
  }

  getProjetsRecherche(axeId?: number): Observable<ProjetRecherche[]> {
    let params = new HttpParams();
    if (axeId) params = params.set('axeId', axeId.toString());
    return this.http.get<ProjetRecherche[]>(this.projetsUrl, { params });
  }

  createDomaine(domaine: Partial<DomaineRecherche>): Observable<DomaineRecherche> {
    return this.http.post<DomaineRecherche>(this.domainesUrl, domaine);
  }

  createDomaineRecherche(domaine: Partial<DomaineRecherche>): Observable<DomaineRecherche> {
    return this.createDomaine(domaine);
  }

  updateDomaine(id: number, domaine: Partial<DomaineRecherche>): Observable<DomaineRecherche> {
    return this.http.put<DomaineRecherche>(`${this.domainesUrl}/${id}`, domaine);
  }

  deleteDomaine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.domainesUrl}/${id}`);
  }

  deleteDomaineRecherche(id: number): Observable<void> {
    return this.deleteDomaine(id);
  }

  // --- Projets de Recherche ---

  getAllProjets(): Observable<ProjetRecherche[]> {
    return this.http.get<ProjetRecherche[]>(this.projetsUrl);
  }

  getProjetById(id: number): Observable<ProjetRecherche> {
    return this.http.get<ProjetRecherche>(`${this.projetsUrl}/${id}`);
  }

  createProjet(projet: Partial<ProjetRecherche>): Observable<ProjetRecherche> {
    return this.http.post<ProjetRecherche>(this.projetsUrl, projet);
  }

  updateProjet(id: number, projet: Partial<ProjetRecherche>): Observable<ProjetRecherche> {
    return this.http.put<ProjetRecherche>(`${this.projetsUrl}/${id}`, projet);
  }

  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.projetsUrl}/${id}`);
  }

  // --- Avancement & Contributions ---

  getAvancements(theseId: number): Observable<AvancementThese[]> {
    return this.http.get<AvancementThese[]>(`${this.baseUrl}/${theseId}/avancements`);
  }

  addAvancement(theseId: number, avancement: Partial<AvancementThese>): Observable<AvancementThese> {
    return this.http.post<AvancementThese>(`${this.baseUrl}/${theseId}/avancements`, avancement);
  }

  getContributions(theseId: number): Observable<ContributionThese[]> {
    return this.http.get<ContributionThese[]>(`${this.baseUrl}/${theseId}/contributions`);
  }

  addContribution(theseId: number, contrib: Partial<ContributionThese>): Observable<ContributionThese> {
    return this.http.post<ContributionThese>(`${this.baseUrl}/${theseId}/contributions`, contrib);
  }
}
