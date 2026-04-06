import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  private createUploadPath(subPath: string): string {
    const uploadPath = join(__dirname, '../../../../frontend/public/images', subPath);
    if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
    return uploadPath;
  }
  private validateImageFile(req: any, file: Express.Multer.File, cb: any): void {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) { return cb(new BadRequestException('Only image files are allowed'), false); }
    cb(null, true);
  }
  uploadLogo(file: Express.Multer.File): { logoUrl: string } {
    if (!file) throw new BadRequestException('No file uploaded');
    return { logoUrl: `/images/logos/${file.filename}` };
  }
  uploadCategory(file: Express.Multer.File): { imageUrl: string } {
    if (!file) throw new BadRequestException('No file uploaded');
    return { imageUrl: `images/categories/${file.filename}` };
  }
  uploadFile(file: Express.Multer.File): { url: string } {
    if (!file) throw new BadRequestException('No file uploaded');
    const mimeType = file.mimetype;
    let basePath = '';
    if (mimeType.startsWith('image')) { basePath = `/images/media/items/${file.filename}`; }
    else if (mimeType.startsWith('video')) { basePath = `/videos/items/${file.filename}`; }
    else { basePath = `/documents/items/${file.filename}`; }
    return { url: basePath };
  }
  uploadUserAvatar(file: Express.Multer.File): { url: string } {
    if (!file) throw new BadRequestException('No file uploaded');
    return { url: `/images/users/${file.filename}` };
  }
  uploadProviderLogo(file: Express.Multer.File): { url: string } {
    if (!file) throw new BadRequestException('No file uploaded');
    return { url: `/images/providers/${file.filename}` };
  }
  uploadBlogImage(file: Express.Multer.File): { url: string } {
    if (!file) throw new BadRequestException('No file uploaded');
    const mimeType = file.mimetype;
    let basePath = `/images/blogs/${file.filename}`;
    if (mimeType.startsWith('video')) {basePath = `/videos/blogs/${file.filename}`;}
    return { url: basePath };
  }
}
export const logoMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(__dirname, '../../../../frontend/public/images/logos');
      if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const { companyId, companyName } = req.body;
      const ext = extname(file.originalname);
      const filename = `${companyId}-${companyName.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) { return cb(new BadRequestException('Only image files are allowed'), false); }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};
export const categoryMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        const uploadPath = join(__dirname, '../../../../frontend/public/images/categories');
        if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
        cb(null, uploadPath);
      } catch (error) { cb(error, ''); }
    },
    filename: (req, file, cb) => {
      try {
        const { categoryId, categoryTitle } = req.body;
        const ext = extname(file.originalname);
        const timestamp = Date.now();
        const sanitizedTitle = categoryTitle ? categoryTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-') : 'untitled';
        const filename = `${categoryId}-${sanitizedTitle}-${timestamp}${ext}`;
        cb(null, filename);
      } catch (error) { cb(error, ''); }
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) { return cb(new BadRequestException('Only image files are allowed'), false); }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};
export const fileMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        let uploadPath;
        const mimeType = file.mimetype;
        if (mimeType.startsWith('image')) {
          if (file.fieldname === 'hero_image' || file.fieldname === 'cover_image') { uploadPath = join(__dirname, '../../../../frontend/public/images/items'); }
          else { uploadPath = join(__dirname, '../../../../frontend/public/images/media/items'); }
        }
        else if (mimeType.startsWith('video')) { uploadPath = join(__dirname, '../../../../frontend/public/videos/items'); }
        else { uploadPath = join(__dirname, '../../../../frontend/public/documents/items'); }
        if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
        cb(null, uploadPath);
      } catch (error) { cb(error, ''); }
    },
    filename: (req, file, cb) => {
      try {
        const ext = extname(file.originalname);
        const timestamp = Date.now();
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `${sanitizedOriginalName}_${timestamp}${ext}`;
        cb(null, filename);
      } catch (error) { cb(error, ''); }
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/mpeg', 'application/pdf', 'application/msword', 'text/plain'];
    if (!allowedMimeTypes.includes(file.mimetype)) { return cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false); }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 },
};
export const userAvatarMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        const uploadPath = join(__dirname, '../../../../frontend/public/images/users');
        if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
        cb(null, uploadPath);
      } catch (error) { cb(error, ''); }
    },
    filename: (req, file, cb) => {
      try {
        const ext = extname(file.originalname);
        const timestamp = Date.now();
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `avatar_${timestamp}_${sanitizedOriginalName}${ext}`;
        cb(null, filename);
      } catch (error) { cb(error, ''); }
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) { return cb(new BadRequestException('Only image files are allowed'), false); }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
};
export const blogImageMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        const mimeType = file.mimetype;
        let uploadPath: string;
        if (mimeType.startsWith('image')) {uploadPath = join(__dirname, '../../../../frontend/public/images/blogs');}
        else if (mimeType.startsWith('video')) {uploadPath = join(__dirname, '../../../../frontend/public/videos/blogs');}
        else {
          cb(new BadRequestException('Only image and video files are allowed') as any, '');
          return;
        }
        if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
        cb(null, uploadPath);
      } catch (error) { cb(error, ''); }
    },
    filename: (req, file, cb) => {
      try {
        const ext = extname(file.originalname);
        const timestamp = Date.now();
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `blogmedia${timestamp}_${sanitizedOriginalName}${ext}`;
        cb(null, filename);
      } catch (error) { cb(error, ''); }
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/mpeg'];
    if (!allowedMimeTypes.includes(file.mimetype)) { return cb(new BadRequestException(`File type ${file.mimetype} is not allowed. Only image and video files are allowed.`), false); }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 },
};
export const providerLogoMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      try {
        const uploadPath = join(__dirname, '../../../../frontend/public/images/providers');
        if (!existsSync(uploadPath)) { mkdirSync(uploadPath, { recursive: true }); }
        cb(null, uploadPath);
      } catch (error) { cb(error, ''); }
    },
    filename: (req, file, cb) => {
      try {
        const ext = extname(file.originalname);
        const timestamp = Date.now();
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `logo_${timestamp}_${sanitizedOriginalName}${ext}`;
        cb(null, filename);
      } catch (error) { cb(error, ''); }
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) { return cb(new BadRequestException('Only image files are allowed'), false); }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
};