"use client";

import { useState, useRef } from "react";
import { Upload, Shield, CheckCircle, AlertTriangle, Camera } from "lucide-react";

interface DriverVerificationProps {
  onVerified: () => void;
}

export default function DriverVerification({ onVerified }: DriverVerificationProps) {
  const [step, setStep] = useState<"info" | "documents" | "review">("info");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    vehicleType: "",
    plateNumber: "",
    driversLicense: null as File | null,
    vehicleInsurance: null as File | null,
    selfie: null as File | null,
  });

  const licenseRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData(prev => ({ ...prev, [field]: file }));
  };

  if (step === "info") {
    return (
      <div className="max-w-[560px] mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-orange-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Driver Verification Required</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-[400px] mx-auto">
            For the safety of our community, all delivery drivers must complete identity and vehicle verification before accepting jobs.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-display font-bold text-base mb-4">Personal Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Legal Name</label>
            <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
              placeholder="As it appears on your ID" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="+234 800 000 0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Residential Address</label>
            <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Your current address" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vehicle Type</label>
            <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue bg-white">
              <option value="">Select your vehicle type</option>
              <option value="motorcycle">Motorcycle (Okada/Bike)</option>
              <option value="keke">Tricycle (Keke)</option>
              <option value="car">Car</option>
              <option value="van">Van / Mini Bus</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vehicle Plate Number</label>
            <input value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})}
              placeholder="e.g. LAG-123-AB" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue" />
          </div>
        </div>

        <button onClick={() => {
          if (!formData.fullName || !formData.phone || !formData.vehicleType) {
            alert("Please fill in all required fields");
            return;
          }
          setStep("documents");
        }} className="w-full py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base hover:bg-brand-blue-dark transition-all">
          Continue to Document Upload
        </button>
      </div>
    );
  }

  if (step === "documents") {
    return (
      <div className="max-w-[560px] mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={32} className="text-orange-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
          <p className="text-gray-500 text-sm">Upload clear photos of the following documents for verification.</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {/* Driver's License */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-display font-bold text-sm">Driver&apos;s License</h4>
                <p className="text-xs text-gray-500">Valid Nigerian driver&apos;s license</p>
              </div>
              {formData.driversLicense && <CheckCircle size={20} className="text-green-500" />}
            </div>
            <input ref={licenseRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect("driversLicense", e)} />
            <button onClick={() => licenseRef.current?.click()}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.driversLicense ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border-2 border-dashed border-gray-300 hover:border-brand-blue hover:text-brand-blue"
              }`}>
              <Camera size={16} />
              {formData.driversLicense ? formData.driversLicense.name : "Upload Driver's License"}
            </button>
          </div>

          {/* Vehicle Insurance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-display font-bold text-sm">Vehicle Insurance</h4>
                <p className="text-xs text-gray-500">Valid vehicle insurance certificate</p>
              </div>
              {formData.vehicleInsurance && <CheckCircle size={20} className="text-green-500" />}
            </div>
            <input ref={insuranceRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect("vehicleInsurance", e)} />
            <button onClick={() => insuranceRef.current?.click()}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.vehicleInsurance ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border-2 border-dashed border-gray-300 hover:border-brand-blue hover:text-brand-blue"
              }`}>
              <Camera size={16} />
              {formData.vehicleInsurance ? formData.vehicleInsurance.name : "Upload Insurance Certificate"}
            </button>
          </div>

          {/* Selfie */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-display font-bold text-sm">Selfie with ID</h4>
                <p className="text-xs text-gray-500">A clear photo of you holding your ID</p>
              </div>
              {formData.selfie && <CheckCircle size={20} className="text-green-500" />}
            </div>
            <input ref={selfieRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect("selfie", e)} />
            <button onClick={() => selfieRef.current?.click()}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.selfie ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border-2 border-dashed border-gray-300 hover:border-brand-blue hover:text-brand-blue"
              }`}>
              <Camera size={16} />
              {formData.selfie ? formData.selfie.name : "Upload Selfie with ID"}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 leading-relaxed">
            Your documents will be reviewed within 24-48 hours. You will be notified once verification is complete. All documents are stored securely and encrypted.
          </p>
        </div>

        <button onClick={() => {
          if (!formData.driversLicense || !formData.selfie) {
            alert("Please upload at least your driver's license and selfie with ID");
            return;
          }
          setStep("review");
        }} className="w-full py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base hover:bg-brand-blue-dark transition-all">
          Submit for Verification
        </button>

        <button onClick={() => setStep("info")} className="w-full py-3 mt-2 text-gray-500 text-sm hover:text-gray-700">Back</button>
      </div>
    );
  }

  // Review/Success
  return (
    <div className="max-w-[560px] mx-auto text-center py-10">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Verification Submitted!</h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-[400px] mx-auto mb-8">
        Your documents have been submitted for review. In the meantime, you can start browsing available delivery jobs. We&apos;ll notify you once your full verification is complete.
      </p>
      <button onClick={onVerified} className="px-8 py-4 bg-brand-blue text-white rounded-xl font-display font-bold text-base hover:bg-brand-blue-dark transition-all">
        Start Accepting Jobs
      </button>
    </div>
  );
}
