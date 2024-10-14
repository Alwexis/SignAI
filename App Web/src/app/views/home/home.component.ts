import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { HttpService } from '../../services/htpp.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  @ViewChild('audioCanvas', { static: false }) audioCanvas!: ElementRef<HTMLCanvasElement>;

  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private microphone!: MediaStreamAudioSourceNode;
  private dataArray!: Uint8Array;
  private animationId!: number;
  private _stream!: MediaStream;
  private _mediaRecorder!: MediaRecorder;
  private _audiochunks: any = [];

  isRecording: boolean = false;
  streamStatus: string = 'Iniciar Grabación';
  waitingResponse: boolean = false;
  transcription: string = '';
  error: string = '';
  img: string = '';

  constructor(private _httpservice: HttpService) {}

  async ngOnInit() {
    this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
      this.streamStatus = 'Iniciar Grabación';
    } else {
      this.startRecording();
      this.streamStatus = 'Detener Grabación';
    }
  }

  startRecording() {
    this._mediaRecorder = new MediaRecorder(this._stream);
    this.audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.microphone.connect(this.analyser);

        this.analyser.fftSize = 2048;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.isRecording = true;
        this._mediaRecorder.addEventListener('dataavailable', (ev: BlobEvent) => {
          this._audiochunks.push(ev.data);
          console.log('Agregando Chunk de Audio');
        });
        this._mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(this._audiochunks, { type: 'audio/webm' });
          this._audiochunks = [];
          this.uploadFile(audioBlob);
        });
        this._mediaRecorder.start();
        this.drawVisualizer();
      })
      .catch(err => console.error('Error accediendo al micrófono: ', err));
  }

  drawVisualizer() {
    const canvas = this.audioCanvas.nativeElement;
    const canvasCtx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 150;

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);
      this.analyser.getByteTimeDomainData(this.dataArray);

      canvasCtx!.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx!.lineWidth = 2;
      canvasCtx!.strokeStyle = 'black';
      canvasCtx!.beginPath();

      const sliceWidth = canvas.width * 1.0 / this.dataArray.length;
      let x = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
        const v = this.dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx!.moveTo(x, y);
        } else {
          canvasCtx!.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx!.lineTo(canvas.width, canvas.height / 2);
      canvasCtx!.stroke();
    };

    draw();
  }

  stopRecording() {
    cancelAnimationFrame(this.animationId);

    const canvas = this.audioCanvas.nativeElement;
    const canvasCtx = canvas.getContext('2d');
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'black';
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, canvas.height / 2);
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }
    this.isRecording = false;
    this.audioContext.close();
    this._mediaRecorder.stop();
  }

  uploadFile(blob: any) {
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
    let idx = -1;
    const intervalo = setInterval(() => {
      idx++;
      if (idx < imgs.length) {
        this.img = imgs[idx];
      } else {
        clearInterval(intervalo);
        setTimeout(() => { this.img = ''; }, 1 * 1000);
      }
    }, 1 * 1000);
  }
}
