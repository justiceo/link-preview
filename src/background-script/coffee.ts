import ExtPay from "./ExtPay";
import { extensionId } from "../utils/i18n";

const extpay = ExtPay(extensionId);
extpay.startBackground();
