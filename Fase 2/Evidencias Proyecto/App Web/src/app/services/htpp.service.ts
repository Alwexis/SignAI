import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class HttpService {
  private _url= 'http://207.244.231.246:8000/speech-to-text';

  constructor(private _http: HttpClient) {}

  uploadAudio(file: File): Observable<any>{
    const formData: FormData = new FormData();
    formData.append('file', file, 'audio.webm');

    const headers = new HttpHeaders({})
    return this._http.post<any>(this._url, formData, { headers });
  }


}
