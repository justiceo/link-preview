import { Message } from './message';

export interface StorageMessage extends Message {
  type: 'save' | 'read' | 'read_all';
}
