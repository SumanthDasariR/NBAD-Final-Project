import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://sumanthbackend.devhost.my';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getDashboardData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/dashboard`, { headers });
  }

  getSummaryData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/summary`, { headers });
  }

  getReportsData(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/reports`, { headers });
  }

  getAdminContents(pageType: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/admin/contents/${pageType}`, { headers });
  }

  getAdminCharts(pageType: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/admin/charts/${pageType}`, { headers });
  }

  addContent(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/admin/add_content`, data, { headers });
  }

  updateContent(id: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/admin/content/${id}`, data, { headers });
  }

  addChart(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/admin/add_chart`, data, { headers });
  }

  updateChart(id: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/admin/chart/${id}`, data, { headers });
  }

  deleteItem(id: string, type: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/admin/${type}/${id}`, { headers });
  }
}