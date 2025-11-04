// Mock data cho testing - Thay thế bằng data thực từ backend
export const mockUsers = {
  admin: {
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    id: "admin-1",
    phone: "0123456789",
    avatarUrl: "https://via.placeholder.com/150"
  },
  user: {
    email: "user@example.com",
    password: "user123",
    role: "user",
    name: "Regular User",
    id: "user-1",
    phone: "0987654321",
    avatarUrl: "https://via.placeholder.com/150"
  }
};

// Để test, sử dụng credentials trên để đăng nhập
// - Admin: admin@example.com / admin123
// - User: user@example.com / user123