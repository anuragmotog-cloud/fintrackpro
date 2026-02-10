
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { X, User, Phone, Image as ImageIcon, Save, Camera, Upload } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Increased limit to 20MB
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Image too large. Please select an image under 20MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 lg:p-10 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="relative inline-block mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-4 border-[#39FF14] shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105">
              <img 
                src={formData.photoUrl || "https://picsum.photos/200"} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 bg-[#39FF14] p-2 rounded-full border-2 border-white dark:border-slate-900 shadow-lg group-hover:bg-white transition-colors">
              <Camera size={16} className="text-slate-900" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Profile Settings</h3>
          <p className="text-slate-500 text-sm font-medium">Customize your dashboard identity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-2">
              <User size={12} className="text-[#39FF14]" /> Full Name
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Johnson"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]/50 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-2">
              <Phone size={12} className="text-[#39FF14]" /> Phone Number
            </label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#39FF14]/50 transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-2">
              <ImageIcon size={12} className="text-[#39FF14]" /> Profile Photo
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-slate-500 dark:text-slate-400 hover:border-[#39FF14]/50 transition-all font-bold cursor-pointer flex items-center justify-between group"
            >
              <span className="text-sm truncate pr-4">
                {formData.photoUrl && formData.photoUrl.startsWith('data:') ? 'Local Image Selected' : 'Choose from gallery...'}
              </span>
              <Upload size={18} className="text-[#39FF14] group-hover:translate-y-[-2px] transition-transform" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-950 dark:bg-[#39FF14] text-white dark:text-slate-950 font-black py-4 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl dark:shadow-[#39FF14]/20"
          >
            <Save size={20} />
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
