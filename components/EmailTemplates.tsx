'use client'

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { 
  Eye, Mail, Check, X, Send, Palette, Type, Link2, 
  Share2, ChevronDown, ChevronRight, Sparkles, Save,
  TestTube, RefreshCw, MousePointer, Plus, Trash2, GripVertical, RotateCcw, Globe, AlertCircle
} from 'lucide-react';
import { useSession } from '@/context/session';
import { useToast } from '@/components/common/Toast';
import TestEmailModal from '@/components/TestEmailModal';
import { getUserFriendlyError } from '@/lib/utils';

type TemplateKey = 'signup' | 'approval' | 'rejection' | 'moreInfo' | 'resubmissionConfirmation';

type CTA = {
  id: string;
  text: string;
  url: string;
};

type FooterLink = {
  id: string;
  text: string;
  url: string;
};

type SocialLink = {
  id: string;
  name: string;
  url: string;
  iconUrl: string;
};

type Design = {
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  background?: string;
  title?: string;
  greeting?: string;
  ctas?: CTA[];
  footerNote?: string;
  footerLinks?: FooterLink[];
  socialLinks?: SocialLink[];
};
type Template = { subject: string; body: string; html?: string | null; useHtml?: boolean | null; design?: Design };
type Templates = Record<TemplateKey, Template>;

// Helper to determine if a color is light or dark for text contrast
const isLightColor = (hex: string): boolean => {
  const color = hex.replace('#', '');
  if (color.length !== 6) return false;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
};

const templateMeta: Record<TemplateKey, { label: string; icon: React.ElementType; description: string; color: string; bgColor: string }> = {
  signup: { 
    label: 'Signup Confirmation', 
    icon: Send, 
    description: 'Sent when a user submits the signup form',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500'
  },
  resubmissionConfirmation: {
    label: 'Resubmission Confirmation',
    icon: RefreshCw,
    description: 'Sent when a user successfully resubmits their signup form after corrections',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500'
  },
  approval: { 
    label: 'Approval Email', 
    icon: Check, 
    description: 'Sent when you approve a signup request',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500'
  },
  rejection: { 
    label: 'Rejection Email', 
    icon: X, 
    description: 'Sent when you reject a signup request',
    color: 'text-rose-600',
    bgColor: 'bg-rose-500'
  },
  moreInfo: {
    label: 'Resubmission Request',
    icon: RotateCcw,
    description: 'Sent when you request a user to resubmit their signup form with corrections',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500'
  }
};

// Default footer links
const defaultFooterLinks: FooterLink[] = [
  { id: 'contact', text: 'Contact Us', url: '#' },
  { id: 'privacy', text: 'Privacy Policy', url: '#' }
];

// Function to automatically detect social media platform and return SVG icon URL (for in-app use)
// Uses colorful SVG icons for better performance and scalability in the UI
const getSocialIconUrlSvg = (platformName: string, url: string): string => {
  const name = (platformName || '').toLowerCase().trim();
  const urlLower = (url || '').toLowerCase();
  
  // Use colorful SVG icons from simple-icons CDN (lightweight, scalable, colorful)
  // These are perfect for in-app display
  if (name.includes('facebook') || urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    return 'https://cdn.simpleicons.org/facebook/1877F2';
  }
  if (name.includes('twitter') || name.includes('x ') || urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'https://cdn.simpleicons.org/x/000000';
  }
  if (name.includes('instagram') || urlLower.includes('instagram.com')) {
    return 'https://cdn.simpleicons.org/instagram/E4405F';
  }
  if (name.includes('linkedin') || urlLower.includes('linkedin.com')) {
    return 'https://cdn.simpleicons.org/linkedin/0A66C2';
  }
  if (name.includes('youtube') || urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'https://cdn.simpleicons.org/youtube/FF0000';
  }
  if (name.includes('tiktok') || urlLower.includes('tiktok.com')) {
    return 'https://cdn.simpleicons.org/tiktok/000000';
  }
  if (name.includes('pinterest') || urlLower.includes('pinterest.com')) {
    return 'https://cdn.simpleicons.org/pinterest/BD081C';
  }
  if (name.includes('snapchat') || urlLower.includes('snapchat.com')) {
    return 'https://cdn.simpleicons.org/snapchat/FFFC00';
  }
  if (name.includes('reddit') || urlLower.includes('reddit.com')) {
    return 'https://cdn.simpleicons.org/reddit/FF4500';
  }
  if (name.includes('discord') || urlLower.includes('discord.com') || urlLower.includes('discord.gg')) {
    return 'https://cdn.simpleicons.org/discord/5865F2';
  }
  if (name.includes('github') || urlLower.includes('github.com')) {
    return 'https://cdn.simpleicons.org/github/181717';
  }
  if (name.includes('whatsapp') || urlLower.includes('whatsapp.com') || urlLower.includes('wa.me')) {
    return 'https://cdn.simpleicons.org/whatsapp/25D366';
  }
  if (name.includes('telegram') || urlLower.includes('telegram.org') || urlLower.includes('t.me')) {
    return 'https://cdn.simpleicons.org/telegram/26A5E4';
  }
  
  // Default: return a generic share icon if platform not recognized
  // This ensures we always have a valid icon URL, preventing broken images
  return 'https://cdn.simpleicons.org/share/2563eb';
};

// Function to automatically detect social media platform and return PNG icon URL (for email use)
// Uses colorful PNG icons for email client compatibility
const getSocialIconUrlPng = (platformName: string, url: string): string => {
  const name = (platformName || '').toLowerCase().trim();
  const urlLower = (url || '').toLowerCase();
  
  // Use colorful PNG icons from a reliable CDN (icons8 provides PNG format)
  // These are colorful, email-compatible PNG icons (24x24px for optimal email display)
  if (name.includes('facebook') || urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    return 'https://img.icons8.com/color/24/000000/facebook-new.png';
  }
  if (name.includes('twitter') || name.includes('x ') || urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'https://img.icons8.com/color/24/000000/twitter--v1.png';
  }
  if (name.includes('instagram') || urlLower.includes('instagram.com')) {
    return 'https://img.icons8.com/color/24/000000/instagram-new.png';
  }
  if (name.includes('linkedin') || urlLower.includes('linkedin.com')) {
    return 'https://img.icons8.com/color/24/000000/linkedin.png';
  }
  if (name.includes('youtube') || urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'https://img.icons8.com/color/24/000000/youtube-play.png';
  }
  if (name.includes('tiktok') || urlLower.includes('tiktok.com')) {
    return 'https://img.icons8.com/color/24/000000/tiktok--v1.png';
  }
  if (name.includes('pinterest') || urlLower.includes('pinterest.com')) {
    return 'https://img.icons8.com/color/24/000000/pinterest.png';
  }
  if (name.includes('snapchat') || urlLower.includes('snapchat.com')) {
    return 'https://img.icons8.com/color/24/000000/snapchat.png';
  }
  if (name.includes('reddit') || urlLower.includes('reddit.com')) {
    return 'https://img.icons8.com/color/24/000000/reddit.png';
  }
  if (name.includes('discord') || urlLower.includes('discord.com') || urlLower.includes('discord.gg')) {
    return 'https://img.icons8.com/color/24/000000/discord-logo.png';
  }
  if (name.includes('github') || urlLower.includes('github.com')) {
    return 'https://img.icons8.com/color/24/000000/github--v1.png';
  }
  if (name.includes('whatsapp') || urlLower.includes('whatsapp.com') || urlLower.includes('wa.me')) {
    return 'https://img.icons8.com/color/24/000000/whatsapp.png';
  }
  if (name.includes('telegram') || urlLower.includes('telegram.org') || urlLower.includes('t.me')) {
    return 'https://img.icons8.com/color/24/000000/telegram-app.png';
  }
  
  // Default: return a generic social media icon if platform not recognized
  // This ensures we always have a valid icon URL, preventing broken images
  return 'https://img.icons8.com/color/24/000000/share.png';
};

