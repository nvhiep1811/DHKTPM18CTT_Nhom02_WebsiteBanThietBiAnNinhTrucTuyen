import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosConfig';

interface ResendVerificationProps {
  email?: string;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({ email: initialEmail }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = React.useRef<HTMLInputElement>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.warn('Vui lòng nhập email');
      emailRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    try {
      await axiosInstance.post('/auth/resend-verification', {
        email: email.trim()
      });
      
      toast.success('Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Chưa nhận được email?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Nhập email của bạn để gửi lại link xác thực
      </p>
      
      <form onSubmit={handleResend} className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="your-email@example.com"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            'Gửi lại email xác thực'
          )}
        </button>
      </form>
    </div>
  );
};

export default ResendVerification;