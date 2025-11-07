import axios from "axios";
import { toast } from "react-toastify";

export interface CartItem {
  id: string;
  name: string;
  listedPrice: number;
  thumbnailUrl: string;
  inStock: boolean;
  availableStock?: number; // tồn kho thực tế
  quantity: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:12345/api";

class CartService {
  private isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  // === Get Cart ===
  async getCart(): Promise<CartItem[]> {
    if (this.isAuthenticated()) {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/cart`, {
          withCredentials: true,
        });
        return data;
      } catch {
        toast.error("Lỗi! Không thể tải giỏ hàng.");
        return [];
      }
    } else {
      try {
        const cart = localStorage.getItem("guestCart");
        return cart ? JSON.parse(cart) : [];
      } catch {
        localStorage.removeItem("guestCart");
        return [];
      }
    }
  }

  // === Add Item to Cart ===
  async addToCart(
    product: {
      id: string;
      name: string;
      listedPrice: number;
      thumbnailUrl: string;
      inStock: boolean;
      availableStock?: number;
    },
    quantity = 1
  ): Promise<boolean> {
    const maxQty = product.availableStock ?? 99;

    if (!product.inStock || maxQty <= 0) {
      toast.warning("Sản phẩm hiện không có sẵn.");
      return false;
    }

    if (quantity > maxQty) {
      toast.warning(`Chỉ còn ${maxQty} sản phẩm trong kho.`);
      quantity = maxQty;
    }

    if (this.isAuthenticated()) {
      try {
        await axios.post(
          `${API_BASE_URL}/cart/add`,
          { productId: product.id, quantity },
          { withCredentials: true }
        );
        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        return true;
      } catch {
        toast.error("Lỗi! Không thể thêm sản phẩm vào giỏ hàng.");
        return false;
      }
    } else {
      const cart = await this.getCart();
      const existing = cart.find((i) => i.id === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > maxQty) {
          existing.quantity = maxQty;
          toast.info("Đã đạt số lượng tối đa theo hàng tồn kho.");
          return false;
        } else {
          existing.quantity = newQty;
        }
      } else {
        cart.push({ ...product, quantity: Math.min(quantity, maxQty) });
      }

      localStorage.setItem("guestCart", JSON.stringify(cart));
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      return true;
    }
  }

  // === Update Quantity ===
  async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    const cart = await this.getCart();
    const item = cart.find((i) => i.id === productId);

    if (!item) {
      toast.error("Sản phẩm không tồn tại trong giỏ hàng.");
      return false;
    }

    const maxQty = item.availableStock ?? 99;

    if (quantity > maxQty) {
      toast.warning(`Số lượng yêu cầu vượt quá tồn kho (${maxQty}).`);
      quantity = maxQty;
    }

    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    if (this.isAuthenticated()) {
      try {
        await axios.put(
          `${API_BASE_URL}/cart/update`,
          { productId, quantity },
          { withCredentials: true }
        );
        return true;
      } catch {
        toast.error("Lỗi! Không thể cập nhật số lượng sản phẩm.");
        return false;
      }
    } else {
      item.quantity = quantity;
      localStorage.setItem("guestCart", JSON.stringify(cart));
      return true;
    }
  }

  // === Remove Item ===
  async removeItem(productId: string): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`, {
          withCredentials: true,
        });
        return true;
      } catch {
        return false;
      }
    } else {
      const cart = await this.getCart();
      const filtered = cart.filter((i) => i.id !== productId);
      localStorage.setItem("guestCart", JSON.stringify(filtered));
      return true;
    }
  }

  // === Clear Cart ===
  async clearCart(): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        await axios.delete(`${API_BASE_URL}/cart/clear`, {
          withCredentials: true,
        });
        return true;
      } catch {
        toast.error("Lỗi! Không thể xóa toàn bộ giỏ hàng.");
        return false;
      }
    } else {
      localStorage.removeItem("guestCart");
      return true;
    }
  }

  // === Merge Guest Cart After Login ===
  async mergeGuestCart(): Promise<void> {
    const guestCart = localStorage.getItem("guestCart");
    if (!guestCart) return;

    const items: CartItem[] = JSON.parse(guestCart);
    if (items.length === 0) return;

    try {
      await axios.post(
        `${API_BASE_URL}/cart/merge`,
        { items },
        { withCredentials: true }
      );
      localStorage.removeItem("guestCart");
    } catch {
      toast.error("Lỗi! Không thể hợp nhất giỏ hàng.");
    }
  }

  // === Cart Count ===
  async getCartCount(): Promise<number> {
    const cart = await this.getCart();
    return cart.reduce((total, i) => total + i.quantity, 0);
  }
}

export const cartService = new CartService();
