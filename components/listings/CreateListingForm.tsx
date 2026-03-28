"use client";

import { useState, useRef } from "react";
import { Camera, X, ImagePlus } from "lucide-react";
import { CATEGORIES, LOCATIONS } from "@/lib/utils";

interface CreateListingFormProps {
  onSubmit: (form: any) => void;
  onCancel: () => void;
}

export default function CreateListingForm({ onSubmit, onCancel }: CreateListingFormProps) {
  const [form, setForm] = useState({
    title: "",
    desc: "",
    price: "",
    category: "",
    location: "",
  });
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).slice(0, 10 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = () => {
    if (!form.title || !form.category || !form.price || !form.location || !form.desc) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit({ ...form, images: images.map((img) => img.preview) });
  };

  const inputClass =
    "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-brand-blue focus:ring-[3px] focus:ring-brand-blue/10 bg-white";

  const displayedCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 20);

  return (
    <div className="max-w-[640px] mx-auto">
      <h2 className="font-display text-[26px] font-bold mb-6">Post an Ad</h2>

      {/* Photos */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Photos <span className="text-gray-400 font-normal">({images.length}/10)</span>
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {/* Uploaded images */}
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group">
              <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-brand-blue text-white text-[10px] font-bold text-center py-0.5">
                  COVER
                </div>
              )}
            </div>
          ))}

          {/* Add more button */}
          {images.length < 10 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:border-brand-blue hover:bg-brand-blue-bg text-gray-400 hover:text-brand-blue"
            >
              <ImagePlus size={24} />
              <span className="text-[10px] font-medium">Add Photo</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        {images.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-brand-blue hover:bg-brand-blue-bg bg-gray-50"
          >
            <Camera size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB each. First photo will be the cover image.</p>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
        <input
          placeholder="e.g. iPhone 15 Pro Max 256GB - Brand New"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
          maxLength={120}
        />
        <p className="text-xs text-gray-400 mt-1">{form.title.length}/120 characters</p>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
        <select
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className={inputClass}
        >
          <option value="">Select a category</option>
          {displayedCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
          {!showAllCategories && (
            <option value="" disabled>── More categories below ──</option>
          )}
          {!showAllCategories && CATEGORIES.slice(20).map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₦) *</label>
        <input
          type="number"
          placeholder="e.g. 450000"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location *</label>
        <select
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          className={inputClass}
        >
          <option value="">Select your location</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
        <textarea
          placeholder="Describe your item in detail — condition, features, reason for selling, etc."
          value={form.desc}
          onChange={(e) => update("desc", e.target.value)}
          className={`${inputClass} min-h-[140px] resize-y`}
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1">{form.desc.length}/2000 characters</p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base transition-all hover:bg-brand-blue-dark mt-2"
      >
        Post Ad — It&apos;s Free!
      </button>

      <button
        onClick={onCancel}
        className="w-full py-3.5 mt-2 text-gray-500 text-sm cursor-pointer hover:text-gray-700 bg-transparent border-none"
      >
        Cancel
      </button>
    </div>
  );
}
