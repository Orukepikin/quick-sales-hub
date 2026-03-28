"use client";

import { useState } from "react";
import { X, MapPin, Eye, Star, Camera, Phone, ChevronLeft, ChevronRight, Shield, Clock } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";

interface ListingDetailProps {
  listing: any;
  onClose: () => void;
  onChat: () => void;
}

export default function ListingDetail({ listing, onClose, onChat }: ListingDetailProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;

  const whatsappNumber = listing.sellerPhone?.replace(/[^0-9]/g, "") || "2348000000000";
  const whatsappMessage = encodeURIComponent(
    `Hi, I saw your listing on Quick Sales Hub and I'm interested:\n\n*${listing.title}*\nPrice: ${formatPrice(listing.price)}\n\nIs this still available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const nextImage = () => setCurrentImage(prev => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage(prev => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-3 sm:p-5 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-[720px] w-full max-h-[92vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="sticky top-0 float-right m-3 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center z-10 hover:bg-gray-200 transition-colors">
          <X size={18} />
        </button>

        {/* Image Gallery */}
        <div className="w-full h-[280px] sm:h-[350px] bg-gray-100 relative overflow-hidden">
          {hasImages ? (
            <>
              <img src={images[currentImage]} alt={listing.title} className="w-full h-full object-cover" />
              
              {/* Image counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs font-medium rounded-full">
                {currentImage + 1} / {images.length}
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: string, i: number) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? "bg-white w-4" : "bg-white/50"}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-blue-bg">
              <div className="text-center text-gray-400">
                <Camera size={48} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No photos uploaded</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail row below main image */}
        {images.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto hide-scrollbar">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => setCurrentImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  i === currentImage ? "border-brand-blue" : "border-transparent opacity-60 hover:opacity-100"
                }`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 sm:p-6">
          {/* Title and price */}
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">{listing.title}</h2>
          <div className="font-display text-[26px] sm:text-[28px] font-extrabold text-brand-blue mb-4">{formatPrice(listing.price)}</div>

          {/* Meta */}
          <div className="flex gap-3 flex-wrap mb-5 text-sm text-gray-500">
            <div className="flex items-center gap-1.5"><MapPin size={14} /> {listing.loc}</div>
            <div className="flex items-center gap-1.5"><Eye size={14} /> {listing.views || 0} views</div>
            {listing.rating && listing.rating !== "0.0" && (
              <div className="flex items-center gap-1.5"><Star size={14} fill="#FFB800" className="text-brand-yellow" /> {listing.rating}</div>
            )}
            <div className="flex items-center gap-1.5"><Clock size={14} /> {timeAgo(listing.createdAt)}</div>
            {hasImages && <div className="flex items-center gap-1.5"><Camera size={14} /> {images.length} photos</div>}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-display font-bold text-sm text-gray-900 mb-2">Description</h3>
            <div className="text-[14px] leading-relaxed text-gray-700 p-4 bg-gray-50 rounded-xl whitespace-pre-line">{listing.desc}</div>
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-3.5 p-4 bg-gray-50 rounded-xl mb-5">
            <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {listing.seller?.[0] || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[15px] flex items-center gap-1.5">
                {listing.seller || "Seller"}
                {listing.verified && <Shield size={14} className="text-brand-blue" />}
              </h4>
              <p className="text-[13px] text-gray-500">{listing.verified ? "Verified Seller" : "New Seller"} • {listing.loc}</p>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shrink-0 hover:bg-[#1da851] transition-colors" title="WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex gap-3">
              <button onClick={onChat} className="flex-1 py-3.5 bg-brand-blue text-white rounded-xl font-display font-bold text-[15px] transition-all hover:bg-brand-blue-dark">
                Chat with Seller
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-[#25D366] text-white rounded-xl font-display font-bold text-[15px] transition-all hover:bg-[#1da851] flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
            <a href={`tel:${listing.sellerPhone || "+2348000000000"}`}
              className="w-full py-3.5 bg-brand-yellow text-gray-900 rounded-xl font-display font-bold text-[15px] transition-all hover:bg-brand-yellow-dark flex items-center justify-center gap-2">
              <Phone size={18} /> Call Seller
            </a>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 pt-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-gray-900">Reviews</h3>
              <button onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-sm text-brand-blue font-medium hover:underline">
                {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            </div>

            {showReviewForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)}
                      className="transition-transform hover:scale-110">
                      <Star size={24} fill={s <= reviewRating ? "#FFB800" : "none"} 
                        className={s <= reviewRating ? "text-brand-yellow" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience with this seller..."
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-brand-blue resize-none h-20 mb-3" />
                <button onClick={() => {
                  if (reviewRating === 0) return;
                  setShowReviewForm(false);
                  setReviewRating(0);
                  setReviewText("");
                  // In production, save to database
                  alert("Review submitted! Thank you for your feedback.");
                }} className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-display font-bold hover:bg-brand-blue-dark transition-all">
                  Submit Review
                </button>
              </div>
            )}

            {/* Sample reviews */}
            <div className="flex flex-col gap-3">
              {listing.verified && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 shrink-0">A</div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">Adaeze N.</span>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} fill="#FFB800" className="text-brand-yellow" />)}</div>
                    </div>
                    <p className="text-xs text-gray-600">Seller was very responsive and item was exactly as described. Highly recommend!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Safety tip */}
          <div className="p-3 bg-brand-yellow-bg rounded-xl flex gap-2">
            <Shield size={16} className="text-yellow-700 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Safety tip:</strong> Meet in a public place for transactions. Use in-app escrow payment for online purchases. Never send money before receiving your item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
