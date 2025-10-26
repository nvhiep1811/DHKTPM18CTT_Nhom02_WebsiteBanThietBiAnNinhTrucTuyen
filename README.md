# 🛡️ SecureShop — E-Commerce Security Devices

SecureShop là website giới thiệu và bán trực tuyến các thiết bị an ninh như camera, cảm biến, chuông cửa, khóa thông minh…  
Hệ thống gồm **backend Spring Boot** và **frontend Vite React (TypeScript)** — kết nối thông qua REST API.

---

## 🚀 Features

- 🛒 Giỏ hàng, đặt hàng, thanh toán
- 🔐 Xác thực OAuth2 Google / Facebook
- 🔑 JWT Access + Refresh Token
- 👤 Phân quyền admin / customer
- 📦 Quản trị sản phẩm, danh mục, đơn hàng
- 💬 Toast notification, UX mượt mà
- 🧳 Session giỏ hàng lưu Redis
- 📷 Lưu ảnh, thông tin sản phẩm

---

## 🧰 Technology Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React + TypeScript, TailwindCSS, React Router v7 |
| Backend | Spring Boot 3, Spring Security, Spring Data JPA |
| Auth | OAuth2 Login (Google/Facebook), JWT |
| Database | Supabase PostgreSQL |
| Session | Spring Session + Redis |
| Deploy | Docker ready |

---

## 📁 Project Structure

<img width="446" height="436" alt="image" src="https://github.com/user-attachments/assets/78456714-6284-49c5-b974-8d7b46776e9e" />


---

## ⚙️ Backend — Run (Dev)

cd backend
mvn spring-boot:run

---

## 🎨 Frontend — Run (Dev)

cd frontend
npm install
npm run dev

Mặc định chạy tại `http://localhost:5173`.

---

## 🔐 Environment & Secrets

**Không commit** các thông tin nhạy cảm (DB password, OAuth client secret, JWT key,…)

Sử dụng file:
backend/.env
frontend/.env
và thêm vào `.gitignore`.

---

## 🏁 Roadmap (Next)

- [ ] Tích hợp thanh toán (VNPay)
- [ ] Docker Compose backend + frontend + database + redis
- [ ] Admin dashboard hoàn chỉnh
- [ ] Logging + Metrics + Alerting

---

## 📜 License

Dự án thuộc sở hữu nhóm phát triển — không dùng thương mại khi chưa được phép.

---

## 👨‍💻 Authors

- Dev: Fiveting.org

---
