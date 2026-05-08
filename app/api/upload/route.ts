import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { uploadMultipleImages } from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DATA_IMAGE_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

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

    if (!hasCloudinaryConfig()) {
      return NextResponse.json(
        { error: "Image storage is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const results = await uploadMultipleImages(
      images,
      `quick-sales-hub/listings/${payload.userId}`
    );

    return NextResponse.json({
      urls: results.map((r) => r.url),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
