import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SearchEngineService } from 'src/app/services/search-engine.service';
import { State } from '../../services/recognition/recognition-state';
import { RecognitionService } from '../../services/recognition/recognition.service';
import { applyConfig, DefaultConfig } from '../audio-waves/audio-wave';

@Component({
  selector: 'audate-voice-search',
  templateUrl: './voice-search.component.html',
  styleUrls: ['./voice-search.component.scss'],
})
export class VoiceSearchComponent implements OnInit {
  finalTrascript?: string;
  waveConfig = DefaultConfig;

  constructor(
    private speechRecognizer: RecognitionService,
    private searchEngineService: SearchEngineService,
    private ref: ChangeDetectorRef
  ) {
    this.waveConfig.rotation = 180;
  }

  ngOnInit(): void {
    this.speechRecognizer.getRecognitionState().subscribe((rstate) => {
      switch (rstate.state) {
        case State.START:
          this.finalTrascript = undefined;
          this.waveConfig = applyConfig({ nodeCount: 10, rotation: 180 });
          break;
        case State.TRANSCRIBING:
          if (rstate.transcript?.finalText) {
            this.finalTrascript = rstate.transcript?.finalText;
          }
          if (rstate.transcript?.partialText) {
            if (this.waveConfig.nodeCount != 20) {
              this.waveConfig = applyConfig({ nodeCount: 20, rotation: 180 });
            }
          }
          break;
        case State.END:
          this.waveConfig = applyConfig({ nodeCount: 2, rotation: 180 });
          break;
        case State.IDLE:
          if (this.finalTrascript) {
            this.searchEngineService.performSearch(this.finalTrascript);
            window.close();
          }
          this.finalTrascript = undefined;
          this.waveConfig = applyConfig({ nodeCount: 2, rotation: 180 });
      }
    });
  }
}
