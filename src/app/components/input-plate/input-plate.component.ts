import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { State } from '../../services/recognition/recognition-state';
import { RecognitionService } from '../../services/recognition/recognition.service';

@Component({
  selector: 'audate-input-plate',
  templateUrl: './input-plate.component.html',
  styleUrls: ['./input-plate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class InputPlateComponent implements OnInit, AfterViewInit {
  listening = false;
  showSettings = false;
  idleTimeoutMs = 1000;

  constructor(
    private router: Router,
    private speechRecognizer: RecognitionService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.speechRecognizer.getRecognitionState().subscribe((rstate) => {
      switch (rstate.state) {
        case State.UNKNOWN:
        case State.NOT_SUPPORTED:
        case State.PERMISSION_NOT_GRANTED:
          this.requestPermissions();
          break;
        case State.LANGUAGE_NOT_SUPPORTED:
        case State.SERVICE_NOT_ALLOWED:
        case State.NO_AUDIO_INPUT_DEVICE:
        case State.NO_CONNECTION:
        case State.NO_SPEECH_DETECTED:
        case State.IDLE:
        case State.ABORTED:
        case State.END:
          this.listening = false;
          break;
        case State.START:
        case State.TRANSCRIBING:
          this.listening = true;
          break;
      }
      this.ref.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    // Trigger mic tap.
    this.micTap();
  }

  requestPermissions() {
    setTimeout(() => {
      const url = chrome.runtime.getURL('index.html#request-permissions');
      chrome.tabs.create({ url: url });
    }, this.idleTimeoutMs);
  }

  micTap(): void {
    if (this.listening) {
      this.speechRecognizer.stop();
    } else {
      this.speechRecognizer.start(false);
    }
  }

  onGearTap() {
    this.showSettings = !this.showSettings;
  }
}