// Social platform options with placeholder URLs for dropdown
const socialPlatformOptions: Array<{ name: string; placeholder: string; iconUrl: string | null }> = [
  { name: 'Facebook', placeholder: 'https://facebook.com/yourpage', iconUrl: getSocialIconUrlSvg('Facebook', '') },
  { name: 'Twitter/X', placeholder: 'https://twitter.com/yourhandle', iconUrl: getSocialIconUrlSvg('Twitter/X', '') },
  { name: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany', iconUrl: getSocialIconUrlSvg('LinkedIn', '') },
  { name: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', iconUrl: getSocialIconUrlSvg('YouTube', '') },
  { name: 'Instagram', placeholder: 'https://instagram.com/yourhandle', iconUrl: getSocialIconUrlSvg('Instagram', '') },
  { name: 'TikTok', placeholder: 'https://tiktok.com/@yourhandle', iconUrl: getSocialIconUrlSvg('TikTok', '') },
  { name: 'Pinterest', placeholder: 'https://pinterest.com/yourprofile', iconUrl: getSocialIconUrlSvg('Pinterest', '') },
  { name: 'Snapchat', placeholder: 'https://snapchat.com/add/yourhandle', iconUrl: getSocialIconUrlSvg('Snapchat', '') },
  { name: 'Reddit', placeholder: 'https://reddit.com/user/yourhandle', iconUrl: getSocialIconUrlSvg('Reddit', '') },
  { name: 'Discord', placeholder: 'https://discord.gg/yourserver', iconUrl: getSocialIconUrlSvg('Discord', '') },
  { name: 'GitHub', placeholder: 'https://github.com/yourusername', iconUrl: getSocialIconUrlSvg('GitHub', '') },
  { name: 'WhatsApp', placeholder: 'https://wa.me/yournumber', iconUrl: getSocialIconUrlSvg('WhatsApp', '') },
  { name: 'Telegram', placeholder: 'https://t.me/yourhandle', iconUrl: getSocialIconUrlSvg('Telegram', '') },
  { name: 'Custom', placeholder: '', iconUrl: null }
];

// Default CTAs per template type
const defaultCTAs: Record<TemplateKey, CTA[]> = {
  signup: [{ id: 'view-status', text: 'Check Application Status', url: '{{action_url}}' }],
  approval: [{ id: 'login', text: 'Login to Your Account', url: '{{action_url}}' }],
  rejection: [{ id: 'contact', text: 'Contact Support', url: '{{action_url}}' }],
  moreInfo: [{ id: 'resubmit', text: 'Resubmit Form', url: '{{action_url}}' }],
  resubmissionConfirmation: [{ id: 'view-status', text: 'Check Application Status', url: '{{action_url}}' }]
};

// Default titles per template type
const defaultTitles: Record<TemplateKey, string> = {
  signup: 'Application Received Successfully',
  approval: 'Welcome Aboard! You\'re Approved',
  rejection: 'Application Status Update',
  moreInfo: 'Resubmission Required',
  resubmissionConfirmation: 'Resubmission Received - Under Review'
};

// Default branding colors per template type
const defaultBranding: Record<TemplateKey, { primaryColor: string; background: string }> = {
  signup: { primaryColor: '#2563eb', background: '#f7fafc' }, // Sky blue
  approval: { primaryColor: '#059669', background: '#ecfdf5' }, // Emerald green
  rejection: { primaryColor: '#e11d48', background: '#fff1f2' }, // Rose red
  moreInfo: { primaryColor: '#f59e0b', background: '#fffbeb' }, // Amber/Orange (action required)
  resubmissionConfirmation: { primaryColor: '#9333ea', background: '#faf5ff' } // Purple
};

// Collapsible Section Component - moved outside to prevent recreation on each render
const Section = React.memo(({ 
  id, 
  title, 
  icon: SectionIcon, 
  children,
  isExpanded,
  onToggle,
  isShared = false
}: { 
  id: string; 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  isShared?: boolean;
}) => (
  <div className={`border rounded-xl ${isShared && isExpanded ? 'overflow-visible' : 'overflow-hidden'} transition-all ${
    isShared 
      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm' 
      : 'border-slate-200 bg-white'
  }`}>
    <button
      onClick={() => onToggle(id)}
      className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 transition-all cursor-pointer touch-manipulation ${
        isShared
          ? 'bg-gradient-to-r from-emerald-50/80 to-emerald-50/40 hover:from-emerald-50 hover:to-emerald-50/60'
          : 'bg-slate-50 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isShared
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm'
            : 'bg-slate-200'
        }`}>
          <SectionIcon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 flex-shrink-0 ${
            isShared ? 'text-white' : 'text-slate-600'
          }`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm sm:text-base truncate ${
              isShared ? 'text-emerald-900' : 'text-slate-700'
            }`}>
              {title}
            </span>
            {isShared && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full uppercase tracking-wide">
                Shared
              </span>
            )}
          </div>
          {isShared && (
            <p className="text-xs text-emerald-700/80 mt-0.5 truncate">Applies to all email templates</p>
          )}
        </div>
      </div>
      {isExpanded ? (
        <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${
          isShared ? 'text-emerald-600' : 'text-slate-400'
        }`} />
      ) : (
        <ChevronRight className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${
          isShared ? 'text-emerald-600' : 'text-slate-400'
        }`} />
      )}
    </button>
    {isExpanded && (
      <div className={`p-4 sm:p-5 space-y-4 border-t ${isShared ? 'overflow-visible' : ''} ${
        isShared ? 'border-emerald-100 bg-white/50' : 'border-slate-100'
      }`}>
        {children}
      </div>
    )}
  </div>
));

Section.displayName = 'Section';

const EmailTemplates: React.FC = () => {
  const { context } = useSession();
  const toast = useToast();
  const [emailTemplates, setEmailTemplates] = useState<Templates>({
    signup: { 
      subject: 'Notification from {{platform_name}}: Your Signup Request Has Been Received', 
      body: 'We have received your signup request and initiated the review process. Our team is currently validating the information you provided to ensure it meets our account requirements. You will receive an update once this review is complete. If any clarification or additional details are needed, we will contact you directly. Thank you for your patience while we complete this verification step.',
      design: {
        title: defaultTitles.signup,
        primaryColor: defaultBranding.signup.primaryColor,
        background: defaultBranding.signup.background,
        ctas: defaultCTAs.signup,
        footerLinks: defaultFooterLinks
      }
    },
    approval: { 
      subject: '{{platform_name}} Account Update: Your Application Has Been Approved', 
      body: 'Your signup request has been approved, and your account is now active. You may now log in to begin configuring your store and accessing your dashboard. We recommend reviewing the available onboarding resources to support your initial setup. Should you need any assistance during this process, our support team is available to help. Thank you for choosing our platform for your business operations.',
      design: {
        title: defaultTitles.approval,
        primaryColor: defaultBranding.approval.primaryColor,
        background: defaultBranding.approval.background,
        ctas: defaultCTAs.approval,
        footerLinks: defaultFooterLinks
      }
    },
    rejection: { 
      subject: '{{platform_name}} Review Outcome: Status of Your Signup Request', 
      body: 'After a thorough review of your signup information, we are unable to approve your request at this time. This decision reflects the criteria required for account activation on our platform. If you have updated information or additional context that may support reconsideration, you are welcome to reply to this email. Our team will review any new details you provide. Thank you for your interest in our services and for taking the time to apply.',
      design: {
        title: defaultTitles.rejection,
        primaryColor: defaultBranding.rejection.primaryColor,
        background: defaultBranding.rejection.background,
        ctas: defaultCTAs.rejection,
        footerLinks: defaultFooterLinks
      }
    },
    moreInfo: {
      subject: 'Action Required from {{platform_name}}: Please Resubmit Your Signup Form',
      body: 'We need you to resubmit your signup form with corrections. Please review the highlighted fields below and resubmit your application through the signup form. Once you resubmit, we will review your updated information and proceed accordingly. If you have any questions or need clarification, please don\'t hesitate to reach out to us.',
      design: {
        title: defaultTitles.moreInfo,
        primaryColor: defaultBranding.moreInfo.primaryColor,
        background: defaultBranding.moreInfo.background,
        ctas: defaultCTAs.moreInfo,
        footerLinks: defaultFooterLinks
      }
    },
    resubmissionConfirmation: {
      subject: 'Notification from {{platform_name}}: Your Resubmission Has Been Received',
      body: 'Thank you for resubmitting your signup request with the requested corrections. We have received your updated information and our team will review it shortly. You will receive an update once the review is complete. We appreciate your prompt response and cooperation.',
      design: {
        title: defaultTitles.resubmissionConfirmation,
        primaryColor: defaultBranding.resubmissionConfirmation.primaryColor,
        background: defaultBranding.resubmissionConfirmation.background,
        ctas: defaultCTAs.resubmissionConfirmation,
        footerLinks: defaultFooterLinks
      }
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('signup');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  // Shared branding state - extracted from templates
  const [sharedBranding, setSharedBranding] = useState<{ logoUrl?: string; bannerUrl?: string; socialLinks?: SocialLink[] }>({
    logoUrl: undefined,
    bannerUrl: undefined,
    socialLinks: []
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sharedBranding: true, // Expanded by default
    content: false, // Collapsed by default
    branding: false,
    button: false,
    footer: false
  });
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  
  // URL validation state
  const [validationErrors, setValidationErrors] = useState<{
    logoUrl?: string;
    bannerUrl?: string;
    socialLinks?: Record<number, string>;
  }>({});
  
  // Logo preview state
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [logoPreviewLoading, setLogoPreviewLoading] = useState(false);

  // URL validation helper function
  const isValidUrl = useCallback((url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid (optional fields)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Validate shared branding fields
  const validateSharedBranding = useCallback(() => {
    const errors: typeof validationErrors = {};
    
    // Validate logo URL
    if (sharedBranding.logoUrl && !isValidUrl(sharedBranding.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL';
    }
    
    // Validate banner URL
    if (sharedBranding.bannerUrl && !isValidUrl(sharedBranding.bannerUrl)) {
      errors.bannerUrl = 'Please enter a valid URL';
    }
    
    // Validate social links
    const socialErrors: Record<number, string> = {};
    (sharedBranding.socialLinks || []).forEach((social, index) => {
      // If name is provided, URL should be valid (or empty for placeholder)
      if (social.name && social.url && !isValidUrl(social.url)) {
        socialErrors[index] = 'Please enter a valid URL';
      }
    });
    if (Object.keys(socialErrors).length > 0) {
      errors.socialLinks = socialErrors;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [sharedBranding, isValidUrl]);

  const renderVars = useMemo(() => ({
    name: 'John Doe',
    email: 'john@example.com',
    date: new Date().toLocaleString(),
    store_name: 'Demo Store',
    platform_name: 'Custom Signup Forms',
    required_information: 'First Name, Last Name, Email',
    merchant_message: '\n\nAdditional message: Please ensure all information is accurate and up to date.',
    action_url: 'https://example.com/action'
  }), []);

  const renderTemplate = (input: string) =>
    String(input || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => {
      const v = (renderVars as Record<string, string>)?.[key];
      return v == null ? '' : String(v);
    });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Helper function to sync shared branding to all templates
  const syncSharedBrandingToTemplates = useCallback((shared: { logoUrl?: string; bannerUrl?: string; socialLinks?: SocialLink[] }) => {
    setEmailTemplates(prev => {
      const updated: Templates = {} as Templates;
      (Object.keys(prev) as TemplateKey[]).forEach(key => {
        updated[key] = {
          ...prev[key],
          design: {
            ...(prev[key].design || {}),
            logoUrl: shared.logoUrl,
            bannerUrl: shared.bannerUrl,
            socialLinks: shared.socialLinks
          }
        };
      });
      return updated;
    });
  }, []);

  // useCallback handlers for all input fields to prevent focus loss
  const handleSubjectChange = useCallback((value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: { ...prev[selectedTemplate], subject: value }
    }));
  }, [selectedTemplate]);

  const handleTitleChange = useCallback((value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: { 
        ...prev[selectedTemplate], 
        design: { ...(prev[selectedTemplate].design||{}), title: value } 
      }
    }));
  }, [selectedTemplate]);

  const handleGreetingChange = useCallback((value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: { 
        ...prev[selectedTemplate], 
        design: { ...(prev[selectedTemplate].design||{}), greeting: value } 
      }
    }));
  }, [selectedTemplate]);

  const handleBodyChange = useCallback((value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: { ...prev[selectedTemplate], body: value }
    }));
  }, [selectedTemplate]);

  const handlePrimaryColorChange = useCallback((value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: { 
        ...prev[selectedTemplate], 
        design: { ...(prev[selectedTemplate].design||{}), primaryColor: value } 
      }
    }));
  }, [selectedTemplate]);

  const handleBackgroundChange = useCallback((value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: { 
        ...prev[selectedTemplate], 
        design: { ...(prev[selectedTemplate].design||{}), background: value } 
      }
    }));
  }, [selectedTemplate]);

  const handleLogoUrlChange = useCallback((value: string) => {
    const updatedShared = { ...sharedBranding, logoUrl: value };
    setSharedBranding(updatedShared);
    syncSharedBrandingToTemplates(updatedShared);
    
    // Validate on change
    if (value && !isValidUrl(value)) {
      setValidationErrors(prev => ({ ...prev, logoUrl: 'Please enter a valid URL' }));
    } else {
      setValidationErrors(prev => {
        const { logoUrl, ...rest } = prev;
        return rest;
      });
    }
  }, [sharedBranding, syncSharedBrandingToTemplates, isValidUrl]);

  const handleBannerUrlChange = useCallback((value: string) => {
    const updatedShared = { ...sharedBranding, bannerUrl: value };
    setSharedBranding(updatedShared);
    syncSharedBrandingToTemplates(updatedShared);
    
    // Validate on change
    if (value && !isValidUrl(value)) {
      setValidationErrors(prev => ({ ...prev, bannerUrl: 'Please enter a valid URL' }));
    } else {
      setValidationErrors(prev => {
        const { bannerUrl, ...rest } = prev;
        return rest;
      });
    }
  }, [sharedBranding, syncSharedBrandingToTemplates, isValidUrl]);

  const handleFooterNoteChange = useCallback((value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: { 
        ...prev[selectedTemplate], 
        design: { ...(prev[selectedTemplate].design||{}), footerNote: value } 
      }
    }));
  }, [selectedTemplate]);

  const handleCtaTextChange = useCallback((index: number, value: string) => {
    setEmailTemplates(prev => {
      const newCtas = [...(prev[selectedTemplate].design?.ctas || [])];
      newCtas[index] = { ...newCtas[index], text: value };
      return {
        ...prev,
        [selectedTemplate]: { 
          ...prev[selectedTemplate], 
          design: { ...(prev[selectedTemplate].design||{}), ctas: newCtas } 
        }
      };
    });
  }, [selectedTemplate]);

  const handleCtaUrlChange = useCallback((index: number, value: string) => {
    setEmailTemplates(prev => {
      const newCtas = [...(prev[selectedTemplate].design?.ctas || [])];
      newCtas[index] = { ...newCtas[index], url: value };
      return {
        ...prev,
        [selectedTemplate]: { 
          ...prev[selectedTemplate], 
          design: { ...(prev[selectedTemplate].design||{}), ctas: newCtas } 
        }
      };
    });
  }, [selectedTemplate]);

  const handleFooterLinkTextChange = useCallback((index: number, value: string) => {
    setEmailTemplates(prev => {
      const newLinks = [...(prev[selectedTemplate].design?.footerLinks || [])];
      newLinks[index] = { ...newLinks[index], text: value };
      return {
        ...prev,
        [selectedTemplate]: { 
          ...prev[selectedTemplate], 
          design: { ...(prev[selectedTemplate].design||{}), footerLinks: newLinks } 
        }
      };
    });
  }, [selectedTemplate]);

  const handleFooterLinkUrlChange = useCallback((index: number, value: string) => {
    setEmailTemplates(prev => {
      const newLinks = [...(prev[selectedTemplate].design?.footerLinks || [])];
      newLinks[index] = { ...newLinks[index], url: value };
      return {
        ...prev,
        [selectedTemplate]: { 
          ...prev[selectedTemplate], 
          design: { ...(prev[selectedTemplate].design||{}), footerLinks: newLinks } 
        }
      };
    });
  }, [selectedTemplate]);

  const handleSocialNameChange = useCallback((index: number, value: string) => {
    const currentSocials = sharedBranding.socialLinks || [];
    const newSocials = [...currentSocials];
    const currentSocial = newSocials[index];
    const currentUrl = currentSocial?.url || '';
    // Automatically detect and set SVG icon URL for in-app display (lightweight, colorful)
    const autoIconUrl = getSocialIconUrlSvg(value, currentUrl);
    // Always ensure iconUrl is set - use auto-detected, existing, or default share icon
    const finalIconUrl = autoIconUrl || currentSocial?.iconUrl || getSocialIconUrlSvg('', '') || 'https://img.icons8.com/color/24/000000/share.png';
    newSocials[index] = { 
      ...newSocials[index], 
      name: value,
      iconUrl: finalIconUrl
    };
    
    const updatedShared = { ...sharedBranding, socialLinks: newSocials };
    setSharedBranding(updatedShared);
    syncSharedBrandingToTemplates(updatedShared);
  }, [sharedBranding, syncSharedBrandingToTemplates]);

  const handleSocialUrlChange = useCallback((index: number, value: string) => {
    const currentSocials = sharedBranding.socialLinks || [];
    const newSocials = [...currentSocials];
    const currentSocial = newSocials[index];
    const currentName = currentSocial?.name || '';
    // Automatically detect and set SVG icon URL for in-app display (lightweight, colorful)
    const autoIconUrl = getSocialIconUrlSvg(currentName, value);
    // Always ensure iconUrl is set - use auto-detected, existing, or default share icon
    const finalIconUrl = autoIconUrl || currentSocial?.iconUrl || getSocialIconUrlSvg('', '') || 'https://img.icons8.com/color/24/000000/share.png';
    newSocials[index] = { 
      ...newSocials[index], 
      url: value,
      iconUrl: finalIconUrl
    };
    
    const updatedShared = { ...sharedBranding, socialLinks: newSocials };
    setSharedBranding(updatedShared);
    syncSharedBrandingToTemplates(updatedShared);
    
    // Validate on change - if name is provided, URL should be valid (or empty for placeholder)
    if (currentName && value && !isValidUrl(value)) {
      setValidationErrors(prev => ({
        ...prev,
        socialLinks: { ...(prev.socialLinks || {}), [index]: 'Please enter a valid URL' }
      }));
    } else {
      setValidationErrors(prev => {
        const socialErrors = { ...(prev.socialLinks || {}) };
        delete socialErrors[index];
        const { socialLinks, ...rest } = prev;
        return Object.keys(socialErrors).length > 0 
          ? { ...rest, socialLinks: socialErrors }
          : rest;
      });
    }
  }, [sharedBranding, syncSharedBrandingToTemplates, isValidUrl]);

  const handleSocialDelete = useCallback((index: number) => {
    const currentSocials = sharedBranding.socialLinks || [];
    const newSocials = currentSocials.filter((_, i) => i !== index);
    const updatedShared = { ...sharedBranding, socialLinks: newSocials };
    setSharedBranding(updatedShared);
    syncSharedBrandingToTemplates(updatedShared);
  }, [sharedBranding, syncSharedBrandingToTemplates]);

  const handleSocialAdd = useCallback((platform?: { name: string; placeholder: string; iconUrl: string | null }) => {
    let newSocial: SocialLink;
    
    if (platform) {
      // Platform selected from dropdown
      const iconUrl = platform.iconUrl || getSocialIconUrlSvg(platform.name, '') || 'https://cdn.simpleicons.org/share/2563eb';
      newSocial = { 
        id: `social-${Date.now()}`, 
        name: platform.name, 
        url: platform.placeholder, 
        iconUrl: iconUrl 
      };
    } else {
      // Custom option
      const defaultIconUrl = getSocialIconUrlSvg('', '') || 'https://cdn.simpleicons.org/share/2563eb';
      newSocial = { id: `social-${Date.now()}`, name: '', url: '', iconUrl: defaultIconUrl };
    }
    
    const currentSocials = sharedBranding.socialLinks || [];
    const newSocials = [...currentSocials, newSocial];
    const updatedShared = { ...sharedBranding, socialLinks: newSocials };
    setSharedBranding(updatedShared);
    syncSharedBrandingToTemplates(updatedShared);
    setShowSocialDropdown(false);
  }, [sharedBranding, syncSharedBrandingToTemplates]);

  // Removed handleSocialIconUrlChange - icon URLs are now automatically detected

  const generateHtml = (t: Template) => {
    // Merge shared branding into design for preview rendering
    const design = t.design || {};
    const d = { ...design, ...sharedBranding } as Design & typeof sharedBranding;
    const brand = d.primaryColor || '#2563eb';
    const bg = d.background || '#f7fafc';
    const logo = d.logoUrl ? `<img src="${d.logoUrl}" alt="${renderTemplate('{{platform_name}}')}" width="200" height="auto" border="0" style="max-width:200px;height:auto;display:block;margin:0 auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic">` : `<div style="font-size:32px;font-weight:900;letter-spacing:.3px;color:${brand};text-align:center">${renderTemplate('{{platform_name}}')}</div>`;
    const banner = d.bannerUrl ? `<tr><td style="padding:0 24px 8px 24px"><img src="${d.bannerUrl}" alt="" width="592" height="auto" border="0" style="width:100%;max-width:592px;height:auto;border-radius:14px;display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td></tr>` : '';
    
    // Generate CTAs row (optional, can have multiple)
    const ctas = d.ctas || [];
    const ctasRow = ctas.length > 0
      ? `<tr>
            <td align="center" style="padding:20px 24px 16px 24px">
              ${ctas.map(cta => `<a href="${renderTemplate(cta.url)}" style="display:inline-block;background:${brand};color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:.2px;padding:13px 24px;border-radius:999px;margin:4px 6px"> ${cta.text} </a>`).join('')}
            </td>
          </tr>`
      : '';
    
    // Generate social links row (custom icons) - convert SVG to PNG for email compatibility
    // In-app we use SVG (stored in iconUrl), but for email we need PNG format
    const socialLinks = ((d.socialLinks || sharedBranding.socialLinks) || [])
      .map(social => {
        // If iconUrl is SVG or empty, convert to PNG for email
        const iconUrl = social.iconUrl || '';
        let emailIconUrl = iconUrl;
        
        // If it's an SVG URL or empty, get PNG version for email
        if (!iconUrl || iconUrl.includes('.svg') || iconUrl.includes('simpleicons.org')) {
          emailIconUrl = getSocialIconUrlPng(social.name || '', social.url || '');
        }
        
        // Ensure we always have a valid iconUrl (fallback to default share icon)
        if (!emailIconUrl || emailIconUrl.trim().length === 0) {
          emailIconUrl = 'https://img.icons8.com/color/24/000000/share.png';
        }
        
        return { ...social, iconUrl: emailIconUrl };
      })
      .filter(social => {
        // Only include links with valid icon URLs and at least a name or URL
        return social.iconUrl && social.iconUrl.trim().length > 0 && (social.name || social.url);
      });
    
    const socialsRow = socialLinks.length > 0
      ? `<tr><td align="center" style="padding-top:8px;padding-bottom:8px">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                ${socialLinks.map(social => `<td style="padding:0 6px"><a href="${social.url || '#'}" target="_blank" style="text-decoration:none;display:inline-block"><img src="${social.iconUrl}" alt="${social.name || 'Social'}" width="24" height="24" border="0" style="width:24px;height:24px;border-radius:4px;display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" /></a></td>`).join('')}
              </tr>
            </table>
         </td></tr>`
      : '';
    
    // Generate footer links row (optional, can have multiple)
    const footerLinks = d.footerLinks || [];
    const footerLinksHtml = footerLinks.length > 0
      ? footerLinks.map(link => `<a href="${link.url}" style="color:${brand};text-decoration:underline">${link.text}</a>`).join(' &nbsp;|&nbsp; ')
      : '';
    
    const footerNote = d.footerNote || 'This email was sent to {{email}}';
    const heading = (d.title || defaultTitles[selectedTemplate] || renderTemplate('{{platform_name}}')).replace(/\{\{.*?\}\}/g, (m)=>renderTemplate(m));
    const greeting = (d.greeting || 'Hello {{name}}').replace(/\{\{.*?\}\}/g, (m)=>renderTemplate(m));

    // Special handling for moreInfo template - format problematic fields in highlighted box
    let bodyContent = '';
    if (selectedTemplate === 'moreInfo' && renderVars.required_information) {
      const requiredInfo = String(renderVars.required_information || '').trim();
      const merchantMessage = String(renderVars.merchant_message || '').trim();
      
      if (requiredInfo) {
        // Remove placeholders from body text (merchant_message is only shown in the box)
        let bodyText = t.body
          .replace(/\{\{\s*required_information\s*\}\}/g, '')
          .replace(/\{\{\s*merchant_message\s*\}\}/g, '') // Remove from body, only show in box
          .replace(/\.\s*\./g, '.')
          .replace(/:\s*\./g, '.')
          .trim();
        bodyText = renderTemplate(bodyText);
        
        // Format fields as a list
        const fieldsList = requiredInfo.split(',').map(f => f.trim()).filter(f => f);
        const formattedFields = fieldsList.map(field => 
          `<div style="font-size:16px;line-height:1.8;color:#0f172a;font-weight:500;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin-bottom:8px;">${field}</div>`
        ).join('');
        
        // Orange color for resubmission
        const orangeColor = '#d97706';
        const orangeRgb = { r: 217, g: 119, b: 6 };
        const bgColor = `rgba(${orangeRgb.r}, ${orangeRgb.g}, ${orangeRgb.b}, 0.1)`;
        
        bodyContent = `
          <tr>
            <td style="padding:0 24px">
              <div style="font-size:14px;color:#334155;text-align:center;margin-bottom:14px">${greeting},</div>
              <div style="font-size:14px;line-height:1.7;color:#334155;white-space:pre-line;text-align:center">${bodyText}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px 24px;">
              <div style="background:${bgColor};border:2px solid ${orangeColor};border-radius:16px;padding:24px;margin:16px 0;box-shadow:0 8px 24px rgba(0,0,0,0.12);">
                <div style="display:flex;gap:16px;align-items:flex-start;">
                  <div style="flex-shrink:0;width:20px;height:20px;background:${orangeColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${orangeColor}50;margin:2px 16px 0 0;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#ffffff"/>
                    </svg>
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:12px;font-weight:800;color:${orangeColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">FIELDS REQUIRING CORRECTION</div>
                    ${formattedFields}
                    ${merchantMessage ? `<div style="font-size:14px;line-height:1.6;color:#475569;font-weight:400;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin-top:12px;padding-top:12px;border-top:1px solid ${orangeColor}30;white-space:pre-line;">${merchantMessage.replace(/\n/g, '<br/>')}</div>` : ''}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        `;
      } else {
        bodyContent = `
          <tr>
            <td style="padding:0 24px">
              <div style="font-size:14px;color:#334155;text-align:center;margin-bottom:14px">${greeting},</div>
              <div style="font-size:14px;line-height:1.7;color:#334155;white-space:pre-line;text-align:center">${renderTemplate(t.body)}</div>
            </td>
          </tr>
        `;
      }
    } else {
      bodyContent = `
        <tr>
          <td style="padding:0 24px">
            <div style="font-size:14px;color:#334155;text-align:center;margin-bottom:14px">${greeting},</div>
            <div style="font-size:14px;line-height:1.7;color:#334155;white-space:pre-line;text-align:center">${renderTemplate(t.body)}</div>
          </td>
        </tr>
      `;
    }

    return `
<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="color-scheme" content="light" />
<title>${renderTemplate('{{platform_name}}')}</title>
<style>
  :root { --brand: ${brand}; --bg: ${bg}; }
  /* Disable all link interactions in preview */
  a { pointer-events: none; cursor: default; }
</style>
</head>
<body style="background-color:${bg};margin:0;padding:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr><td style="padding:28px 0;"></td></tr>
    <tr>
      <td align="center">
        <table role="presentation" width="640" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:0 0 8px 0;box-shadow:0 12px 28px -12px rgba(36,38,51,0.18);">
          <tr><td style="padding:28px 24px 8px 24px">${logo}</td></tr>
          ${banner}
          <tr>
            <td style="padding:6px 24px 0 24px">
              <div style="font-size:24px;line-height:1.3;font-weight:800;text-align:center;margin:8px 0 6px 0;">${heading}</div>
            </td>
          </tr>
          ${bodyContent}
          ${ctasRow}
          ${socialsRow}
          <tr>
            <td style="padding:12px 24px 6px 24px">
              <div style="height:1px;background:#e5e7eb"></div>
            </td>
          </tr>
          <tr>
            <td style="font-size:12px;line-height:1.7;color:#64748b;padding:8px 24px 8px 24px;text-align:center">
              ${renderTemplate(footerNote)}${footerLinksHtml ? '<br/>' + footerLinksHtml : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:24px 0;"></td></tr>
  </table>
</body></html>
`.trim();
  };

  useEffect(() => {
    const load = async () => {
      if (!context) return;
      try {
        const res = await fetch(`/api/email-templates?context=${encodeURIComponent(context)}`);
        if (res.ok) {
          const json = await res.json();
          // API returns { error: false, data: { templates, sharedBranding } }
          const templates = json?.data?.templates || json?.templates;
          const sharedBrandingFromApi = json?.data?.sharedBranding || json?.sharedBranding || null;
          if (templates) {
            // Merge loaded templates with defaults to ensure all required fields and branding are present
            const defaultTemplates: Templates = {
              signup: { 
                subject: 'Notification from {{platform_name}}: Your Signup Request Has Been Received', 
                body: 'We have received your signup request and initiated the review process. Our team is currently validating the information you provided to ensure it meets our account requirements. You will receive an update once this review is complete. If any clarification or additional details are needed, we will contact you directly. Thank you for your patience while we complete this verification step.',
                design: {
                  title: defaultTitles.signup,
                  primaryColor: defaultBranding.signup.primaryColor,
                  background: defaultBranding.signup.background,
                  ctas: defaultCTAs.signup,
                  footerLinks: defaultFooterLinks
                }
              },
              approval: { 
                subject: '{{platform_name}} Account Update: Your Application Has Been Approved', 
                body: 'Your signup request has been approved, and your account is now active. You may now log in to begin configuring your store and accessing your dashboard. We recommend reviewing the available onboarding resources to support your initial setup. Should you need any assistance during this process, our support team is available to help. Thank you for choosing our platform for your business operations.',
                design: {
                  title: defaultTitles.approval,
                  primaryColor: defaultBranding.approval.primaryColor,
                  background: defaultBranding.approval.background,
                  ctas: defaultCTAs.approval,
                  footerLinks: defaultFooterLinks
                }
              },
              rejection: { 
                subject: '{{platform_name}} Review Outcome: Status of Your Signup Request', 
                body: 'After a thorough review of your signup information, we are unable to approve your request at this time. This decision reflects the criteria required for account activation on our platform. If you have updated information or additional context that may support reconsideration, you are welcome to reply to this email. Our team will review any new details you provide. Thank you for your interest in our services and for taking the time to apply.',
                design: {
                  title: defaultTitles.rejection,
                  primaryColor: defaultBranding.rejection.primaryColor,
                  background: defaultBranding.rejection.background,
                  ctas: defaultCTAs.rejection,
                  footerLinks: defaultFooterLinks
                }
              },
              moreInfo: {
                subject: 'Action Required from {{platform_name}}: Please Resubmit Your Signup Form',
                body: 'We need you to resubmit your signup form with corrections. Please review the highlighted fields below and resubmit your application through the signup form.\n\nOnce you resubmit, we will review your updated information and proceed accordingly.\n\nIf you have any questions or need clarification, please don\'t hesitate to reach out to us.',
                design: {
                  title: defaultTitles.moreInfo,
                  primaryColor: defaultBranding.moreInfo.primaryColor,
                  background: defaultBranding.moreInfo.background,
                  ctas: defaultCTAs.moreInfo,
                  footerLinks: defaultFooterLinks
                }
              },
              resubmissionConfirmation: {
                subject: 'Notification from {{platform_name}}: Your Resubmission Has Been Received',
                body: 'Thank you for resubmitting your signup request with the requested corrections. We have received your updated information and our team will review it shortly. You will receive an update once the review is complete. We appreciate your prompt response and cooperation.',
                design: {
                  title: defaultTitles.resubmissionConfirmation,
                  primaryColor: defaultBranding.resubmissionConfirmation.primaryColor,
                  background: defaultBranding.resubmissionConfirmation.background,
                  ctas: defaultCTAs.resubmissionConfirmation,
                  footerLinks: defaultFooterLinks
                }
              }
            };

            // Load shared branding from API
            let sharedLogoUrl: string | undefined;
            let sharedBannerUrl: string | undefined;
            let sharedSocialLinks: SocialLink[] | undefined;
            
            if (sharedBrandingFromApi) {
              sharedLogoUrl = sharedBrandingFromApi.logoUrl;
              sharedBannerUrl = sharedBrandingFromApi.bannerUrl;
              sharedSocialLinks = (sharedBrandingFromApi.socialLinks || []).map((social: SocialLink) => {
                // Ensure iconUrl is set - auto-detect if missing
                if (!social.iconUrl && (social.name || social.url)) {
                  return {
                    ...social,
                    iconUrl: getSocialIconUrlSvg(social.name || '', social.url || '')
                  };
                }
                return social;
              });
            }
            
            // Merge templates with shared branding values
            const merged: Templates = Object.fromEntries(
              (Object.keys(defaultTemplates) as TemplateKey[]).map((k) => {
                const loaded = templates[k];
                const defaultTemplate = defaultTemplates[k];
                
                // Validate that loaded template doesn't contain legacy shared branding fields
                if (loaded?.design) {
                  const design = loaded.design as any;
                  if (design.logoUrl !== undefined || design.bannerUrl !== undefined || design.socialLinks !== undefined) {
                    throw new Error(`Template ${k} contains legacy shared branding fields. Templates must not contain logoUrl, bannerUrl, or socialLinks.`);
                  }
                }
                
                // If loaded template exists, merge it with defaults
                if (loaded) {
                  return [k, {
                    subject: loaded.subject ?? defaultTemplate.subject,
                    body: loaded.body ?? defaultTemplate.body,
                    html: loaded.html ?? null,
                    useHtml: loaded.useHtml ?? true,
                    design: loaded.design ? {
                      title: loaded.design.title ?? defaultTemplate.design?.title,
                      greeting: loaded.design.greeting ?? defaultTemplate.design?.greeting,
                      primaryColor: loaded.design.primaryColor ?? defaultTemplate.design?.primaryColor ?? defaultBranding[k].primaryColor,
                      background: loaded.design.background ?? defaultTemplate.design?.background ?? defaultBranding[k].background,
                      footerNote: loaded.design.footerNote ?? defaultTemplate.design?.footerNote,
                      ctas: loaded.design.ctas !== undefined ? loaded.design.ctas : (defaultTemplate.design?.ctas || []),
                      footerLinks: loaded.design.footerLinks !== undefined ? loaded.design.footerLinks : (defaultTemplate.design?.footerLinks || []),
                    } : defaultTemplate.design,
                  }];
                } else {
                  // No saved template, use default
                  return [k, defaultTemplate];
                }
              })
            ) as Templates;
            
            // Initialize shared branding state from API or extracted values
            setSharedBranding({
              logoUrl: sharedLogoUrl,
              bannerUrl: sharedBannerUrl,
              socialLinks: sharedSocialLinks || []
            });
            
            // Preserve saved values as-is - no final pass syncing that overwrites saved values
            // The UI handles syncing when user makes changes, not on load
            setEmailTemplates(merged);
          }
        }
      } catch {}
      setLoaded(true);
    };
    load();
  }, [context]);

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSocialDropdown(false);
      }
    };
    if (showSocialDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSocialDropdown]);

  // Reset logo preview when URL changes
  useEffect(() => {
    if (sharedBranding.logoUrl && isValidUrl(sharedBranding.logoUrl)) {
      setLogoPreviewLoading(true);
      setLogoPreviewError(false);
    } else {
      setLogoPreviewLoading(false);
      setLogoPreviewError(false);
    }
  }, [sharedBranding.logoUrl, isValidUrl]);

  const save = async () => {
    if (!context) return;
    
    // Validate before saving
    if (!validateSharedBranding()) {
      toast.showError('Please fix validation errors before saving.');
      return;
    }
    
    setSaving(true);
    try {
      // Clean templates by removing legacy shared branding fields from design
      // This must be done first because syncSharedBrandingToTemplates adds these fields for preview
      const toSave: Templates = Object.fromEntries(
        (Object.keys(emailTemplates) as TemplateKey[]).map((k) => {
          const t = emailTemplates[k];
          const { logoUrl, bannerUrl, socialLinks, ...cleanDesign } = t.design || {};
          return [k, { 
            ...t, 
            design: cleanDesign,
            useHtml: true
          }];
        })
      ) as Templates;
      
      // Validate that cleaned templates don't contain legacy shared branding fields
      for (const [key, template] of Object.entries(toSave)) {
        if (template.design) {
          const design = template.design as any;
          if (design.logoUrl !== undefined || design.bannerUrl !== undefined || design.socialLinks !== undefined) {
            toast.showError(`Template ${key} contains legacy shared branding fields. Please refresh and try again.`);
            return;
          }
        }
      }
      await fetch(`/api/email-templates?context=${encodeURIComponent(context)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templates: toSave,
          sharedBranding: sharedBranding 
        }),
      });
      toast.showSuccess('Shared branding and templates saved successfully!');
    } catch (error: unknown) {
      toast.showError(getUserFriendlyError(error, 'Unable to save the email templates. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const currentMeta = templateMeta[selectedTemplate];
  const CurrentIcon = currentMeta.icon;

  if (!loaded) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-white/10 rounded animate-pulse" />
          <div className="h-3 sm:h-4 w-full sm:w-96 bg-white/5 rounded mt-3 animate-pulse" />
        </div>
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <div className="col-span-12 lg:col-span-5 space-y-3 sm:space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="col-span-12 lg:col-span-7">
            <div className="h-[400px] sm:h-[500px] lg:h-[600px] bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 bg-blue-500/15 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          {/* Title, Icon, and Action Buttons Row - Desktop layout */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Title and Icon */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="sm:text-2xl md:text-3xl lg:text-4xl font-bold !text-white break-words leading-tight">Email Templates</h1>
                <p className="text-slate-400 text-[11px] sm:text-xs md:text-sm break-words mt-0.5 hidden sm:block">Design beautiful emails for your customers</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:flex-shrink-0">
              <button
                onClick={() => setShowTestEmailModal(true)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-white/20 transition-all cursor-pointer border border-white/10 w-full sm:w-auto"
              >
                <TestTube className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Send Test</span>
              </button>
              <button
                onClick={save}
                disabled={saving || Object.keys(validationErrors).length > 0}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-white text-slate-900 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-50 transition-all cursor-pointer shadow-lg shadow-white/25 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                    <span className="whitespace-nowrap">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Save All Templates</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Template Selector Pills */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2">
            {(Object.keys(templateMeta) as TemplateKey[]).map((key) => {
              const meta = templateMeta[key];
              const Icon = meta.icon;
              const isSelected = selectedTemplate === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/25'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap truncate max-w-[120px] sm:max-w-none">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        {/* Editor Panel */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-3 sm:space-y-4">
          {/* Current Template Info - Uses user's primary color with adaptive text */}
          {(() => {
            const primaryColor = emailTemplates[selectedTemplate].design?.primaryColor || '#2563eb';
            const isLight = isLightColor(primaryColor);
            const textColor = '#ffffff';
            const textColorMuted = isLight ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)';
            const iconBg = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';
            return (
          <div 
            className="rounded-xl p-3 sm:p-4 transition-colors duration-300"
                style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: iconBg }}
                  >
                    <CurrentIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: textColor }} />
              </div>
              <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base break-words" style={{ color: textColor }}>{currentMeta.label}</h3>
                    <p className="text-xs sm:text-sm break-words" style={{ color: textColorMuted }}>{currentMeta.description}</p>
              </div>
            </div>
          </div>
            );
          })()}

          {/* Shared Branding Section */}
          <Section id="sharedBranding" title="Shared Branding" icon={Globe} isExpanded={expandedSections.sharedBranding} onToggle={toggleSection} isShared={true}>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-semibold text-slate-700 mb-0.5">Logo URL</label>
                    <p className="text-xs text-slate-500">Displayed at max 200px width in emails</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={sharedBranding.logoUrl || ''}
                    onChange={(e) => {
                      setLogoPreviewError(false);
                      setLogoPreviewLoading(true);
                      handleLogoUrlChange(e.target.value);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all bg-white font-mono ${
                      validationErrors.logoUrl
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="https://your-domain.com/logo.png"
                    aria-invalid={!!validationErrors.logoUrl}
                    aria-describedby={validationErrors.logoUrl ? 'logo-url-error' : undefined}
                  />
                  {validationErrors.logoUrl && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                  )}
                </div>
                {validationErrors.logoUrl && (
                  <p id="logo-url-error" className="text-xs text-rose-600 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {validationErrors.logoUrl}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-semibold text-slate-700 mb-0.5">Banner Image URL</label>
                    <p className="text-xs text-slate-500">Scales to fit email width</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={sharedBranding.bannerUrl || ''}
                    onChange={(e) => handleBannerUrlChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all bg-white font-mono ${
                      validationErrors.bannerUrl
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="https://your-domain.com/banner.jpg"
                    aria-invalid={!!validationErrors.bannerUrl}
                    aria-describedby={validationErrors.bannerUrl ? 'banner-url-error' : undefined}
                  />
                  {validationErrors.bannerUrl && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                  )}
                </div>
                {validationErrors.bannerUrl && (
                  <p id="banner-url-error" className="text-xs text-rose-600 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {validationErrors.bannerUrl}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2 sm:mb-3">Social Media Links</label>
              <div className="space-y-3">
                {(sharedBranding.socialLinks || []).map((social, index) => (
                  <div key={social.id} className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Icon Preview */}
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {social.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={social.iconUrl} 
                            alt={social.name || 'Social icon'} 
                            className="w-7 h-7 object-contain" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.error-indicator')) {
                                const errorSpan = document.createElement('span');
                                errorSpan.className = 'error-indicator text-xs font-bold text-slate-400';
                                errorSpan.textContent = '?';
                                parent.appendChild(errorSpan);
                              }
                            }}
                          />
                        ) : (
                          <Share2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <input
                          type="text"
                          value={social.name}
                          onChange={(e) => handleSocialNameChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                          placeholder="Platform name"
                        />
                        <div className="relative">
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => handleSocialUrlChange(index, e.target.value)}
                            className={`w-full px-3 py-2 pr-8 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all bg-white ${
                              validationErrors.socialLinks?.[index]
                                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                                : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                            }`}
                            placeholder="https://..."
                            aria-invalid={!!validationErrors.socialLinks?.[index]}
                            aria-describedby={validationErrors.socialLinks?.[index] ? `social-url-error-${index}` : undefined}
                          />
                          {validationErrors.socialLinks?.[index] && (
                            <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                          )}
                        </div>
                        {validationErrors.socialLinks?.[index] && (
                          <p id={`social-url-error-${index}`} className="text-xs text-rose-600 flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            {validationErrors.socialLinks[index]}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleSocialDelete(index)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer flex-shrink-0 border border-transparent hover:border-rose-200"
                        aria-label={`Delete ${social.name || 'social link'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {(sharedBranding.socialLinks || []).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs sm:text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 px-3">
                    No social links added. Add your social media profiles.
                  </div>
                )}
                
                {/* Quick add preset platforms */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      // Ensure the section is expanded when opening the dropdown
                      if (!expandedSections.sharedBranding) {
                        toggleSection('sharedBranding');
                      }
                      setShowSocialDropdown(!showSocialDropdown);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer text-sm"
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    <span>Add Social Link</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${showSocialDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showSocialDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-2">
                        {socialPlatformOptions.map((platform) => {
                          const alreadyAdded = (sharedBranding.socialLinks || []).some(
                            s => s.name.toLowerCase() === platform.name.toLowerCase()
                          );
                          const isCustom = platform.name === 'Custom';
                          
                          return (
                            <button
                              key={platform.name}
                              disabled={!isCustom && alreadyAdded}
                              onClick={() => {
                                if (isCustom) {
                                  handleSocialAdd();
                                } else {
                                  handleSocialAdd(platform);
                                }
                              }}
                              className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                                !isCustom && alreadyAdded
                                  ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                                  : 'hover:bg-blue-50 hover:text-blue-600 text-slate-700 cursor-pointer'
                              }`}
                            >
                              {platform.iconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={platform.iconUrl} alt={platform.name} className="w-5 h-5 flex-shrink-0" />
                              ) : (
                                <Plus className="w-5 h-5 flex-shrink-0 text-slate-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{platform.name}</div>
                                {platform.placeholder && (
                                  <div className="text-xs text-slate-400 truncate">{platform.placeholder}</div>
                                )}
                              </div>
                              {!isCustom && alreadyAdded && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Template-Specific Settings Group */}
          <div className="mt-4 sm:mt-5 bg-slate-50/50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
            {/* Content Section */}
            <Section id="content" title="Email Content" icon={Type} isExpanded={expandedSections.content} onToggle={toggleSection}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Subject Line</label>
              <p className="text-xs text-slate-400 mb-2">Appears in the recipient&apos;s inbox</p>
              <input
                type="text"
                value={emailTemplates[selectedTemplate].subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base text-slate-900 transition-all"
                placeholder="Enter email subject"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Email Title</label>
              <p className="text-xs text-slate-400 mb-2">Main heading displayed inside the email</p>
              <input
                type="text"
                value={emailTemplates[selectedTemplate].design?.title ?? ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base text-slate-900 transition-all"
                placeholder={defaultTitles[selectedTemplate]}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Greeting</label>
              <input
                type="text"
                value={emailTemplates[selectedTemplate].design?.greeting || 'Hello {{name}}'}
                onChange={(e) => handleGreetingChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base text-slate-900 transition-all"
                placeholder="Hello {{name}}"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Email Body</label>
              <textarea
                value={emailTemplates[selectedTemplate].body}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={8}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base text-slate-900 transition-all resize-none"
                placeholder="Enter email content"
              />
            </div>

            {/* Variables */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-blue-800">Available Variables</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['{{name}}', '{{email}}', '{{date}}', '{{store_name}}', '{{platform_name}}', '{{required_information}}', '{{merchant_message}}'].map(v => (
                  <code key={v} className="px-2 py-1 bg-white border border-blue-200 rounded text-[10px] sm:text-[11px] text-blue-700 font-mono whitespace-nowrap">
                    {v}
                  </code>
                ))}
              </div>
            </div>
            </Section>

            {/* Branding Section */}
            <Section id="branding" title="Branding & Colors" icon={Palette} isExpanded={expandedSections.branding} onToggle={toggleSection}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={emailTemplates[selectedTemplate].design?.primaryColor || '#2563eb'}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="w-11 h-9 sm:w-12 sm:h-10 p-1 border border-slate-200 rounded-lg cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={emailTemplates[selectedTemplate].design?.primaryColor || '#2563eb'}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={emailTemplates[selectedTemplate].design?.background || '#f7fafc'}
                    onChange={(e) => handleBackgroundChange(e.target.value)}
                    className="w-11 h-9 sm:w-12 sm:h-10 p-1 border border-slate-200 rounded-lg cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={emailTemplates[selectedTemplate].design?.background || '#f7fafc'}
                    onChange={(e) => handleBackgroundChange(e.target.value)}
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Quick Themes</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { name: 'Sky', primaryColor: '#2563eb', background: '#f7fafc' },
                  { name: 'Emerald', primaryColor: '#059669', background: '#ecfdf5' },
                  { name: 'Rose', primaryColor: '#e11d48', background: '#fff1f2' },
                  { name: 'Slate', primaryColor: '#334155', background: '#f1f5f9' },
                  { name: 'Purple', primaryColor: '#7c3aed', background: '#faf5ff' },
                ].map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setEmailTemplates({
                      ...emailTemplates,
                      [selectedTemplate]: {
                        ...emailTemplates[selectedTemplate],
                        design: {
                          ...(emailTemplates[selectedTemplate].design || {}),
                          primaryColor: t.primaryColor,
                          background: t.background,
                        }
                      }
                    })}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm transition-colors cursor-pointer flex-shrink-0"
                  >
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0" style={{ backgroundColor: t.primaryColor }} />
                    <span className="whitespace-nowrap">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 sm:p-3 mt-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">Note:</span> Logo, banner image, and social media links are managed in the <span className="font-medium">&quot;Shared Branding&quot;</span> section above. These settings apply to all email templates.
                </div>
              </div>
            </div>
            </Section>

            {/* CTA Buttons Section */}
            <Section id="button" title="Call-to-Action Buttons" icon={MousePointer} isExpanded={expandedSections.button} onToggle={toggleSection}>
            <div className="space-y-3">
              {(emailTemplates[selectedTemplate].design?.ctas || []).map((cta, index) => (
                <div key={cta.id} className="flex items-start gap-2 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="pt-2 flex-shrink-0 hidden sm:block">
                    <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 min-w-0">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={cta.text}
                        onChange={(e) => handleCtaTextChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Button text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Button URL</label>
                      <input
                        type="text"
                        value={cta.url}
                        onChange={(e) => handleCtaUrlChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="https://... or {{action_url}}"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newCtas = (emailTemplates[selectedTemplate].design?.ctas || []).filter((_, i) => i !== index);
                      setEmailTemplates({
                        ...emailTemplates,
                        [selectedTemplate]: { ...emailTemplates[selectedTemplate], design: { ...(emailTemplates[selectedTemplate].design||{}), ctas: newCtas } }
                      });
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(emailTemplates[selectedTemplate].design?.ctas || []).length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs sm:text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 px-3">
                  No buttons added. Buttons are optional.
                </div>
              )}
              
              <button
                onClick={() => {
                  const newCta: CTA = { id: `cta-${Date.now()}`, text: 'Learn More', url: '{{action_url}}' };
                  const currentCtas = emailTemplates[selectedTemplate].design?.ctas || [];
                  setEmailTemplates({
                    ...emailTemplates,
                    [selectedTemplate]: { ...emailTemplates[selectedTemplate], design: { ...(emailTemplates[selectedTemplate].design||{}), ctas: [...currentCtas, newCta] } }
                  });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span>Add Button</span>
              </button>
            </div>
          </Section>

          {/* Footer Section */}
          <Section id="footer" title="Footer & Links" icon={Link2} isExpanded={expandedSections.footer} onToggle={toggleSection}>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Footer Note</label>
              <input
                type="text"
                value={emailTemplates[selectedTemplate].design?.footerNote || 'This email was sent to {{email}}'}
                onChange={(e) => handleFooterNoteChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base text-slate-900 transition-all"
              />
            </div>
            
              <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2 sm:mb-3">Footer Links</label>
              <div className="space-y-2">
                {(emailTemplates[selectedTemplate].design?.footerLinks || []).map((link, index) => (
                  <div key={link.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                      <input
                        type="text"
                        value={link.text}
                        onChange={(e) => handleFooterLinkTextChange(index, e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Link text"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleFooterLinkUrlChange(index, e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newLinks = (emailTemplates[selectedTemplate].design?.footerLinks || []).filter((_, i) => i !== index);
                        setEmailTemplates({
                          ...emailTemplates,
                          [selectedTemplate]: { ...emailTemplates[selectedTemplate], design: { ...(emailTemplates[selectedTemplate].design||{}), footerLinks: newLinks } }
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {(emailTemplates[selectedTemplate].design?.footerLinks || []).length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs sm:text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200 px-3">
                    No footer links. Links are optional.
                  </div>
                )}
                
                <button
                  onClick={() => {
                    const newLink: FooterLink = { id: `link-${Date.now()}`, text: 'New Link', url: '#' };
                    const currentLinks = emailTemplates[selectedTemplate].design?.footerLinks || [];
                    setEmailTemplates({
                      ...emailTemplates,
                      [selectedTemplate]: { ...emailTemplates[selectedTemplate], design: { ...(emailTemplates[selectedTemplate].design||{}), footerLinks: [...currentLinks, newLink] } }
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer text-sm"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span>Add Footer Link</span>
                </button>
              </div>
            </div>
            </Section>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Preview Header */}
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base text-slate-800 truncate">Live Preview</h3>
                      <p className="text-xs text-slate-500 hidden sm:block">Changes update in real-time</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="bg-slate-100 p-2 sm:p-3 md:p-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <iframe
                    title="email-preview"
                    sandbox=""
                    className="w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] xl:h-[650px]"
                    srcDoc={generateHtml(emailTemplates[selectedTemplate])}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Test Email Modal */}
      <TestEmailModal
        isOpen={showTestEmailModal}
        templateKey={selectedTemplate}
        context={context || ''}
        onClose={() => setShowTestEmailModal(false)}
        showToast={toast}
      />
    </div>
  );
};

export default EmailTemplates;
