import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { State } from 'src/app/services/recognition/recognition-state';
import { RecognitionService } from 'src/app/services/recognition/recognition.service';

@Component({
  selector: 'audate-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.scss'],
})
export class TranscriptComponent implements OnInit {
  idleMessage = 'Click ⓞ to start speaking';
  idleTimeoutMs = 1000;
  idleTimeout?: any | null = null;
  message?: string = this.idleMessage;

  constructor(
    private speechRecognizer: RecognitionService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.speechRecognizer.getRecognitionState().subscribe((rstate) => {
      clearTimeout(this.idleTimeout);
      switch (rstate.state) {
        case State.START:
          this.message = 'Listening...';
          break;
        case State.TRANSCRIBING:
          if (rstate.transcript?.partialText) {
            this.message = rstate.transcript?.partialText;
          }
          break;
        case State.END:
          // Do nothing.
          break;
        case State.IDLE:
          if (this.message !== this.idleMessage) {
            this.idleTimeout = setTimeout(() => {
              this.message = this.idleMessage;
              this.ref.detectChanges();
            }, this.idleTimeoutMs);
          }
          break;
        case State.NOT_SUPPORTED:
        case State.PERMISSION_NOT_GRANTED:
        case State.NO_AUDIO_INPUT_DEVICE:
        case State.NO_CONNECTION:
        case State.NO_SPEECH_DETECTED:
        case State.ABORTED:
        case State.LANGUAGE_NOT_SUPPORTED:
        case State.SERVICE_NOT_ALLOWED:
          this.message = rstate.errorMessage;
      }
      this.ref.detectChanges();
    });
  }
}
