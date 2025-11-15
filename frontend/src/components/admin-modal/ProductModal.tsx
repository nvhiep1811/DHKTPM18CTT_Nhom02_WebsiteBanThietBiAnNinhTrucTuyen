import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Save, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { productApi, categoryApi, brandApi, InventoryApi } from '../../utils/api';
import { imageUploadService } from '../../utils/imageUploadService';
import type { ProductDetail, CategorySummary, Brand } from '../../types/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductDetail;
  onSuccess: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    listedPrice: 0,
    price: 0,
    categoryId: '',
    brandId: '',
    shortDesc: '',
    longDesc: '',
    active: true,
    features: [] as string[],
    specifications: {} as Record<string, string>,
    availableStock: 0,
    rating: 0,
    reviewCount: 0,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]); // URLs to delete from storage

  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!product;

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadBrands();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        listedPrice: product.listedPrice || 0,
        price: product.price || 0,
        categoryId: product.category?.id?.toString() || '',
        brandId: product.brand?.id?.toString() || '',
        shortDesc: product.shortDesc || '',
        longDesc: product.longDesc || '',
        active: product.active ?? true,
        features: product.features || [],
        specifications: product.specifications || {},
        availableStock: product.availableStock || 0,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
      });
      setThumbnailPreview(product.thumbnailUrl || null);
      setExistingMediaUrls(product.mediaAssets?.map(m => m.url || '') || []);
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Không thể tải danh sách danh mục');
      setCategories([]);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandApi.getAll({ page: 0, size: 100 });
      setBrands(Array.isArray(response.content) ? response.content : []);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Không thể tải danh sách thương hiệu');
      setBrands([]);
    }
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!validateImageFile(file)) return;
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, thumbnail: '' }));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    // const totalMedia = existingMediaUrls.length + mediaPreviews.length + files.length;

    // if (totalMedia > 10) {
    //   setErrors({ media: 'Tối đa 10 ảnh' });
    //   return;
    // }    

    const validFiles = files.filter(validateImageFile);
    setMediaFiles((prev) => [...prev, ...validFiles]);
    setMediaPreviews((prev) => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    setErrors((prev) => ({ ...prev, media: '' }));
  };

  const validateImageFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      setErrors({ file: 'Kích thước file phải nhỏ hơn 5MB' });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrors({ file: 'Chỉ chấp nhận file JPEG, PNG, WebP' });
      return false;
    }

    return true;
  };

  const removeMediaPreview = (index: number) => {
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    const urlToRemove = existingMediaUrls[index];
    setExistingMediaUrls((prev) => prev.filter((_, i) => i !== index));
    // Track URL for deletion after save
    if (urlToRemove) {
      setMediaToDelete((prev) => [...prev, urlToRemove]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    let uploadedThumbnail = product?.thumbnailUrl || null;
    let uploadedMediaUrls: string[] = [...existingMediaUrls];
    const oldThumbnailUrl = product?.thumbnailUrl || null;

    try {
      // Upload thumbnail
      if (thumbnailFile) {
        const result = await imageUploadService.uploadImage(thumbnailFile, {
          bucket: 'products',
          folder: 'thumbnails'
        });
        uploadedThumbnail = result.url;
      }

      // Upload media assets
      if (mediaFiles.length > 0) {
        const mediaUploads = await Promise.all(
          mediaFiles.map(file =>
            imageUploadService.uploadImage(file, {
              bucket: 'products',
              folder: 'media'
            })
          )
        );
        uploadedMediaUrls = [...uploadedMediaUrls, ...mediaUploads.map(u => u.url)];
      }

      const productData: any = {
        ...(isEditing && { id: product.id }),
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        listedPrice: formData.listedPrice,
        price: formData.price,
        category: { id: parseInt(formData.categoryId) }, 
        brand: formData.brandId ? { id: parseInt(formData.brandId) } : null, 
        shortDesc: formData.shortDesc.trim(),
        longDesc: formData.longDesc.trim(),
        active: formData.active,
        thumbnailUrl: uploadedThumbnail,
        mediaAssets: uploadedMediaUrls.map(url => ({ url, altText: formData.name })),
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: formData.specifications,
        rating: formData.rating,
        reviewCount: formData.reviewCount,
        reviews: product?.reviews || [],
        ...(isEditing && {
          createdAt: product.createdAt,
          updatedAt: new Date().toISOString(),
          deletedAt: product.deletedAt,
        }),
      }

      let savedProduct: any;
      if (isEditing) {
        savedProduct = await productApi.update(product.id, productData);
        if (formData.availableStock !== product.availableStock) {
          const stockChange = formData.availableStock - (product.availableStock || 0);
          try {
            await InventoryApi.updateStock(product.id, stockChange);
          } catch (invError: any) {
            console.error('Error updating inventory:', invError);
            if (invError.response?.status === 404) {
              try {
                await InventoryApi.create({
                  productId: product.id,
                  onHand: formData.availableStock,
                  reserved: 0
                });
              } catch (createError) {
                console.error('Error creating inventory:', createError);
              }
            }
          }
        }
      } else {
        savedProduct = await productApi.create(productData);
        if (formData.availableStock > 0 && savedProduct?.id) {
          try {
            await InventoryApi.create({
              productId: savedProduct.id,
              onHand: formData.availableStock,
              reserved: 0
            });
          } catch (invError) {
            console.error('Error creating inventory:', invError);
          }
        }
      }

      // Delete old thumbnail if replaced
      if (thumbnailFile && oldThumbnailUrl && oldThumbnailUrl !== uploadedThumbnail) {
        try {
          await imageUploadService.deleteImage(oldThumbnailUrl);
        } catch (err) {
          console.error('Error deleting old thumbnail:', err);
        }
      }

      // Delete removed media assets
      for (const urlToDelete of mediaToDelete) {
        try {
          await imageUploadService.deleteImage(urlToDelete);
        } catch (err) {
          console.error('Error deleting media asset:', err);
        }
      }

      toast.success(isEditing ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Rollback uploaded images on error
      if (!isEditing) {
        if (uploadedThumbnail && thumbnailFile) {
          try {
            await imageUploadService.deleteImage(uploadedThumbnail);
          } catch (err) {
            console.error('Error deleting thumbnail on rollback:', err);
          }
        }
        
        for (const url of uploadedMediaUrls.filter(u => !existingMediaUrls.includes(u))) {
          try {
            await imageUploadService.deleteImage(url);
          } catch (err) {
            console.error('Error deleting media on rollback:', err);
          }
        }
      }

      setErrors({ submit: error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm' });
    } finally {
      setIsLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      listedPrice: 0,
      price: 0,
      categoryId: '',
      brandId: '',
      shortDesc: '',
      longDesc: '',
      active: true,
      features: [],
      specifications: {},
      availableStock: 0,
      rating: 0,
      reviewCount: 0,
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setMediaFiles([]);
    setMediaPreviews([]);
    setExistingMediaUrls([]);
    setMediaToDelete([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-zinc-800">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá niêm yết (₫)
              </label>
              <input
                type="number"
                value={formData.listedPrice}
                onChange={(e) => setFormData({ ...formData, listedPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán (₫) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng tồn kho
            </label>
            <input
              type="number"
              value={formData.availableStock}
              onChange={(e) => setFormData({ ...formData, availableStock: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
              min="0"
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả ngắn
            </label>
            <textarea
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.longDesc}
              onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              {thumbnailPreview ? (
                <div className="relative">
                  <img src={thumbnailPreview} alt="Thumbnail" className="w-24 h-24 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                    title="Xóa ảnh"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn ảnh</span>
                </button>
              )}
              {thumbnailPreview && (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4" />
                  <span>Đổi ảnh</span>
                </button>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </div>
            {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
          </div>

          {/* Media Assets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh sản phẩm (tối đa 10 ảnh)
            </label>
            <div className="grid grid-cols-5 gap-4 mb-4">
              {existingMediaUrls.map((url, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img src={url} alt={`Media ${index}`} className="w-full h-24 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeExistingMedia(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {mediaPreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <img src={preview} alt={`New ${index}`} className="w-full h-24 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeMediaPreview(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(existingMediaUrls.length + mediaPreviews.length) < 10 && (
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                </button>
              )}
            </div>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleMediaSelect}
              className="hidden"
            />
            {errors.media && <p className="text-red-500 text-sm mt-1">{errors.media}</p>}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              disabled={isLoading}
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Kích hoạt sản phẩm
            </label>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Cập nhật' : 'Thêm mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
