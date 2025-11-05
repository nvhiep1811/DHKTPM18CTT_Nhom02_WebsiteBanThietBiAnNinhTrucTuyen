import React, {useEffect} from 'react';
import { Shield, Award, Users, Clock, Target, Heart, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About: React.FC = () => {

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  
  const stats = [
    { icon: Users, value: '10,000+', label: 'Khách hàng tin tưởng' },
    { icon: Award, value: '15+', label: 'Năm kinh nghiệm' },
    { icon: CheckCircle, value: '50,000+', label: 'Sản phẩm đã bán' },
    { icon: TrendingUp, value: '98%', label: 'Khách hàng hài lòng' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Chất Lượng Hàng Đầu',
      description: 'Chúng tôi cam kết cung cấp những sản phẩm an ninh chất lượng cao nhất, được kiểm định nghiêm ngặt từ các thương hiệu uy tín trên thế giới.'
    },
    {
      icon: Heart,
      title: 'Tận Tâm Với Khách Hàng',
      description: 'Sự hài lòng của khách hàng là ưu tiên số một. Chúng tôi luôn lắng nghe và đáp ứng mọi nhu cầu một cách tốt nhất.'
    },
    {
      icon: Target,
      title: 'Chuyên Nghiệp',
      description: 'Đội ngũ kỹ thuật viên được đào tạo bài bản, giàu kinh nghiệm, sẵn sàng tư vấn và hỗ trợ 24/7.'
    },
    {
      icon: Clock,
      title: 'Giao Hàng Nhanh Chóng',
      description: 'Cam kết giao hàng nhanh chóng trong 24-48h, lắp đặt và hướng dẫn sử dụng hoàn toàn miễn phí.'
    }
  ];

  const timeline = [
    {
      year: '2009',
      title: 'Khởi Đầu Hành Trình',
      description: 'SecureShop được thành lập với sứ mệnh mang đến giải pháp an ninh chất lượng cho mọi gia đình Việt Nam.'
    },
    {
      year: '2015',
      title: 'Mở Rộng Quy Mô',
      description: 'Mở rộng hệ thống chi nhánh trên toàn quốc, phục vụ hàng nghìn khách hàng mỗi tháng.'
    },
    {
      year: '2020',
      title: 'Chuyển Đổi Số',
      description: 'Ra mắt nền tảng thương mại điện tử, đưa sản phẩm đến gần hơn với khách hàng.'
    },
    {
      year: '2024',
      title: 'Dẫn Đầu Thị Trường',
      description: 'Trở thành đơn vị cung cấp thiết bị an ninh hàng đầu Việt Nam với hơn 10,000 khách hàng tin tưởng.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
        <Header />
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-purple-600 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Về SecureShop</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
              Đối tác tin cậy trong việc bảo vệ an toàn cho ngôi nhà và doanh nghiệp của bạn
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-zinc-800 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-zinc-800 mb-6">Câu Chuyện Của Chúng Tôi</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  SecureShop được thành lập từ năm 2009 với mục tiêu đơn giản nhưng đầy ý nghĩa: 
                  mang đến sự an tâm cho mọi gia đình Việt Nam thông qua các giải pháp an ninh hiện đại và đáng tin cậy.
                </p>
                <p>
                  Sau hơn 15 năm phát triển, chúng tôi tự hào là đơn vị tiên phong trong lĩnh vực 
                  cung cấp thiết bị an ninh, với đội ngũ chuyên gia giàu kinh nghiệm và hệ thống 
                  phân phối rộng khắp cả nước.
                </p>
                <p>
                  Chúng tôi không chỉ bán sản phẩm, mà còn xây dựng niềm tin và sự an tâm cho 
                  hàng nghìn gia đình và doanh nghiệp trên khắp Việt Nam. Mỗi sản phẩm chúng tôi 
                  cung cấp đều được chọn lọc kỹ càng, đảm bảo chất lượng cao nhất.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="SecureShop Office"
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Giá Trị Cốt Lõi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị mà chúng tôi luôn kiên định và phấn đấu mỗi ngày
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Hành Trình Phát Triển</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những cột mốc quan trọng đánh dấu sự phát triển của SecureShop
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-200"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row gap-8 items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="text-2xl font-bold text-purple-600 mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold text-zinc-800 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center justify-center">
                    <div className="w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-zinc-800 mb-4">Đội Ngũ Lãnh Đạo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những con người tài năng và tâm huyết đằng sau sự thành công của SecureShop
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8">
            {[
              {
                name: 'Nguyễn Võ Hiệp',
                position: 'CEO & Founder',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Phan Nhật Tiến',
                position: 'CTO',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Nguyễn Hoàng Khải',
                position: 'Head of Operations',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Nguyễn Gia Hào',
                position: 'Head of Operations',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                name: 'Nguyễn Anh Xuân Trường',
                position: 'Head of Operations',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                />
                <h3 className="text-xl font-semibold text-zinc-800 mb-1">{member.name}</h3>
                <p className="text-purple-600 font-medium">{member.position}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Sẵn Sàng Hợp Tác Cùng Chúng Tôi?</h2>
            <p className="text-xl mb-8 opacity-90">
              Hãy để SecureShop trở thành đối tác đáng tin cậy trong việc bảo vệ tài sản của bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Xem Sản Phẩm
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Liên Hệ Ngay
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;