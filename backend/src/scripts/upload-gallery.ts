import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import path from 'path';

// Load env vars
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(process.cwd(), 'backend/.env') });

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  const filePath = 'C:\\Users\\91991\\.gemini\\antigravity-ide\\brain\\1c6654a3-20d6-4a90-9f9b-1f7c8e2b5556\\.user_uploaded\\media_1787908966958.jpg';

  console.log('Uploading to Cloudinary...');
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'mountainrun/gallery',
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1080, crop: 'limit' } // Optimization
    ]
  });

  console.log('Uploaded! URL:', result.secure_url);

  console.log('Creating SiteMedia record...');
  const media = await prisma.siteMedia.create({
    data: {
      title: 'Sports Day Celebration Medal',
      imageUrl: result.secure_url,
      category: 'Rewards',
      location: 'India',
      eventLabel: 'National Sports Day Run',
      dateLabel: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      published: true,
      showInGallery: true,
      showOnHomeMoments: true,
    },
  });

  console.log('Done! Media ID:', media.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
