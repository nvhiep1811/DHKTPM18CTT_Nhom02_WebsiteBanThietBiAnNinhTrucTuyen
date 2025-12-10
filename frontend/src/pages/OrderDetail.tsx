import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { orderApi, ReviewApi } from "../utils/api";
import { toast } from "react-toastify";
import { Star, X } from "lucide-react";

interface OrderItem {
  id?: string;
  product?: { id?: string; name?: string; sku?: string; thumbnailUrl?: string };
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  reviewId?: string;
  hasReview?: boolean;  // ✅ Add this
  rating?: number;
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
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const data = await orderApi.getById(id);
        if (!mounted) return;
        setOrder(data);
        setLoading(false);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Không thể tải chi tiết đơn hàng");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleOpenReview = (item: OrderItem) => {
    // Double-check authentication before opening modal
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      navigate("/login");
      return;
    }

    setSelectedItem(item);
    setRating(item.rating || 0);
    setComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedItem || rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nhận xét của bạn!");
      return;
    }

    if (comment.length > 1000) {
      toast.error("Nhận xét không được vượt quá 1000 ký tự!");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      navigate("/login");
      return;
    }

    // Validate productId
    if (!selectedItem.product?.id) {
      toast.error("Không tìm thấy thông tin sản phẩm!");
      console.error("Missing productId:", selectedItem);
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData: any = {
        productId: selectedItem.product.id,
        rating,
        comment: comment.trim(),
      };

      // Optionally include orderItem ID if available
      if (selectedItem.id) {
        reviewData.orderItem = selectedItem.id;
      }

      console.log("📝 Submitting review:", reviewData);
      console.log("🔑 Token exists:", !!token);
      console.log("🔑 Token preview:", token.substring(0, 20) + "...");

      const response = await ReviewApi.createReview(reviewData);
      console.log("✅ Review created:", response);
      
      toast.success("Đánh giá của bạn đã được gửi và đang chờ duyệt!");
      setShowReviewModal(false);
      
      // Update local state to reflect the review
      if (order && order.orderItems) {
        const updatedItems = order.orderItems.map(item => 
          item.product?.id === selectedItem.product?.id 
            ? { ...item, rating, reviewId: 'pending-review' }
            : item
        );
        setOrder({ ...order, orderItems: updatedItems });
      }
    } catch (e: any) {
      console.error("❌ Review submission error:", e);
      console.error("Error response:", e.response?.data);
      
      // Handle 401 specifically
      if (e.response?.status === 401) {
        // Check if this is after a retry (token refresh failed)
        if (e.config?._axiosRetry) {
          toast.error("Phiên đăng nhập đã hết hạn và không thể làm mới. Vui lòng đăng nhập lại!");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("tokenExpiresAt");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng thử lại!");
        }
        return;
      }
      
      const errorMessage = e.response?.data?.message || 
                          e.response?.data?.error ||
                          "Không thể gửi đánh giá. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-5">
        <BackLink />
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-8 bg-indigo-100 rounded w-64" />
            <div className="h-4 bg-gray-100 rounded w-48" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-blue-100 rounded-full w-24" />
            <div className="h-6 bg-green-100 rounded-full w-20" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4 animate-pulse">
            <div className="border border-indigo-100 rounded-lg bg-white shadow-sm overflow-hidden">
              <div className="h-12 bg-indigo-50/60" />
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-20" />
                      <div className="h-5 bg-gray-100 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 animate-pulse">
            <div className="border border-indigo-100 rounded-lg bg-white shadow-sm overflow-hidden">
              <div className="h-12 bg-indigo-50/60" />
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-24" />
                    <div className="h-4 bg-gray-100 rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-indigo-100 rounded-lg bg-white shadow-sm overflow-hidden">
              <div className="h-12 bg-indigo-50/60" />
              <div className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                  <div className="h-4 bg-gray-100 rounded w-4/6" />
                </div>
              </div>
            </div>
          </div>
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
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Đơn hàng #{shortId(order.id)}
          </h1>
          <p className="text-gray-600 text-sm">Tạo lúc {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex flex-wrap justify-end gap-2">
            <StatusBadge value={order.status} />
            <PaymentBadge value={order.paymentStatus} />
          </div>
          {/* <div className="text-xl font-bold text-gray-800">{formatCurrency(order.grandTotal)}</div> */}
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
                <div key={idx} className="p-4 hover:bg-indigo-50/40 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded overflow-hidden flex items-center justify-center">
                      {it.product?.thumbnailUrl ? (
                        <img src={it.product.thumbnailUrl} alt={it.product.name || "SP"} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4v10l9 4 9-4V7" /></svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link 
                        to={`/products/${it.product?.id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition"
                      >
                        {it.product?.name}
                      </Link>
                      {it.product?.sku && <div className="text-xs text-gray-500 mt-0.5">SKU: {it.product.sku}</div>}
                      <div className="text-xs text-gray-500 mt-1">SL: {it.quantity}</div>
                      {it.rating && it.reviewId && (
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < it.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">Đã đánh giá</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-500">Đơn giá</div>
                      <div className="font-semibold">{formatCurrency(it.unitPrice)}</div>
                      <div className="mt-2 text-gray-500">Thành tiền</div>
                      <div className="font-semibold">{formatCurrency(it.lineTotal)}</div>
                    </div>
                  </div>
                  
                  {!it.hasReview && order.status === "DELIVERED" && (
                    <button
                      onClick={() => handleOpenReview(it)}
                      className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.97] transition shadow-sm"
                    >
                      Viết đánh giá
                    </button>
                  )}
                  {!it.hasReview && order.status !== "DELIVERED" && (
                    <div className="mt-3 text-xs text-gray-500 italic">
                      Chỉ có thể đánh giá sau khi đơn hàng đã được giao
                    </div>
                  )}

                 {it.hasReview && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-600">Đã đánh giá</span>

                      {it.reviewId && (
                        <button
                          onClick={() =>
                            navigate('/profile', { state: { tab: 'reviews' } })
                          }
                          className="text-xs text-indigo-600 hover:underline ml-2"
                        >
                          Xem
                        </button>
                      )}
                    </div>
                  )}
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

      {/* Review Modal */}
      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-indigo-50/60">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Đánh giá sản phẩm</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedItem.product?.name}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">({rating}/5 sao)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét của bạn * <span className="text-xs text-gray-500">(tối đa 1000 ký tự)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {comment.length}/1000 ký tự
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Lưu ý:</strong> Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai. 
                  Vui lòng đánh giá khách quan và trung thực.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  ⚠️ Nếu gặp lỗi đăng nhập, vui lòng <button 
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="underline font-semibold hover:text-blue-800"
                  >đăng nhập lại</button> và thử lại.
                </p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-[.97] transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || rating === 0 || !comment.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.97] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}
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