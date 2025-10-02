import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiscoveryResponse } from '../../shared/models/discovery.model';

@Injectable({
  providedIn: 'root',
})
export class DiscoveryService {
  private url = 'http://localhost:8080/api/discovery';

  constructor(private http: HttpClient) {}

  getDiscoveryData(): Observable<DiscoveryResponse> {
    return this.http.get<any>(`${this.url}/suggest`);
  }

  getSearchedData(query: string): Observable<DiscoveryResponse> {
    return this.http.get<any>(`${this.url}/search?query=${query}`);
  }
}
