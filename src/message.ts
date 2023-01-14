/** An enum for quickly identify classes of messages. */
export enum MessageType {
    Install = 1
}

/** Object that is passed between popup, content-script and background-page. */
export class Message {
  type: MessageType;

  value: unknown;
}
