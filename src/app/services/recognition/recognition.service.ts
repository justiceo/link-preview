import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecognitionState } from './recognition-state';
import { RecognitionProvider } from './recognition-provider';
import { BrowserRecognitionProvider } from './browser-recognition-provider';

@Injectable({
  providedIn: 'root',
})
export class RecognitionService implements RecognitionProvider {
  recognitionProvider: RecognitionProvider;

  constructor(browserProvider: BrowserRecognitionProvider) {
    this.recognitionProvider = browserProvider;
    /*
     * To use Google, uncomment below
     * this.recognitionProvider = new GoogleRecognitionProvider();
     */
  }

  start(isContinuous: boolean): void {
    this.recognitionProvider.start(isContinuous);
  }

  stop(): void {
    this.recognitionProvider.stop();
  }

  getRecognitionState(): Observable<RecognitionState> {
    return this.recognitionProvider.getRecognitionState();
  }
}
