import axiosInstance from './axiosConfig';
import type { 
  VNPayPaymentRequest, 
  VNPayPaymentResponse
} from '../types/vnpay';
import { VNPAY_RESPONSE_CODES } from '../types/vnpay';

export const vnpayApi = {
  /**
   * Tạo VNPay payment URL
   */
  createPaymentUrl: async (request: VNPayPaymentRequest): Promise<VNPayPaymentResponse> => {
    const response = await axiosInstance.post<VNPayPaymentResponse>(
      '/vnpay/create-payment',
      request
    );
    return response.data;
  },

  /**
   * Xử lý callback từ VNPay (forward params đến backend)
   */
  processCallback: async (params: Record<string, string>): Promise<any> => {
    console.log('🔵 Sending to backend - params:', params);
    console.log('🔵 Request URL:', '/vnpay/payment-callback');
    console.log('🔵 Query params will be:', new URLSearchParams(params).toString());
    
    const response = await axiosInstance.get(
      '/vnpay/payment-callback',
      { params }
    );
    
    console.log('✅ Backend response:', response.data);
    return response.data;
  },
};

/**
 * Get user-friendly message from response code
 */
export const getVNPayResponseMessage = (code: string): string => {
  return VNPAY_RESPONSE_CODES[code] || "Lỗi không xác định";
};

/**
 * Check if payment is successful
 */
export const isPaymentSuccess = (responseCode: string): boolean => {
  return responseCode === "00";
};

/**
 * Parse amount from VNPay (chia 100 để chuyển về VND)
 */
export const parseVNPayAmount = (amount: string): number => {
  return parseInt(amount) / 100;
};

/**
 * Format VNPay date (yyyyMMddHHmmss) to readable format
 */
export const formatVNPayDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 14) return '';
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10);
  const minute = dateStr.substring(10, 12);
  const second = dateStr.substring(12, 14);
  
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};
