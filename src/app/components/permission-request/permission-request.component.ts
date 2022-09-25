import { Component } from '@angular/core';
import { Logger } from 'src/shared/logging/logger';
import { LoggingService } from 'src/app/services/logging/logging.service';

@Component({
  selector: 'audate-permission-request',
  templateUrl: './permission-request.component.html',
  styleUrls: ['./permission-request.component.scss'],
})
export class PermissionRequestComponent {
  notice = '';
  logger: Logger;
  constructor(loggingService: LoggingService) {
    this.logger = loggingService.getLogger('permission-request');
  }

  /*
   * Also request permissions to display popups,
   * This is necessary for opening search from content script.
   */
  requestPermission() {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => {
          track.stop();
          // Wait a second then close the tab.
          setTimeout(() => {
            window.close();
          }, 2000);
        });
        this.notice = 'Permission Granted';
      })
      .catch((err) => {
        /*
         * TODO: Handle errors:
         *
         * Chrome error messages.
         * err: DOMException: Permission denied
         * err: DOMException: Permission dismissed
         * err: DOMException: Permission denied by system // browser doesn't have access
         *
         * Firefox:
         * err: DOMException: The request is not allowed by the user agent or the platform in the current context.
         * err: DOMException: The object can not be found here - (the browser doesn't have mic permission).
         *
         * Safari:
         * err: NotAllowedError: The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
         *
         */
        this.logger.error('Error requesting permission ', err);
        this.notice = 'Permission not granted';
      });
  }
}
