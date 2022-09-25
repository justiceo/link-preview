import { Observable, of } from 'rxjs';
import { RecognitionProvider } from './recognition-provider';
import { RecognitionState } from './recognition-state';

export class GoogleRecognitionProvider implements RecognitionProvider {
  // Start speech recognition.
  start(unusedIsContinuous: boolean): void {}

  // Stop speech recognition.
  stop(): void {}

  getRecognitionState(): Observable<RecognitionState> {
    return of();
  }
}
