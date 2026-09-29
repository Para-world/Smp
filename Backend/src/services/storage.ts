export interface StorageProvider {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class LocalStorageProvider implements StorageProvider {
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    const path = require('path');
    const fs = require('fs');

    // Path traversal prevention: clean the folder name
    const cleanFolder = path.basename(folder).replace(/[^a-zA-Z0-9_-]/g, '');
    const uploadsDir = path.join(process.cwd(), 'public', cleanFolder);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Extension validation (don't trust client MIME alone)
    const originalExt = path.extname(file.originalname).toLowerCase();
    const safeExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];
    
    if (!safeExts.includes(originalExt)) {
      throw new Error(`File extension ${originalExt} is not allowed for security reasons.`);
    }

    // Generate safe filename
    const safeOriginalName = path.basename(file.originalname, originalExt).replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${file.fieldname}-${safeOriginalName}-${uniqueSuffix}${originalExt}`;
    
    const filePath = path.join(uploadsDir, filename);

    // Final path traversal check
    if (!filePath.startsWith(uploadsDir)) {
      throw new Error("Path traversal detected.");
    }

    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
      fs.renameSync(file.path, filePath);
    }

    return `/${cleanFolder}/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');

    try {
      // Basic protection against directory traversal in deletion
      const cleanPath = path.normalize(fileUrl).replace(/^(\.\.[\/\\])+/, '');
      const relativePath = cleanPath.replace(/^\//, ''); // remove leading slash
      const filePath = path.join(process.cwd(), 'public', relativePath);
      
      const publicDir = path.join(process.cwd(), 'public');
      if (!filePath.startsWith(publicDir)) {
         return false; // Prevent deleting outside public dir
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Local Storage Delete Error:', error);
      return false;
    }
  }
}

// In the future, you can implement:
// export class CloudinaryStorageProvider implements StorageProvider { ... }
// export class S3StorageProvider implements StorageProvider { ... }

export class StorageService {
  private provider: StorageProvider;

  constructor(provider: StorageProvider) {
    this.provider = provider;
  }

  async upload(file: Express.Multer.File, folder?: string): Promise<string> {
    return this.provider.uploadFile(file, folder);
  }

  async delete(fileUrl: string): Promise<boolean> {
    return this.provider.deleteFile(fileUrl);
  }
}

// Default export uses Local Storage for now.
// To switch providers, just change the instantiation here based on process.env.STORAGE_PROVIDER
export const storage = new StorageService(new LocalStorageProvider());
