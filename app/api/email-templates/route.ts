import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { errorResponse, successResponse, apiErrors } from '@/lib/api-response';
import { emailTemplatesSchema, sharedBrandingSchema } from '@/lib/validation';
import { generateRequestId } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { getCachedEmailTemplates } from '@/lib/cache';

export async function GET(req: NextRequest) {
	const requestId = generateRequestId();
	const logContext = { requestId };
	
	try {
		const session = await getSession(req);
		if (!session) {
			return apiErrors.unauthorized(requestId);
		}
		
		const { storeHash } = session;
		
	// Use cached email templates
	const templates = await getCachedEmailTemplates(storeHash, () => db.getEmailTemplates(storeHash));
	
	// Fetch shared branding separately
	let sharedBranding = await db.getSharedBranding(storeHash);
	
	// Sanitize any Brevo proxy URLs that may exist in the database
	// This handles legacy data that was saved before the sanitization was added
	if (sharedBranding && sharedBranding.socialLinks && Array.isArray(sharedBranding.socialLinks)) {
		let needsUpdate = false;
		const sanitizedLinks = sharedBranding.socialLinks.map((social: any) => {
			// Check if iconUrl contains Brevo/Sendinblue tracking domain
			if (social.iconUrl && (social.iconUrl.includes('sendibt2.com') || social.iconUrl.includes('brevo.com'))) {
				needsUpdate = true;
				logger.warn('Found legacy Brevo proxy URL, regenerating', { 
					...logContext, 
					platform: social.name 
				});
				
				// Auto-detect platform and generate fresh icon URL
				const name = (social.name || '').toLowerCase().trim();
				const url = (social.url || '').toLowerCase();
				
				// Return proper icon URL based on platform
				if (name.includes('facebook') || url.includes('facebook.com') || url.includes('fb.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/facebook-new.png' };
				}
				if (name.includes('twitter') || name.includes('x ') || url.includes('twitter.com') || url.includes('x.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/twitter--v1.png' };
				}
				if (name.includes('instagram') || url.includes('instagram.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/instagram-new.png' };
				}
				if (name.includes('linkedin') || url.includes('linkedin.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/linkedin.png' };
				}
				if (name.includes('youtube') || url.includes('youtube.com') || url.includes('youtu.be')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/youtube-play.png' };
				}
				if (name.includes('tiktok') || url.includes('tiktok.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/tiktok--v1.png' };
				}
				if (name.includes('pinterest') || url.includes('pinterest.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/pinterest.png' };
				}
				if (name.includes('snapchat') || url.includes('snapchat.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/snapchat.png' };
				}
				if (name.includes('reddit') || url.includes('reddit.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/reddit.png' };
				}
				if (name.includes('discord') || url.includes('discord.com') || url.includes('discord.gg')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/discord-logo.png' };
				}
				if (name.includes('github') || url.includes('github.com')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/github--v1.png' };
				}
				if (name.includes('whatsapp') || url.includes('whatsapp.com') || url.includes('wa.me')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/whatsapp.png' };
				}
				if (name.includes('telegram') || url.includes('telegram.org') || url.includes('t.me')) {
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/telegram-app.png' };
				}
				
				// Default fallback icon
				return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/share.png' };
			}
			
			return social;
		});
		
		// If we found and fixed any Brevo URLs, update the database
		if (needsUpdate) {
			sharedBranding = { ...sharedBranding, socialLinks: sanitizedLinks };
			await db.setSharedBranding(storeHash, sharedBranding);
			logger.info('Auto-fixed legacy Brevo proxy URLs in social links', { ...logContext, storeHash });
		}
	}
	
	return successResponse({ templates, sharedBranding: sharedBranding || null }, 200, requestId);
	} catch (error: unknown) {
		logger.error('Failed to get email templates', error, logContext);
		return apiErrors.internalError('Failed to retrieve email templates', error, requestId);
	}
}

