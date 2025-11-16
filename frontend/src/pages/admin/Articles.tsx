import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, X, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { ArticleApi } from '../../utils/api';
import type { Article } from '../../types/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import ArticleModal from '../../components/admin-modal/ArticleModal';

type Props = { 
  data?: Article[];
  onReload?: () => void;
};

const Articles: React.FC<Props> = ({ data, onReload }) => {
  const articles = data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    article?: Article;
  }>({ open: false });

  const [articleModal, setArticleModal] = useState<{
    open: boolean;
    article?: Article;
  }>({ open: false });

  const [viewModal, setViewModal] = useState<{
    open: boolean;
    article?: Article;
  }>({ open: false });

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Tìm kiếm theo tiêu đề, nội dung, tác giả
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((article: Article) => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        (article.adminName && article.adminName.toLowerCase().includes(searchLower))
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter((article: Article) => {
        if (statusFilter === 'active') return article.active;
        if (statusFilter === 'inactive') return !article.active;
        return true;
      });
    }

    return filtered;
  }, [articles, searchTerm, statusFilter]);

  const handleDeleteArticle = (article: Article) => {
    setConfirmDialog({ open: true, article });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.article) return;

    try {
      await ArticleApi.delete(confirmDialog.article.id);
      toast.success('Đã xóa bài viết thành công');
      setConfirmDialog({ open: false });
      onReload?.();
    } catch (error: any) {
      console.error('Error deleting article:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền thực hiện thao tác này.');
      } else {
        toast.error('Có lỗi xảy ra khi xóa bài viết');
      }
    }
  };

  const handleCreateArticle = () => {
    setArticleModal({ open: true });
  };

  const handleEditArticle = (article: Article) => {
    setArticleModal({ open: true, article });
  };

  const handleViewArticle = (article: Article) => {
    setViewModal({ open: true, article });
  };

  const handleArticleModalSuccess = () => {
    onReload?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Quản lý bài viết</h2>
        <button 
          onClick={handleCreateArticle}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm bài viết</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đã xuất bản</option>
          <option value="inactive">Nháp</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article: Article) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.content.substring(0, 150)}...</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Tác giả: {article.adminName || 'Admin'}</span>
                      <span>•</span>
                      <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded ${article.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {article.active ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewArticle(article)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditArticle(article)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteArticle(article)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết nào'}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Xác nhận xóa bài viết"
        message={`Bạn có chắc chắn muốn xóa bài viết "${confirmDialog.article?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa bài viết"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ open: false })}
      />

      {/* Article Modal */}
      <ArticleModal
        isOpen={articleModal.open}
        onClose={() => setArticleModal({ open: false })}
        article={articleModal.article}
        onSuccess={handleArticleModalSuccess}
      />

      {/* View Article Modal */}
      {viewModal.open && viewModal.article && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-zinc-800">Xem bài viết</h3>
              <button
                onClick={() => setViewModal({ open: false })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-zinc-800 mb-4">{viewModal.article.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>Tác giả: {viewModal.article.adminName || 'Admin'}</span>
                <span>•</span>
                <span>{viewModal.article.publishedAt ? new Date(viewModal.article.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded ${viewModal.article.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {viewModal.article.active ? 'Đã xuất bản' : 'Nháp'}
                </span>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {viewModal.article.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;

export async function loadData() {
  try {
    const result = await ArticleApi.getAll({ size: 100 }); // Get more articles for admin view
    return result.content || result;
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}
