import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Record, RecordStats, RecordStatus, RecordCategory } from '../models/record.model';

export interface RecordFilters {
  status?: RecordStatus;
  category?: RecordCategory;
  search?: string;
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private apiUrl = `${environment.apiUrl}/records`;

  constructor(private http: HttpClient) {}

  getRecords(filters: RecordFilters = {}): Observable<Record[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.delay !== undefined)
      params = params.set('delay', filters.delay.toString());

    return this.http
      .get<{ success: boolean; count: number; records: Record[] }>(this.apiUrl, {
        params,
      })
      .pipe(map((res) => res.records));
  }

  getRecordById(id: string): Observable<Record> {
    return this.http
      .get<{ success: boolean; record: Record }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.record));
  }

  getRecordStats(): Observable<RecordStats> {
    return this.http
      .get<{ success: boolean; stats: RecordStats }>(`${this.apiUrl}/stats`)
      .pipe(map((res) => res.stats));
  }

  createRecord(record: Partial<Record>): Observable<Record> {
    return this.http
      .post<{ success: boolean; record: Record }>(this.apiUrl, record)
      .pipe(map((res) => res.record));
  }

  updateRecord(id: string, record: Partial<Record>): Observable<Record> {
    return this.http
      .put<{ success: boolean; record: Record }>(`${this.apiUrl}/${id}`, record)
      .pipe(map((res) => res.record));
  }

  deleteRecord(id: string): Observable<boolean> {
    return this.http
      .delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.success));
  }
}

