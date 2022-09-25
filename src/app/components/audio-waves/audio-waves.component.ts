import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Logger } from 'src/shared/logging/logger';
import { LoggingService } from 'src/app/services/logging/logging.service';
import { AudioWave, AudioWaveConfig, DefaultConfig } from './audio-wave';

@Component({
  selector: 'audate-audio-waves',
  templateUrl: './audio-waves.component.html',
  styleUrls: ['./audio-waves.component.scss'],
})
export class AudioWavesComponent implements OnInit, AfterViewInit, OnChanges {
  logger: Logger;
  audioWave: AudioWave;

  @Input() config!: AudioWaveConfig;

  @ViewChild('waveCanvas') canvasView: any;
  constructor(loggingService: LoggingService) {
    this.audioWave = new AudioWave();
    this.logger = loggingService.getLogger('audio-waves');
  }

  ngOnInit(): void {
    if (!this.config) {
      this.config = DefaultConfig;
    }
  }

  ngAfterViewInit() {
    // Initialize the waves.
    if (!this.audioWave.init(this.canvasView.nativeElement, this.config)) {
      this.logger.error('Unable to initialize audio waves');
    }
  }

  /** Listen for changes on the config input and update canvas. */
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName == 'config') {
        const chng = changes[propName];
        this.logger.debug(
          'Updating config to curr:',
          chng.currentValue,
          'from prev:',
          chng.previousValue
        );
        this.config = chng.currentValue as AudioWaveConfig;
        if (this.canvasView)
          this.audioWave.init(this.canvasView.nativeElement, this.config);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(unusedEvent: any) {
    this.audioWave.init(this.canvasView.nativeElement, this.config);
  }

  /*
   * Samples here https://www.cssscript.com/tag/wave/,
   * Desired UI - https://in.pinterest.com/pin/527836018814735661/
   * Inspiration - https://codepen.io/justiceo/pens/loved.
   */
}
