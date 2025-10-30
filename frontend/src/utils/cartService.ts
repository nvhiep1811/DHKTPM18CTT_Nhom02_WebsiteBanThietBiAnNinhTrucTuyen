import axios from "axios";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  inStock: boolean;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:12345/api";

class CartService {
  private isAuthenticated(): boolean {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    return !!token;
  }

  // Get cart from appropriate source
  async getCart(): Promise<CartItem[]> {
    if (this.isAuthenticated()) {
      try {
        // Fetch from backend session
        const response = await axios.get(`${API_BASE_URL}/cart`, {
          withCredentials: true, // Important for session cookies
        });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch cart from backend:", error);
        return [];
      }
    } else {
      // Get from localStorage for guests
      const cart = localStorage.getItem("guestCart");
      return cart ? JSON.parse(cart) : [];
    }
  }

  // Add item to cart
  async addToCart(
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      inStock: boolean;
    },
    quantity?: number
  ): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        // Add to backend session
        await axios.post(
          `${API_BASE_URL}/cart/add`,
          { productId: product.id, quantity: quantity || 1 },
          { withCredentials: true }
        );
        return true;
      } catch (error) {
        console.error("Failed to add to cart:", error);
        return false;
      }
    } else {
      // Add to localStorage for guests
      const cart = await this.getCart();
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.push({
          ...product,
          quantity: quantity || 1,
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(cart));
      return true;
    }
  }

  // Update quantity
  async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        await axios.put(
          `${API_BASE_URL}/cart/update`,
          { productId, quantity },
          { withCredentials: true }
        );
        return true;
      } catch (error) {
        console.error("Failed to update quantity:", error);
        return false;
      }
    } else {
      const cart = await this.getCart();
      const item = cart.find((i) => i.id === productId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem("guestCart", JSON.stringify(cart));
        return true;
      }
      return false;
    }
  }

  // Remove item
  async removeItem(productId: string): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`, {
          withCredentials: true,
        });
        return true;
      } catch (error) {
        console.error("Failed to remove item:", error);
        return false;
      }
    } else {
      const cart = await this.getCart();
      const filteredCart = cart.filter((item) => item.id !== productId);
      localStorage.setItem("guestCart", JSON.stringify(filteredCart));
      return true;
    }
  }

  // Clear cart
  async clearCart(): Promise<boolean> {
    if (this.isAuthenticated()) {
      try {
        await axios.delete(`${API_BASE_URL}/cart/clear`, {
          withCredentials: true,
        });
        return true;
      } catch (error) {
        console.error("Failed to clear cart:", error);
        return false;
      }
    } else {
      localStorage.removeItem("guestCart");
      return true;
    }
  }

  // Merge guest cart to user cart after login
  async mergeGuestCart(): Promise<void> {
    const guestCart = localStorage.getItem("guestCart");
    if (!guestCart) return;

    const items: CartItem[] = JSON.parse(guestCart);
    if (items.length === 0) return;

    try {
      // Send guest cart to backend to merge with session cart
      await axios.post(
        `${API_BASE_URL}/cart/merge`,
        { items },
        { withCredentials: true }
      );

      // Clear guest cart after successful merge
      localStorage.removeItem("guestCart");
    } catch (error) {
      console.error("Failed to merge cart:", error);
    }
  }

  // Get cart count
  async getCartCount(): Promise<number> {
    const cart = await this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
}

export const cartService = new CartService();
