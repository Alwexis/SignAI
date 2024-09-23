import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSegment, IonLabel, IonSegmentButton } from '@ionic/angular/standalone';
import { AudioComponent } from 'src/app/components/audio/audio.component';
import { VideoComponent } from 'src/app/components/video/video.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSegment, IonLabel, IonSegmentButton, AudioComponent, VideoComponent ]
})
export class HomePage {
  constructor() { }
}
