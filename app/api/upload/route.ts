import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { uploadMultipleImages } from "@/lib/cloudinary";

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

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await req.json(); // Array of base64 strings

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

    if (!hasCloudinaryConfig()) {
      return NextResponse.json({ urls: images });
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
