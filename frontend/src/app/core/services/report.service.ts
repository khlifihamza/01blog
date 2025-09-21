import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/user.model';
import { ReportRequest } from '../../shared/models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private url = 'http://localhost:8080/api/report';

  constructor(private http: HttpClient) {}

  create(reportData: ReportRequest): Observable<ApiResponse> {
    return this.http.post<any>(`${this.url}/create`, reportData);
  }
}
