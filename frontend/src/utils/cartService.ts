import { toast } from "react-toastify";
import { api } from "./axiosConfig";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  inStock: boolean;
  availableStock?: number;
  quantity: number;
}

class CartService {
  private isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }

  // === Get Cart ===
  async getCart(): Promise<CartItem[]> {
    if (this.isAuthenticated()) {
      try {
        const { data } = await api.get<CartItem[]>("/cart");
        return data;
      } catch {
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
      price: number;
      thumbnailUrl: string;
      inStock: boolean;
      availableStock?: number;
    },
    quantity = 1
  ): Promise<boolean> {
    const maxQty = product.availableStock ?? 99;

    // Kiểm tra sản phẩm có sẵn không
    if (!product.inStock || maxQty <= 0) {
      toast.warning("Sản phẩm hiện không có sẵn.");
      return false;
    }

    // Kiểm tra số lượng yêu cầu
    if (quantity > maxQty) {
      toast.warning(`Chỉ còn ${maxQty} sản phẩm trong kho.`);
      quantity = maxQty;
    }

    if (this.isAuthenticated()) {
      // === USER ĐÃ ĐĂNG NHẬP ===
      try {
        // Lấy cart hiện tại để kiểm tra số lượng đã có
        const currentCart = await this.getCart();
        const existing = currentCart.find((i) => i.productId === product.id);

        const currentQty = existing ? existing.quantity : 0;
        const totalQty = currentQty + quantity;

        // Kiểm tra tổng số lượng sau khi thêm
        if (totalQty > maxQty) {
          const canAdd = maxQty - currentQty;

          if (canAdd <= 0) {
            toast.warning(
              `Bạn đã có ${currentQty} sản phẩm trong giỏ. Không thể thêm nữa!`
            );
            return false;
          }

          toast.warning(
            `Chỉ có thể thêm tối đa ${canAdd} sản phẩm nữa. Đã thêm ${canAdd} sản phẩm.`
          );
          quantity = canAdd;
        }

        await api.post("/cart/add", {
          // Sửa: dùng api
          productId: product.id,
          name: product.name,
          price: product.price,
          thumbnailUrl: product.thumbnailUrl,
          inStock: product.inStock,
          availableStock: product.availableStock,
          quantity: quantity,
        });
      } catch (error: any) {
        // Xử lý lỗi từ backend
        const errorMsg =
          error.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng.";
        toast.error(errorMsg);
        return false;
      }
    } else {
      // === GUEST USER ===
      const cart = await this.getCart();
      const existing = cart.find((i) => i.productId === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;

        // Kiểm tra vượt quá tồn kho
        if (newQty > maxQty) {
          const canAdd = maxQty - existing.quantity;

          if (canAdd <= 0) {
            toast.warning(
              `Bạn đã có ${existing.quantity} sản phẩm trong giỏ. Không thể thêm nữa!`
            );
            return false;
          }

          existing.quantity = maxQty;
          toast.warning(
            `Chỉ có thể thêm tối đa ${canAdd} sản phẩm nữa. Đã thêm ${canAdd} sản phẩm.`
          );
          localStorage.setItem("guestCart", JSON.stringify(cart));
          return true;
        } else {
          existing.quantity = newQty;
        }
      } else {
        cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          thumbnailUrl: product.thumbnailUrl,
          inStock: product.inStock,
          availableStock: product.availableStock,
          quantity: Math.min(quantity, maxQty),
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    return true;
  }

  // === Update Quantity ===
  async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    const cart = await this.getCart();
    const item = cart.find((i) => i.productId === productId);

    if (!item) {
      toast.error("Sản phẩm không tồn tại trong giỏ hàng.");
      return false;
    }

    const maxQty = item.availableStock ?? 99;

    // Kiểm tra vượt quá tồn kho
    if (quantity > maxQty) {
      toast.warning(`Số lượng yêu cầu vượt quá tồn kho (${maxQty}).`);
      quantity = maxQty;
    }

    // Nếu quantity <= 0 thì xóa sản phẩm
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    if (this.isAuthenticated()) {
      try {
        await api.put("/cart/update", {
          // Sửa: dùng api
          productId,
          quantity,
        });
        return true;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          "Không thể cập nhật số lượng sản phẩm.";
        toast.error(errorMsg);
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
        await api.delete(`/cart/remove/${productId}`); // Sửa: dùng api
        return true;
      } catch {
        toast.error("Không thể xóa sản phẩm khỏi giỏ hàng.");
        return false;
      }
    } else {
      const cart = await this.getCart();
      const filtered = cart.filter((i) => i.productId !== productId);
      localStorage.setItem("guestCart", JSON.stringify(filtered));
      return true;
    }
  }

  // === Clear Cart ===
  async clearCart(): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        await api.delete("/cart/clear"); // Sửa: dùng api
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
      await api.post("/cart/merge", { items }); // Sửa: dùng api
      localStorage.removeItem("guestCart");
      toast.success("Đã hợp nhất giỏ hàng!");
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
