import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, ChevronRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

type LoginMethod = 'phone' | 'email' | 'whatsapp' | null;

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [method, setMethod] = useState<LoginMethod>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setOtpMode(true);
      setInputValue('');
    }, 1500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length < 4) return;
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1200);
  };

  const renderMethodIcon = () => {
    switch (method) {
      case 'phone': return <Phone className="text-blue-600 dark:text-[#39FF14]" size={24} />;
      case 'email': return <Mail className="text-blue-600 dark:text-[#39FF14]" size={24} />;
      case 'whatsapp': return <MessageCircle className="text-emerald-600 dark:text-[#39FF14]" size={24} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-6 shadow-2xl">
            <Sparkles className="text-blue-600 dark:text-[#39FF14]" size={32} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            Fin<span className="text-blue-600 dark:text-[#39FF14]">Track</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Secure Your Financial Future</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl dark:shadow-black/50">
          {!method ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Choose Login Method</h2>
              
              <LoginButton 
                icon={<Phone size={20} />} 
                label="Phone Number" 
                onClick={() => setMethod('phone')} 
                color="hover:border-blue-500/50"
              />
              <LoginButton 
                icon={<Mail size={20} />} 
                label="Email Address" 
                onClick={() => setMethod('email')} 
                color="hover:border-blue-500/50 dark:hover:border-[#39FF14]/50"
              />
              <LoginButton 
                icon={<MessageCircle size={20} />} 
                label="WhatsApp" 
                onClick={() => setMethod('whatsapp')} 
                color="hover:border-emerald-500/50"
              />

              <div className="pt-6 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <ShieldCheck size={14} /> 256-bit AES Encryption
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <button 
                onClick={() => { setMethod(null); setOtpMode(false); setInputValue(''); }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                ← Back to methods
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#39FF14]/30 rounded-xl flex items-center justify-center">
                  {renderMethodIcon()}
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold capitalize">
                    {otpMode ? 'Verify Identity' : `Login via ${method}`}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {otpMode ? 'Check your notifications for the code' : `Enter your ${method} details below`}
                  </p>
                </div>
              </div>

              <form onSubmit={otpMode ? handleOtpSubmit : handleInitialSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                    {otpMode ? 'OTP Code' : method === 'email' ? 'Email' : 'Number'}
                  </label>
                  <input
                    autoFocus
                    required
                    type={method === 'email' && !otpMode ? 'email' : 'text'}
                    placeholder={otpMode ? '0 0 0 0' : method === 'email' ? 'you@example.com' : '+91 00000 00000'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#39FF14]/50 focus:border-blue-300 dark:focus:border-[#39FF14]/30 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-tight"
                  />
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black py-4 rounded-2xl hover:bg-slate-800 dark:hover:bg-[#39FF14] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {otpMode ? 'Confirm Access' : 'Send Code'}
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-slate-400 dark:text-slate-500 text-[10px] font-medium max-w-[280px] mx-auto leading-relaxed uppercase tracking-widest">
          By continuing, you agree to our <span className="text-slate-600 dark:text-slate-300">Terms of Service</span> and <span className="text-slate-600 dark:text-slate-300">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

const LoginButton = ({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all group ${color} hover:shadow-lg dark:hover:shadow-black/20`}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-[#39FF14]/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-[#39FF14] transition-colors">
        {icon}
      </div>
      <span className="text-slate-600 dark:text-slate-300 font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
    </div>
    <ChevronRight size={20} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
  </button>
);

export default Login;