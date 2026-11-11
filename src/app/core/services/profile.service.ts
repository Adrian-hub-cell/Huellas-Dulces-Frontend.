import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, UserProfileUpdateRequest } from '../../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/v1/profile/me';

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.endpoint);
  }

  updateProfile(data: UserProfileUpdateRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.endpoint, data);
  }

  uploadAvatar(file: Blob): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('file', file, 'avatar.webp');

    return this.http.put<UserProfile>(
      `${this.endpoint}/avatar`,
      formData
    );
  }

  getAvatar(): Observable<Blob> {
    return this.http.get(`${this.endpoint}/avatar`, {
      responseType: 'blob'
    });
  }

  deleteAvatar(): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/avatar`);
  }
}