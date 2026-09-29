export interface StorageProvider {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

export class LocalStorageProvider implements StorageProvider {
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    // In a real local storage, we would move the file from a temp path to the public folder
    // For this abstraction, we assume multer has already saved it to the destination
    // and we just return the URL path.
    // If multer is using memory storage, we would write it to fs here.
    const path = require('path');
    const fs = require('fs');

    const uploadsDir = path.join(process.cwd(), 'public', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    const filePath = path.join(uploadsDir, filename);

    if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
      fs.renameSync(file.path, filePath);
    }

    return `/${folder}/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');

    try {
      const relativePath = fileUrl.replace(/^\//, ''); // remove leading slash
      const filePath = path.join(process.cwd(), 'public', relativePath);
      
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