export async function POST(req: NextRequest) {
	const requestId = generateRequestId();
	const logContext = { requestId };
	
	try {
		const session = await getSession(req);
		if (!session) {
			return apiErrors.unauthorized(requestId);
		}
		
		const { storeHash } = session;
		
		// Parse and validate request body
		let body: unknown;
		try {
			body = await req.json();
		} catch {
			return errorResponse('Invalid JSON in request body', 400, 'VALIDATION_ERROR' as any, requestId);
		}
		
		const { templates, sharedBranding } = body as { templates?: unknown; sharedBranding?: unknown };
		
		// Validate and save templates if provided
		if (templates) {
			const validation = emailTemplatesSchema.safeParse(templates);
			if (!validation.success) {
				return errorResponse(
					`Validation error: ${validation.error.issues.map(e => e.message).join(', ')}`,
					400,
					'VALIDATION_ERROR' as any,
					requestId
				);
			}
			await db.setEmailTemplates(storeHash, validation.data);
		}
		
	// Validate and save shared branding if provided
	if (sharedBranding !== undefined) {
		const brandingValidation = sharedBrandingSchema.safeParse(sharedBranding);
		if (!brandingValidation.success) {
			return errorResponse(
				`Shared branding validation error: ${brandingValidation.error.issues.map(e => e.message).join(', ')}`,
				400,
				'VALIDATION_ERROR' as any,
				requestId
			);
		}
		
		// Sanitize social links: Remove Brevo proxy URLs and regenerate proper icon URLs
		// Brevo automatically proxies images through their tracking domain (sendibt2.com)
		// These proxy URLs only work in emails sent through Brevo, not in previews or direct access
		const sanitizedBranding = { ...brandingValidation.data };
		if (sanitizedBranding.socialLinks && Array.isArray(sanitizedBranding.socialLinks)) {
			sanitizedBranding.socialLinks = sanitizedBranding.socialLinks.map((social: any) => {
				// Check if iconUrl contains Brevo/Sendinblue tracking domain
				if (social.iconUrl && (social.iconUrl.includes('sendibt2.com') || social.iconUrl.includes('brevo.com'))) {
					// Regenerate the icon URL based on platform name
					logger.warn('Detected and removed Brevo proxy URL from social icon', { 
						...logContext, 
						platform: social.name,
						oldUrl: social.iconUrl
					});
					
					// Auto-detect platform and generate fresh icon URL
					const name = (social.name || '').toLowerCase().trim();
					const url = (social.url || '').toLowerCase();
					
					// Return proper icon URL based on platform (using icons8.com for reliability)
					if (name.includes('facebook') || url.includes('facebook.com') || url.includes('fb.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/facebook-new.png' };
					}
					if (name.includes('twitter') || name.includes('x ') || url.includes('twitter.com') || url.includes('x.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/twitter--v1.png' };
					}
					if (name.includes('instagram') || url.includes('instagram.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/instagram-new.png' };
					}
					if (name.includes('linkedin') || url.includes('linkedin.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/linkedin.png' };
					}
					if (name.includes('youtube') || url.includes('youtube.com') || url.includes('youtu.be')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/youtube-play.png' };
					}
					if (name.includes('tiktok') || url.includes('tiktok.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/tiktok--v1.png' };
					}
					if (name.includes('pinterest') || url.includes('pinterest.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/pinterest.png' };
					}
					if (name.includes('snapchat') || url.includes('snapchat.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/snapchat.png' };
					}
					if (name.includes('reddit') || url.includes('reddit.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/reddit.png' };
					}
					if (name.includes('discord') || url.includes('discord.com') || url.includes('discord.gg')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/discord-logo.png' };
					}
					if (name.includes('github') || url.includes('github.com')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/github--v1.png' };
					}
					if (name.includes('whatsapp') || url.includes('whatsapp.com') || url.includes('wa.me')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/whatsapp.png' };
					}
					if (name.includes('telegram') || url.includes('telegram.org') || url.includes('t.me')) {
						return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/telegram-app.png' };
					}
					
					// Default fallback icon
					return { ...social, iconUrl: 'https://img.icons8.com/color/24/000000/share.png' };
				}
				
				return social;
			});
		}
		
		await db.setSharedBranding(storeHash, sanitizedBranding);
	}
		
		logger.info('Email templates updated', { ...logContext, storeHash });
		
		return successResponse({ updated: true }, 200, requestId);
	} catch (error: unknown) {
		logger.error('Failed to update email templates', error, logContext);
		return apiErrors.internalError('Failed to update email templates', error, requestId);
	}
}


