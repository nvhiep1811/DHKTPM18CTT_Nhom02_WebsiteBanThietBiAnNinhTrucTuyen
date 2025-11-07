import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const Privacy: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dataTypes = [
    {
      icon: UserCheck,
      title: 'Thông Tin Cá Nhân',
      items: ['Họ tên, email, số điện thoại', 'Địa chỉ giao hàng và thanh toán', 'Thông tin tài khoản', 'Lịch sử đơn hàng']
    },
    {
      icon: Eye,
      title: 'Thông Tin Tự Động',
      items: ['Địa chỉ IP và thiết bị', 'Loại trình duyệt', 'Thời gian truy cập', 'Cookies']
    },
    {
      icon: Database,
      title: 'Mục Đích Sử Dụng',
      items: ['Xử lý đơn hàng', 'Chăm sóc khách hàng', 'Cải thiện dịch vụ', 'Gửi thông tin khuyến mãi']
    }
  ];

  const securityMeasures = [
    {
      icon: Lock,
      title: 'Mã Hóa SSL/TLS',
      description: 'Tất cả dữ liệu truyền tải được mã hóa để bảo vệ thông tin của bạn'
    },
    {
      icon: Shield,
      title: 'Máy Chủ An Toàn',
      description: 'Dữ liệu được lưu trữ trên máy chủ có tường lửa và bảo mật cao'
    },
    {
      icon: Lock,
      title: 'Mã Hóa Mật Khẩu',
      description: 'Mật khẩu và thông tin nhạy cảm được mã hóa hoàn toàn'
    },
    {
      icon: UserCheck,
      title: 'Kiểm Soát Truy Cập',
      description: 'Chỉ nhân viên được ủy quyền mới có thể truy cập dữ liệu'
    }
  ];

  const userRights = [
    'Quyền truy cập: Yêu cầu xem thông tin cá nhân',
    'Quyền chỉnh sửa: Cập nhật thông tin không chính xác',
    'Quyền xóa: Yêu cầu xóa dữ liệu cá nhân',
    'Quyền hạn chế: Hạn chế xử lý dữ liệu',
    'Quyền phản đối: Phản đối xử lý cho mục đích tiếp thị',
    'Quyền chuyển dữ liệu: Nhận bản sao dữ liệu'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[300px] bg-gradient-to-r from-purple-600 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Chính Sách Bảo Mật</h1>
            </div>
            <p className="text-xl md:text-2xl opacity-90">
              Cập nhật lần cuối: Tháng 11, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white border-l-4 border-purple-600 p-8 rounded-r-lg shadow-md">
              <p className="text-lg text-gray-700 leading-relaxed">
                Tại SecureShop, chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn một cách 
                minh bạch và an toàn nhất.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Thông Tin Chúng Tôi Thu Thập</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi thu thập các loại thông tin sau để cung cấp dịch vụ tốt nhất
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {dataTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-6 rounded-lg"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-800 mb-4">{type.title}</h3>
                  <ul className="space-y-2">
                    {type.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Biện Pháp Bảo Mật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi áp dụng nhiều lớp bảo mật để bảo vệ thông tin của bạn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityMeasures.map((measure, index) => {
              const Icon = measure.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg shadow-md text-center"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">{measure.title}</h3>
                  <p className="text-gray-600 text-sm">{measure.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Rights */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Quyền Của Bạn</h2>
            <p className="text-gray-600">
              Bạn có các quyền sau đối với dữ liệu cá nhân của mình
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-50 p-8 rounded-lg"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {userRights.map((right, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{right}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-center">
                Để thực hiện các quyền này, vui lòng liên hệ:{' '}
                <a href="mailto:privacy@secureshop.vn" className="text-purple-600 hover:text-purple-700 font-semibold">
                  privacy@secureshop.vn
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-8 w-8 text-purple-600" />
                <h3 className="text-xl font-semibold text-zinc-800">Lưu Trữ Dữ Liệu</h3>
              </div>
              <p className="text-gray-700">
                Chúng tôi chỉ lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để cung cấp 
                dịch vụ và tuân thủ các yêu cầu pháp lý (thường là 5-7 năm cho hồ sơ tài chính). 
                Sau đó, dữ liệu sẽ được xóa hoặc ẩn danh hóa.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-8 w-8 text-purple-600" />
                <h3 className="text-xl font-semibold text-zinc-800">Cookies</h3>
              </div>
              <p className="text-gray-700">
                Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn, ghi nhớ thông tin đăng nhập 
                và phân tích lưu lượng truy cập. Bạn có thể quản lý cookies qua cài đặt trình duyệt.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Data Sharing */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white border-l-4 border-purple-600 p-8 rounded-r-lg shadow-md"
          >
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">Chia Sẻ Thông Tin</h2>
            <p className="text-gray-700 mb-4">
              Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ 
              thông tin với:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-zinc-800">Đối tác giao hàng</p>
                  <p className="text-gray-600 text-sm">Để giao sản phẩm đến bạn</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-zinc-800">Cổng thanh toán</p>
                  <p className="text-gray-600 text-sm">Để xử lý giao dịch an toàn</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-zinc-800">Nhà cung cấp dịch vụ</p>
                  <p className="text-gray-600 text-sm">Hỗ trợ vận hành website</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-zinc-800">Cơ quan pháp luật</p>
                  <p className="text-gray-600 text-sm">Khi có yêu cầu hợp pháp</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 p-8 rounded-lg text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Liên Hệ Về Bảo Mật</h2>
            <p className="mb-6">
              Nếu bạn có câu hỏi về chính sách bảo mật này hoặc muốn thực hiện quyền của mình, 
              vui lòng liên hệ:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="font-semibold mb-1">Email Bảo Mật</p>
                <a href="mailto:privacy@secureshop.vn" className="hover:underline">privacy@secureshop.vn</a>
              </div>
              <div>
                <p className="font-semibold mb-1">Điện thoại</p>
                <a href="tel:0123456789" className="hover:underline">0123 456 789</a>
              </div>
              <div>
                <p className="font-semibold mb-1">Địa chỉ</p>
                <p>123 Đường ABC, Quận 1, TP.HCM</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-600 mb-6">
              Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và luôn minh bạch về cách sử dụng dữ liệu.
            </p>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-lg transition-colors"
            >
              <FileText className="h-5 w-5" />
              Xem Điều Khoản Dịch Vụ
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;