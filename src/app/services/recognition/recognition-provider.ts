import { Observable } from 'rxjs';
import { RecognitionState } from './recognition-state';

export interface RecognitionProvider {
  // Start speech recognition.
  start(isContinuous: boolean): void;

  // Stop speech recognition.
  stop(): void;

  getRecognitionState(): Observable<RecognitionState>;
}
