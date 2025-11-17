// VNPay Payment Request DTO
export interface VNPayPaymentRequest {
  orderId: string;           // UUID
  amount: number;            // VND (sẽ nhân 100 ở backend)
  orderInfo: string;
  orderType?: string;        // Default: "other"
  bankCode?: string;         // Optional: NCB, VNBANK, INTCARD...
  language?: string;         // "vn" or "en"
}

// VNPay Payment Response DTO
export interface VNPayPaymentResponse {
  code: string;              // "00" = success
  message: string;
  paymentUrl: string | null;
}

// VNPay Callback Request (URL params từ VNPay)
export interface VNPayCallbackRequest {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;        // "00" = thành công
  vnp_TransactionStatus: string;   // "00" = thành công
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

// Bank Code constants
export const VNPayBankCode = {
  VNPAYQR: "VNPAYQR",      // Cổng thanh toán VNPAYQR
  VNBANK: "VNBANK",        // Ngân hàng nội địa
  INTCARD: "INTCARD",      // Thẻ quốc tế
  NCB: "NCB",              // Ngân hàng NCB
  VIETCOMBANK: "ICB",      // Vietcombank
  AGRIBANK: "AGRIBANK",    // Agribank
  BIDV: "BIDV",            // BIDV
  VIETINBANK: "CTG",       // Vietinbank
  TECHCOMBANK: "TCB",      // Techcombank
  MBBANK: "MB",            // MB Bank
  SACOMBANK: "SACOMBANK",  // Sacombank
} as const;

// VNPay Response Code mapping
export const VNPAY_RESPONSE_CODES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  "10": "Thẻ/Tài khoản không đủ số dư để thực hiện giao dịch.",
  "11": "Thẻ/Tài khoản đã hết hạn sử dụng.",
  "12": "Thẻ/Tài khoản bị khóa.",
  "13": "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
  "24": "Khách hàng hủy giao dịch",
  "51": "Tài khoản không đủ số dư để thực hiện giao dịch.",
  "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
  "99": "Lỗi không xác định"
};

// Bank options for UI
export interface BankOption {
  code: string;
  name: string;
  logo?: string;
  type: 'qr' | 'atm' | 'international';
}

export const BANK_OPTIONS: BankOption[] = [
  { code: "VNPAYQR", name: "Quét mã VNPayQR", type: "qr" },
  { code: "VNBANK", name: "Thẻ ATM/Internet Banking", type: "atm" },
  { code: "NCB", name: "Ngân hàng NCB", type: "atm" },
  { code: "ICB", name: "Vietcombank", type: "atm" },
  { code: "AGRIBANK", name: "Agribank", type: "atm" },
  { code: "BIDV", name: "BIDV", type: "atm" },
  { code: "CTG", name: "Vietinbank", type: "atm" },
  { code: "TCB", name: "Techcombank", type: "atm" },
  { code: "MB", name: "MB Bank", type: "atm" },
  { code: "SACOMBANK", name: "Sacombank", type: "atm" },
  { code: "INTCARD", name: "Thẻ quốc tế (Visa/Master/JCB)", type: "international" },
];
