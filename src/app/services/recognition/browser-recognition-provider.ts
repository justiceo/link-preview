import { Injectable } from '@angular/core';
import { Observable, share, Subject } from 'rxjs';
import { RecognitionState, State } from './recognition-state';
import { DefaultLocale, LocaleProperties } from '../locale/locale-properties';
import { LocaleService } from '../locale/locale.service';
import { LoggingService } from '../logging/logging.service';
import { Logger } from '../../../shared/logging/logger';
import { RecognitionProvider } from './recognition-provider';

/*
 * This is a strategy for adding the symbol webkitSpeechRecognition to the window object,
 * Since TypeScript cannot find it.
 */
interface IWindow extends Window {
  // tslint:disable-next-line:no-any
  webkitSpeechRecognition: any;
}
// tslint:disable-next-line:no-any
const { webkitSpeechRecognition }: IWindow = window as any as IWindow;
const IdleState: RecognitionState = { state: State.IDLE };

@Injectable({
  providedIn: 'root',
})
export class BrowserRecognitionProvider implements RecognitionProvider {
  recognition!: any;
  locale: LocaleProperties = LocaleService.getDefaultLocale();
  recognitionState: RecognitionState = IdleState;
  recognitionState$: Subject<RecognitionState> = new Subject();
  detectedSpeech: boolean = false;
  logger: Logger;

  constructor(
    private localeService: LocaleService,
    loggingService: LoggingService
  ) {
    this.logger = loggingService.getLogger('RecognitionService');
    localeService.getRecognitionLocale().subscribe({
      next: (locale) => (this.locale = locale ? locale : this.locale),
      error: (error) => this.logger.error(error),
    });
  }

  #initialize(language: LocaleProperties, isContinuous: boolean): State {
    /*
     * When using the chrome recognition API via popup, no special permission is required.
     * See permsisiosn list here - https://developer.chrome.com/docs/extensions/mv3/declare_permissions/
     * When accessing on a webpage, microphone access is a required permission. If this extension is installed, it has it.
     */

    if (!('webkitSpeechRecognition' in window)) {
      return State.NOT_SUPPORTED;
    }

    this.recognition = new webkitSpeechRecognition();
    /*
     * When disabled, recognition would automatically stop after the first continguous audio streams.
     * The final transcript is sent one, after #onAudioEnd.
     */
    this.recognition.continuous = isContinuous; // TODO: Parameterize.
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = this.locale.bcp_47;

    // Wire up life-cycle methods, in the order they are invoked.
    this.recognition.onstart = this.#onStart;
    this.recognition.onaudiostart = this.#onAudioStart;
    this.recognition.onsoundstart = this.#onSoundStart;
    this.recognition.onspeechstart = this.#onSpeechStart;
    this.recognition.onspeechend = this.#onSpeechEnd;
    this.recognition.onsoundend = this.#onSoundEnd;
    this.recognition.onaudioend = this.#onAudioEnd;
    this.recognition.onend = this.#onEnd;

