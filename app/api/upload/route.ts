import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DATA_IMAGE_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "listing-images";

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your-cloud-name" &&
      process.env.CLOUDINARY_API_KEY !== "your-api-key" &&
      process.env.CLOUDINARY_API_SECRET !== "your-api-secret"
  );
}

function estimatedBase64Bytes(value: string) {
  const base64 = value.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

function dataUriToUpload(value: string, index: number) {
  const match = value.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) throw new Error("Invalid image data");

  const extension = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  return {
    bytes: Buffer.from(match[2], "base64"),
    contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
    extension,
    index,
  };
}

async function uploadToSupabaseStorage(images: string[], userId: string) {
  const { error: bucketError } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_IMAGE_BYTES}`,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
    throw bucketError;
  }

  const urls: string[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const file = dataUriToUpload(image, index);
    const path = `${userId}/${Date.now()}-${index}.${file.extension}`;
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, file.bytes, {
        contentType: file.contentType,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await req.json(); // Array of image data URIs

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    if (images.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images allowed" },
        { status: 400 }
      );
    }

    const invalidImage = images.find(
      (image) =>
        typeof image !== "string" ||
        !DATA_IMAGE_PATTERN.test(image) ||
        estimatedBase64Bytes(image) > MAX_IMAGE_BYTES
    );

    if (invalidImage) {
      return NextResponse.json(
        { error: "Upload only JPG, PNG, or WebP images up to 5MB each." },
        { status: 400 }
      );
    }

    if (hasCloudinaryConfig()) {
      const results = await uploadMultipleImages(
        images,
        `quick-sales-hub/listings/${payload.userId}`
      );

      return NextResponse.json({
        urls: results.map((r) => r.url),
      });
    }

    const urls = await uploadToSupabaseStorage(images, payload.userId);
    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
