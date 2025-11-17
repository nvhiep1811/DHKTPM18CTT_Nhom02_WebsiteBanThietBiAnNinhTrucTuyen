import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "../utils/api";

interface OrderItem {
  product?: { id?: string; name?: string; sku?: string; thumbnailUrl?: string };
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

interface OrderDetails {
  id: string;
  createdAt?: string;
  status?: string;
  paymentStatus?: string;
  subTotal?: number;
  grandTotal?: number;
  discountTotal?: number;
  shippingFee?: number;
  shippingAddress?: Record<string, string> | string;
  orderItems?: OrderItem[];
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const data = await orderApi.getById(id);
        if (!mounted) return;
        setOrder(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không thể tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <BackLink />
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white/60 backdrop-blur-sm border border-indigo-100/40 rounded shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <BackLink />
        <div className="p-4 bg-red-50/90 border border-red-200 text-red-700 rounded flex items-start gap-3">
          <ErrorIcon />
          <div className="flex-1">{error || "Không tìm thấy đơn hàng"}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.97] transition"
          >Thử lại</button>
        </div>
      </div>
    );
  }

  const addressText = formatAddress(order.shippingAddress);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-5">
      <BackLink />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Đơn hàng #{shortId(order.id)}</h1>
          <p className="text-gray-600 text-sm">Tạo lúc {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex flex-wrap justify-end gap-2">
            <StatusBadge value={order.status} />
            <PaymentBadge value={order.paymentStatus} />
          </div>
          <div className="text-xl font-bold text-gray-800">{formatCurrency(order.grandTotal)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-4">
          <div className="border border-indigo-100 rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-indigo-50/60 text-indigo-700 font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v4H3zM3 9h18v12H3z" /></svg>
              Sản phẩm
            </div>
            <div className="divide-y">
              {(order.orderItems || []).map((it, idx) => (
                <div key={idx} className="p-4 flex items-start gap-4 hover:bg-indigo-50/40 transition">
                  <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded overflow-hidden flex items-center justify-center">
                    {it.product?.thumbnailUrl ? (
                      <img src={it.product.thumbnailUrl} alt={it.product.name || "SP"} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4v10l9 4 9-4V7" /></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{it.product?.name}</div>
                    {it.product?.sku && <div className="text-xs text-gray-500 mt-0.5">SKU: {it.product.sku}</div>}
                    <div className="text-xs text-gray-500 mt-1">SL: {it.quantity}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500">Đơn giá</div>
                    <div className="font-semibold">{formatCurrency(it.unitPrice)}</div>
                    <div className="mt-2 text-gray-500">Thành tiền</div>
                    <div className="font-semibold">{formatCurrency(it.lineTotal)}</div>
                  </div>
                </div>
              ))}
              {(order.orderItems || []).length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">Không có sản phẩm</div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border border-indigo-100 rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b bg-indigo-50/60 text-indigo-700 font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" /></svg>
              Tổng quan
            </div>
            <div className="p-4 space-y-2 text-sm">
              <Row label="Tạm tính" value={formatCurrency(order.subTotal)} />
              <Row label="Giảm giá" value={formatCurrency(order.discountTotal)} />
              <Row label="Phí vận chuyển" value={formatCurrency(order.shippingFee)} />
              <div className="pt-2 border-t mt-2" />
              <Row label="Tổng thanh toán" value={formatCurrency(order.grandTotal)} bold />
            </div>
          </div>
          <div className="border border-indigo-100 rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b bg-indigo-50/60 text-indigo-700 font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4v10l9 4 9-4V7" /></svg>
              Giao hàng
            </div>
            <div className="p-4 text-sm text-gray-700 whitespace-pre-line min-h-[80px]">{addressText}</div>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <Link to="/orders" className="group inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
          <svg className="w-4 h-4 -translate-x-0.5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Quay lại danh sách đơn
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-gray-600">{label}</div>
      <div className={bold ? "font-semibold" : ""}>{value}</div>
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

// (legacy) badgeForPayment replaced by PaymentBadge component

function formatAddress(addr?: Record<string, string> | string) {
  if (!addr) return "(Không có địa chỉ)";
  if (typeof addr === "string") return addr;
  const parts = Object.values(addr).filter(Boolean);
  return parts.join(", ");
}

function BackLink() {
  return (
    <Link to="/orders" className="group inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
      <svg className="w-4 h-4 -translate-x-0.5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      <span>Quay lại</span>
    </Link>
  );
}

function StatusBadge({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
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
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={iconPath} /></svg>
      {value}
    </span>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M2 12l10-9 10 9-10 9-10-9z" /></svg>
  );
}
