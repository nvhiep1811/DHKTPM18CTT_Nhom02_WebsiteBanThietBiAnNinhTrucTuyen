import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Tag, 
  ShoppingCart, 
  Percent, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart3,
  Warehouse
} from 'lucide-react';

// Type for admin modules
interface AdminModule {
  default: React.FC<any>;
  loadData?: () => Promise<any>;
}

type TabKey =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'brands'
  | 'orders'
  | 'inventories'
  | 'discount'
  | 'users'
  | 'articles'
  | 'tickets'
  | 'analytics';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: 'products', label: 'Sản phẩm', icon: <Package className="w-5 h-5" /> },
  { key: 'categories', label: 'Danh mục', icon: <FolderTree className="w-5 h-5" /> },
  { key: 'brands', label: 'Thương hiệu', icon: <Tag className="w-5 h-5" /> },
  { key: 'orders', label: 'Đơn hàng', icon: <ShoppingCart className="w-5 h-5" /> },
  { key: 'inventories', label: 'Tồn kho', icon: <Warehouse className="w-5 h-5" /> },
  { key: 'discount', label: 'Khuyến mãi', icon: <Percent className="w-5 h-5" /> },
  { key: 'users', label: 'Người dùng', icon: <Users className="w-5 h-5" /> },
  { key: 'articles', label: 'Bài viết', icon: <FileText className="w-5 h-5" /> },
  { key: 'tickets', label: 'Hỗ trợ', icon: <MessageSquare className="w-5 h-5" /> },
  { key: 'analytics', label: 'Thống kê', icon: <BarChart3 className="w-5 h-5" /> },
];

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [loading, setLoading] = useState(false);
  const [LoadedComponent, setLoadedComponent] = useState<React.FC<any> | null>(null);
  const [data, setData] = useState<any>(null);
  const [currentLoadData, setCurrentLoadData] = useState<(() => Promise<any>) | null>(null);

  const reloadCurrentTab = async () => {
    if (!currentLoadData) return;
    
    try {
      setLoading(true);
      const newData = await currentLoadData();
      setData(newData);
    } catch (error) {
      console.error('Error reloading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadForTab = async (tab: TabKey) => {
      setLoading(true);
      setData(null);
      setLoadedComponent(null);

      try {
        switch (tab) {
          case 'dashboard': {
            const mod = await import('./admin/Dashboard') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'categories': {
            const mod = await import('./admin/Categories') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'brands': {
            const mod = await import('./admin/Brands') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'orders': {
            const mod = await import('./admin/Orders') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'inventories': {
            const mod = await import('./admin/Inventories') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'products': {
            const mod = await import('./admin/Products') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'discount': {
            const mod = await import('./admin/Discount') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'users': {
            const mod = await import('./admin/Users') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'articles': {
            const mod = await import('./admin/Articles') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'tickets': {
            const mod = await import('./admin/Tickets') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          case 'analytics': {
            const mod = await import('./admin/Analytics') as AdminModule;
            if (!mounted) return;
            setLoadedComponent(() => mod.default);
            setCurrentLoadData(() => mod.loadData || (() => Promise.resolve(null)));
            const d = await (mod.loadData?.() ?? null);
            setData(d);
            break;
          }
          default:
            break;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadForTab(activeTab);

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl shadow-lg p-8 text-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Quản Trị Hệ Thống</h1>
            <p className="text-purple-100 text-lg">
              Quản lý toàn bộ nội dung và dữ liệu của website
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <nav className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md transform scale-[1.02]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                    }`}
                  >
                    <span className={activeTab === tab.key ? 'text-white' : 'text-gray-500'}>
                      {tab.icon}
                    </span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <section className="flex-1 min-h-[500px]">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              )}

              {!loading && LoadedComponent && (
                <div className="animate-fadeIn">
                  <LoadedComponent data={data} onReload={reloadCurrentTab} />
                </div>
              )}

              {!loading && !LoadedComponent && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutDashboard className="w-10 h-10 text-purple-600" />
                  </div>
                  <p className="text-gray-600 text-lg">Chọn một mục từ menu để bắt đầu</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;