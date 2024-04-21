import ExtPay from "./ExtPay";
import { extensionId } from "./i18n";

export class Coffee {
  run() {
    const extpay = ExtPay(extensionId);
    extpay.startBackground();
  }
}