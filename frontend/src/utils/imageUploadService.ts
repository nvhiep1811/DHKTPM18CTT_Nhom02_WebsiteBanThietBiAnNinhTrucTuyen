import { toast } from "react-toastify";
import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

interface UploadOptions {
  bucket?: string;
  folder?: string;
}

class ImageUploadService {
  private defaultBucket = "products";

  async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      const bucket = options.bucket ?? this.defaultBucket;
      const folder = options.folder ?? "";

      const fileExt = file.name.split(".").pop();
      const fileName = folder
        ? `${folder}/${uuidv4()}.${fileExt}`
        : `${uuidv4()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw new Error(`Upload failed: ${error.message}`);

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        bucket,
      };
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  }

  async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteImage(pathOrUrl: string, bucket?: string): Promise<void> {
    try {
      const resolvedBucket =
        bucket ?? this.extractBucketFromUrl(pathOrUrl) ?? this.defaultBucket;
      const resolvedPath = this.getPathFromUrl(pathOrUrl);

      const { error } = await supabase.storage
        .from(resolvedBucket)
        .remove([resolvedPath]);

      if (error) toast.error(`Delete failed: ${error.message}`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async deleteMultipleImages(
    pathsOrUrls: string[],
    bucket?: string
  ): Promise<void> {
    const deletePromises = pathsOrUrls.map((path) =>
      this.deleteImage(path, bucket)
    );
    await Promise.all(deletePromises);
  }

  private validateFile(file: File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
    }
  }

  getPathFromUrl(urlOrPath: string): string {
    if (!urlOrPath.startsWith("http")) return urlOrPath;
    try {
      const url = new URL(urlOrPath);
      const parts = url.pathname.split("/object/public/");
      return parts.length > 1 ? parts[1].split("/").slice(1).join("/") : "";
    } catch {
      return "";
    }
  }

  private extractBucketFromUrl(url: string): string | null {
    try {
      const match = url.match(/\/object\/public\/([^/]+)\//);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}

export const imageUploadService = new ImageUploadService();
