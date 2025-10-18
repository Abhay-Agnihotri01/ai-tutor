# Cloudinary Setup Guide

This project now uses Cloudinary for video and file storage instead of local storage.

## Setup Steps

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your Dashboard

### 2. Get API Credentials
From your Cloudinary Dashboard, copy:
- Cloud Name
- API Key  
- API Secret

### 3. Update Environment Variables
In your `backend/.env` file, add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Folder Structure
Cloudinary will automatically create these folders:
- `lms-videos/` - For video uploads
- `lms-resources/` - For document/resource uploads

## Features Enabled

### Video Features
- ✅ Automatic thumbnail generation
- ✅ Multiple quality versions
- ✅ Adaptive streaming
- ✅ Global CDN delivery
- ✅ Secure URLs
- ✅ Video transformations

### Resource Features  
- ✅ Document storage (PDF, DOC, etc.)
- ✅ Secure download links
- ✅ File size optimization

## Benefits Over Local Storage

1. **Scalability** - No server storage limits
2. **Performance** - Global CDN delivery
3. **Security** - Signed URLs and access control
4. **Reliability** - 99.9% uptime guarantee
5. **Automatic Optimization** - Image/video compression
6. **Thumbnails** - Auto-generated video thumbnails

## Migration Notes

- Old local file URLs are no longer served
- All new uploads go to Cloudinary
- Video thumbnails are automatically generated
- Files are globally accessible via CDN

## Troubleshooting

If uploads fail:
1. Check your Cloudinary credentials in `.env`
2. Verify your Cloudinary account is active
3. Check upload limits on your plan
4. Ensure file formats are supported

## Free Plan Limits

Cloudinary free plan includes:
- 25GB storage
- 25GB monthly bandwidth
- 1000 transformations/month

For production, consider upgrading to a paid plan.