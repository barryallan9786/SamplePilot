import React, { useState } from 'react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('barryallan9786@gmail.com');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSubject('');
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E5]">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#2B2B2B] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E8442C]">support_agent</span>
            Contact Fieldwork Support
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">check</span>
            </div>
            <h4 className="font-bold text-base text-[#2B2B2B]">Inquiry Submitted</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Our fieldwork operations team will review your inquiry and respond within 2 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="calc-input text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sampling Feasibility Inquiry for Low IR B2B Panel"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="calc-input text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                Message & Details *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe project details, target audience, or calculation questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="calc-input text-sm font-medium resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E8442C] text-white font-bold text-xs hover:bg-[#C93A24] shadow-sm"
              >
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
