import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Terms: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'acceptance',
      title: '1. Chấp Nhận Điều Khoản',
      icon: CheckCircle,
      content: 'Khi truy cập và sử dụng trang web SecureShop, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, vui lòng không sử dụng dịch vụ của chúng tôi.'
    },
    {
      id: 'account',
      title: '2. Tài Khoản Người Dùng',
      icon: Shield,
      content: 'Để sử dụng một số tính năng của dịch vụ, bạn có thể cần tạo tài khoản.',
      list: [
        'Cung cấp thông tin chính xác, đầy đủ và cập nhật',
        'Bảo mật thông tin đăng nhập của bạn',
        'Thông báo ngay cho chúng tôi về bất kỳ truy cập trái phép nào',
        'Chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của bạn'
      ]
    },
    {
      id: 'prohibited',
      title: '3. Hành Vi Cấm',
      icon: AlertCircle,
      content: 'Bạn đồng ý không:',
      list: [
        'Sử dụng dịch vụ cho mục đích bất hợp pháp',
        'Vi phạm bất kỳ luật hoặc quy định nào',
        'Xâm phạm quyền sở hữu trí tuệ của chúng tôi hoặc bên thứ ba',
        'Truyền tải virus, mã độc hoặc nội dung có hại',
        'Can thiệp hoặc làm gián đoạn dịch vụ',
        'Thu thập dữ liệu người dùng khác mà không được phép'
      ]
    }
  ];

  const quickLinks = [
    { title: 'Sản Phẩm và Dịch Vụ', items: ['Thông tin sản phẩm', 'Giá cả', 'Đặt hàng'] },
    { title: 'Thanh Toán & Giao Hàng', items: ['Phương thức thanh toán', 'Thời gian giao hàng', 'Phí vận chuyển'] },
    { title: 'Chính Sách', items: ['Đổi trả và hoàn tiền', 'Bảo hành', 'Quyền sở hữu trí tuệ'] }
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
              <FileText className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Điều Khoản Dịch Vụ</h1>
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
                Chào mừng bạn đến với SecureShop. Bằng việc truy cập và sử dụng website của chúng tôi, 
                bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Vui lòng đọc kỹ 
                các điều khoản này trước khi sử dụng dịch vụ.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Nội Dung Chính</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tổng quan về các điều khoản quan trọng
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {quickLinks.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-lg"
              >
                <h3 className="text-xl font-semibold text-zinc-800 mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-lg shadow-md"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-800">{section.title}</h2>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
                  
                  {section.list && (
                    <ul className="space-y-3">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Additional Sections */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 space-y-8"
          >
            {/* Products */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">4. Sản Phẩm và Dịch Vụ</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">Thông Tin Sản Phẩm</h3>
                  <p>Chúng tôi cố gắng cung cấp thông tin sản phẩm chính xác nhất. Tuy nhiên, chúng tôi không đảm bảo rằng mô tả sản phẩm, hình ảnh hoặc nội dung khác trên website là chính xác, đầy đủ, đáng tin cậy hoặc không có lỗi.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">Giá Cả</h3>
                  <p>Tất cả giá cả được hiển thị bằng VNĐ và có thể thay đổi mà không cần thông báo trước. Chúng tôi có quyền hủy đơn hàng nếu phát hiện lỗi giá nghiêm trọng.</p>
                </div>
              </div>
            </div>

            {/* Payment & Delivery */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">5. Thanh Toán và Giao Hàng</h2>
              <div className="space-y-4 text-gray-700">
                <p>Chúng tôi chấp nhận các hình thức thanh toán được liệt kê trên website. Thời gian giao hàng ước tính là 24-48 giờ trong nội thành và 3-7 ngày cho các tỉnh thành khác.</p>
              </div>
            </div>

            {/* Return & Warranty */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">6. Đổi Trả và Bảo Hành</h2>
              <div className="space-y-4 text-gray-700">
                <p>Chúng tôi chấp nhận đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ bao bì, phụ kiện. Tất cả sản phẩm được bảo hành theo chính sách của nhà sản xuất.</p>
              </div>
            </div>

            {/* Liability */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">7. Giới Hạn Trách Nhiệm</h2>
              <div className="space-y-4 text-gray-700">
                <p>Trong phạm vi tối đa được pháp luật cho phép, SecureShop sẽ không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả nào phát sinh từ việc sử dụng dịch vụ.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 p-8 rounded-lg text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Liên Hệ</h2>
            <p className="mb-6">Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi:</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="font-semibold mb-1">Email</p>
                <a href="mailto:support@secureshop.vn" className="hover:underline">support@secureshop.vn</a>
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-600 mb-6">
              Bằng cách sử dụng SecureShop, bạn xác nhận đã đọc và đồng ý với các điều khoản này.
            </p>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-lg transition-colors"
            >
              <Shield className="h-5 w-5" />
              Xem Chính Sách Bảo Mật
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;