    // Wire up response handlers.
    this.recognition.onresult = this.#onResult;
    this.recognition.onerror = this.#onError;
    return State.IDLE;
  }

  /**
   * Fired when the speech recognition service has begun listening to
   * incoming audio with intent to recognize grammars associated with
   * the current SpeechRecognition.
   */
  #onStart = () => {
    this.logger.log('#onStart');
    this.detectedSpeech = false;
    this.recognitionState = {
      state: State.START,
    };
    this.recognitionState$.next(this.recognitionState);
  };

  /** Fired when the user agent has started to capture audio. */
  #onAudioStart = () => {
    this.logger.log('#onAudioStart');
  };

  /** Fired when any sound — recognizable speech or not — has been detected. */
  #onSoundStart = () => {
    this.logger.log('#onSoundStart');
  };

  /** Fired when sound that is recognized by the speech recognition service as speech has been detected. */
  #onSpeechStart = () => {
    this.logger.log('#onSpeechStart');
  };

  /** Fired when speech recognized by the speech recognition service has stopped being detected. */
  #onSpeechEnd = () => {
    this.logger.log('#onSpeechEnd');
  };

  /** Fired when any sound — recognizable speech or not — has stopped being detected. */
  #onSoundEnd = () => {
    this.logger.log('#onSoundEnd');
  };

  /** Fired when the user agent has finished capturing audio. */
  #onAudioEnd = () => {
    this.logger.log('#onAudioEnd');
    this.recognitionState = {
      state: State.END,
    };
    this.recognitionState$.next(this.recognitionState);

    if (!this.detectedSpeech) {
      this.recognitionState = {
        state: State.NO_SPEECH_DETECTED,
        errorMessage: 'No recognizable sound detected.',
      };
      this.recognitionState$.next(this.recognitionState);
    }
  };

  /**
   * Fired when the speech recognition service has disconnected.
   *
   * This method is guaranteed to be executed, even if #onStart was never called,
   * and even in instances where #onSpeechEnd or #onAudioEnd are not invoked.
   */
  #onEnd = () => {
    this.logger.log('#onEnd');
    this.recognitionState = IdleState;
    this.recognitionState$.next(this.recognitionState);
    this.recognition = null;
  };

  /** Fired when a speech recognition error occurs. */
  #onError = (event: any) => {
    const eventError: string = event.error;
    const errorMessage: string = event.message;
    this.logger.error('#onError', eventError, errorMessage);
    // Not using errorMessage below as it is not very descriptive.
    switch (eventError) {
      case 'no-speech':
        this.recognitionState = {
          state: State.NO_SPEECH_DETECTED,
          errorMessage: 'No speech detected.',
        };
        break;
      case 'audio-capture':
        this.recognitionState = {
          state: State.NO_AUDIO_INPUT_DEVICE,
          errorMessage:
            'No microphone devices detected or microphone is muted.',
        };
        break;
      case 'not-allowed':
        this.recognitionState = {
          state: State.PERMISSION_NOT_GRANTED,
          errorMessage: 'Cannot access microphone.\nRequesting permission...',
        };
        break;
      case 'network':
        this.recognitionState = {
          state: State.NO_CONNECTION,
          errorMessage: 'Network disconnected.',
        };
        break;
      case 'aborted':
        this.recognitionState = {
          state: State.ABORTED,
          errorMessage: 'Recognition cancelled.',
        };
        break;
      case 'language-not-supported':
        const locale = this.recognition.lang;
        this.localeService.setRecognitionLocale(DefaultLocale);
        this.recognitionState = {
          state: State.LANGUAGE_NOT_SUPPORTED,
          errorMessage: `Locale ${locale} not supported, reset to ${DefaultLocale.bcp_47}`,
        };
        break;
      case 'service-not-allowed':
        this.recognitionState = {
          state: State.SERVICE_NOT_ALLOWED,
          errorMessage: 'Browser not allowing speech recognition.',
        };
        break;
      case 'bad-grammar':
      default:
        this.recognitionState = {
          state: State.UNKNOWN,
          errorMessage: 'TODO:Please handle these cases',
        };
        break;
    }
    this.recognitionState$.next(this.recognitionState);
  };

  /**
   * Fired when the speech recognition service returns a
   * result — a word or phrase has been positively recognized
   * and this has been communicated back to the app.
   */
  #onResult = (event: any) => {
    this.logger.log('#onResult', event);
    this.detectedSpeech = true;
    let interimContent = '';
    let finalContent = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalContent += event.results[i][0].transcript;
        this.recognitionState = {
          state: State.TRANSCRIBING,
          transcript: { finalText: finalContent },
        };
        this.recognitionState$.next(this.recognitionState);
      } else {
        interimContent += event.results[i][0].transcript;
        this.recognitionState = {
          state: State.TRANSCRIBING,
          transcript: { partialText: interimContent },
        };
        this.recognitionState$.next(this.recognitionState);
      }
    }
  };

  start(isContinuous: boolean): void {
    this.start2(true);
    if (this.recognition) {
      this.logger.log('stopping recognition');
      this.recognition.abort();

      /*
       * TODO: Wait for recognition object to become null, i.e. onEnd has fired.
       * If this function is invoked twice back-to-back, it would fail.
       */
    }

    const state = this.#initialize(this.locale, isContinuous);
    if (state === State.NOT_SUPPORTED) {
      this.recognitionState = {
        state: state,
        errorMessage: 'Recognition not supported.',
      };
      this.recognitionState$.next(this.recognitionState);
      return;
    }

    this.recognition.start();
  }

  stop(): void {
    if (!this.recognition) {
      this.logger.error("Stopping recognition that isn't initialized");
      return;
    }
    this.stop2();

    // Aborting instead of stopping prevents streaming results after closure.
    this.recognition.abort();
  }

  getRecognitionState(): Observable<RecognitionState> {
    return this.recognitionState$.asObservable().pipe(share());
  }

  mediaRecorder?: MediaRecorder;

  // Start speech recognition.
  start2(unusedIsContinuous: boolean): void {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.logger.log('mediarecorder started');

        this.mediaRecorder.ondataavailable = (e) => {
          this.logger.log('chunks: ', e.data);
        };
        this.mediaRecorder.onerror = (ev: MediaRecorderErrorEvent) => {
          this.logger.error('mediarecorder error: ', ev);
        };
      })
      .catch((err) => {
        this.logger.log('Error requesting media devices ', err);
      });
  }

  // Stop speech recognition.
  stop2(): void {
    this.mediaRecorder?.stop();
    this.logger.log('stopped mediarecorder');
  }
}
