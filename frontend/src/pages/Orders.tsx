import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../utils/api";

interface OrderItemSummary {
  productName?: string;
  quantity?: number;
}

interface OrderSummary {
  id: string;
  createdAt?: string;
  status?: string;
  paymentStatus?: string;
  grandTotal?: number;
  subTotal?: number;
  shippingFee?: number;
  discountTotal?: number;
  orderItems?: OrderItemSummary[];
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await orderApi.getOrders();
        if (!mounted) return;
        setOrders(data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <HeaderBar />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/60 backdrop-blur-sm border border-indigo-100/40 rounded shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <HeaderBar />
        <div className="p-4 bg-red-50/90 border border-red-200 text-red-700 rounded flex items-start gap-3">
          <ErrorIcon />
          <div className="flex-1">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.97] transition"
          >Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <HeaderBar />
      {orders.length === 0 ? (
        <div className="p-6 bg-white border border-dashed border-indigo-300/40 rounded text-gray-600 flex flex-col items-center gap-2">
          <EmptyIcon />
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-[.97] transition" to="/products">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="overflow-hidden border border-indigo-100 rounded-lg shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full align-middle">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 text-left text-[13px] text-indigo-700/90">
                  <th className="px-4 py-3 font-medium">MÃ</th>
                  <th className="px-4 py-3 font-medium">NGÀY TẠO</th>
                  <th className="px-4 py-3 font-medium">TRẠNG THÁI</th>
                  <th className="px-4 py-3 font-medium">THANH TOÁN</th>
                  <th className="px-4 py-3 font-medium text-right">TỔNG</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-indigo-50/70 hover:bg-indigo-50/40 transition">
                    <td className="px-4 py-3 font-semibold text-indigo-700">#{shortId(o.id)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
                    <td className="px-4 py-3"><PaymentBadge value={o.paymentStatus} /></td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(o.grandTotal)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/orders/${o.id}`)}
                        className="group px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.96] transition inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Xem</span>
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function shortId(id?: string) {
  if (!id) return "";
  return id.substring(0, 8);
}

function formatDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleString("vi-VN");
}

function formatCurrency(n?: number) {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);
  } catch {
    return `${n ?? 0}`;
  }
}

// (legacy) badgeForPayment kept for reference; replaced by PaymentBadge component

function HeaderBar() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Đơn hàng của tôi</h1>
      <Link
        to="/products"
        className="group inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
      >
        <svg className="w-4 h-4 -translate-x-0.5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Tiếp tục mua sắm</span>
      </Link>
    </div>
  );
}

function StatusBadge({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
      {value}
    </span>
  );
}

function PaymentBadge({ value }: { value?: string }) {
  if (!value) return null;
  let base = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ";
  let iconPath = "M5 13l4 4L19 7"; // check
  if (value === "PAID") base += "bg-green-50 text-green-700";
  else if (value === "FAILED") { base += "bg-red-50 text-red-700"; iconPath = "M6 18L18 6M6 6l12 12"; }
  else { base += "bg-yellow-50 text-yellow-700"; iconPath = "M12 8v4l2 2"; }
  return (
    <span className={base}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
      {value}
    </span>
  );
}

function EmptyIcon() {
  return (
    <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4v10l9 4 9-4V7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M2 12l10-9 10 9-10 9-10-9z" />
    </svg>
  );
}
