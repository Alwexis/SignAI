import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { IonRippleEffect } from '@ionic/angular/standalone';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  standalone: true,
  imports: [ IonRippleEffect ]
})
export class VideoComponent  implements OnInit {
  private _stream! : MediaStream;
  private _mediaRecorder! : MediaRecorder;
  private _videoChunks: any = [];
  isRecording: boolean = false;
  waitingResponse: boolean = false;
  error: string = '';
  @ViewChild('VideoPlayer') private _videoPlayer!: ElementRef<HTMLVideoElement>;


  constructor(private _http: HttpService) { }

  async ngOnInit() {
    await this.createStream();
  }

  async createStream(){
    this._stream = await navigator.mediaDevices.getUserMedia({ video: true });
  }

  async closeStream(){
    this._stream.getTracks().forEach((track) => track.stop());
  }

  async starRecording(){
    this._mediaRecorder = new MediaRecorder(this._stream);
    if (this._mediaRecorder) {
      await this.createStream();
      this._videoPlayer.nativeElement.srcObject = this._stream;
      this._mediaRecorder.addEventListener('dataavailable', (ev: BlobEvent) => {
        this._videoChunks.push(ev.data);
        console.log('Aregando Chunk de Audio')
      });
      this._mediaRecorder.addEventListener('stop', (ev: Event) => {
        const audioBlob = new Blob(this._videoChunks, { type: 'video/webm'});
        this._videoChunks = [];
        this.uploadFile(audioBlob);
        this.closeStream();
      })
      this._mediaRecorder.start();
    }
  }

  async toggleRecord(){
    if (!this.isRecording){
      console.log('grabando')
      this.starRecording();
      this.isRecording = true;
    } else {
      console.log('Parando de grabar')
      this._mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  uploadFile(blob: any){
    this.waitingResponse = true;
    this._http.uploadAudio(blob).subscribe(
      (r: any) => {
        this.waitingResponse = false;
        console.log(r);
      },
      (err: any) => {
        this.error = err;
      }
    );
  }

}
