# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for image uploads in the Mountain Run application.

## Overview

Cloudinary is used for:
- Uploading GPS proof screenshots
- Storing event images
- Managing user profile pictures
- CDN delivery for optimized images

## Architecture

```
Frontend → Backend API → Cloudinary
```

- **Frontend**: Selects files and sends to backend API
- **Backend**: Handles Cloudinary SDK and secure uploads
- **Cloudinary**: Stores and delivers images via CDN

## Setup Steps

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Navigate to Dashboard → Settings → API Security

### 2. Get Cloudinary Credentials

From your Cloudinary Dashboard, copy:
- **Cloud Name** (e.g., `your-cloud-name`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Configure Environment Variables

Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Important**: Never commit `.env` file to git. Use `.env.example` as reference.

### 4. Backend Setup

The backend Cloudinary setup is already complete:

- **Package**: `cloudinary` installed in backend
- **Config**: `backend/src/config/cloudinary.ts`
- **Service**: `backend/src/services/cloudinary.service.ts`
- **Utility**: `backend/src/utils/cloudinary.ts`
- **API**: `/upload/image` endpoint (POST)

### 5. Frontend Setup

The frontend utility is already created:

- **Utility**: `frontend/src/lib/cloudinary.ts`
- **Functions**:
  - `uploadImage(file, folder?)` - Upload image via backend
  - `getUploadConfig()` - Get upload configuration
  - `fileToDataUrl(file)` - Convert file to data URL
  - `validateImageFile(file)` - Validate image file

## Usage Examples

### Backend Usage

```typescript
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../services/cloudinary.service.js';

// Upload image
const result = await uploadImageToCloudinary(
  'data:image/jpeg;base64,...',
  'mountainrun/proofs'
);
console.log(result.secure_url); // Cloudinary URL

// Delete image
await deleteImageFromCloudinary('mountainrun/proofs/abc123');
```

### Frontend Usage

```typescript
import { uploadImage, fileToDataUrl, validateImageFile } from '@/lib/cloudinary';

// Handle file upload
async function handleFileUpload(file: File) {
  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Convert to data URL
  const dataUrl = await fileToDataUrl(file);

  // Upload via backend
  const result = await uploadImage(dataUrl, 'mountainrun/proofs');
  console.log(result.url); // Cloudinary URL
}
```

## API Endpoints

### POST /upload/image

Upload an image to Cloudinary.

**Request Body:**
```json
{
  "file": "data:image/jpeg;base64,...",
  "folder": "mountainrun/proofs" // optional
}
```

**Response:**
```json
{
  "data": {
    "url": "https://res.cloudinary.com/...",
    "provider": "cloudinary",
    "bytes": 123456
  }
}
```

### GET /upload/config

Get upload configuration.

**Response:**
```json
{
  "data": {
    "cloudinary": true,
    "maxDataUrlChars": 1800000,
    "accepted": ["image/jpeg", "image/png", "image/webp", "image/heic"]
  }
}
```

## Features

### Upload Options

- **Folder organization**: Images stored in folders (e.g., `mountainrun/proofs`)
- **Auto resource type**: Detects image/video/raw automatically
- **Secure URLs**: HTTPS by default
- **Size limits**: ~1.3MB for data URLs (configurable)

### Image Transformations

Cloudinary supports on-the-fly transformations:

```typescript
// Resize image
const resizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_500,h_500,c_fit/${publicId}`;

// Quality optimization
const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto/${publicId}`;
```

## Security

- API keys stored in backend environment variables only
- Signed uploads prevent unauthorized access
- CORS configured for allowed origins
- Clerk authentication required for uploads

## Troubleshooting

### Upload fails with "Cloudinary is not configured"

**Solution**: Check that all three environment variables are set in `backend/.env`:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Image too large error

**Solution**: Compress image before upload or use a public URL instead of data URL.

### CORS errors

**Solution**: Ensure your frontend URL is in `FRONTEND_URL` environment variable.

## Production Checklist

- [ ] Set Cloudinary credentials in production environment
- [ ] Configure upload folders for different use cases
- [ ] Set up transformation presets for optimization
- [ ] Enable CDN caching
- [ ] Monitor Cloudinary usage and limits
- [ ] Set up backup strategy for important images

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
