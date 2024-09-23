import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { IonRippleEffect } from '@ionic/angular/standalone';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
  imports: [ IonRippleEffect ],
  standalone: true
})
export class AudioComponent  implements OnInit {
  private _stream!: MediaStream;
  private _mediaRecorder!: MediaRecorder;
  private _audiochunks: any = [];
  isRecording: boolean = false;
  waitingResponse: boolean = false;
  transcription: string = '';
  error: string = '';
  img: string =''

  constructor(private _httpservice: HttpService) { }

  async ngOnInit() {
    this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  }

  async startRecording() {
    this._mediaRecorder = new MediaRecorder(this._stream);
    if (this._mediaRecorder) {
      this._mediaRecorder.addEventListener('dataavailable', (ev: BlobEvent) => {
        this._audiochunks.push(ev.data);
        console.log('Agregando Chunk de Audio')
      });
      this._mediaRecorder.addEventListener('stop', (ev: Event) => {
        const audioBlob = new Blob(this._audiochunks, { type: 'audio/webm' });
        this._audiochunks = [];
        this.uploadFile(audioBlob);
      })
      this._mediaRecorder.start();
    }
  }

  async toggleRecord(){
    if (!this.isRecording){
      console.log('Grabando')
      this.startRecording();
      this.isRecording = true;
    } else {
      console.log('Parando de grabar')
      this._mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  uploadFile(blob: any){
    this.waitingResponse = true;
    this._httpservice.uploadAudio(blob).subscribe(
      (r: any) => {
       
        this.waitingResponse = false;
        this.transcription = r.transcription;
        this.showImg(r);
      },
      (err: any) => {
        this.error = err;
      }
    );
  }

  showImg(data: any) {
    const imgs = data.images;
    let idx = -1
    const intervalo = setInterval(() => {
      idx++;
      if(idx < imgs.length) {
        this.img = imgs[idx];
      } else {
        clearInterval(intervalo);
        setTimeout(() => { this.img = '' }, 1 * 1000);
      }
    }, 1*1000);
  }

}
