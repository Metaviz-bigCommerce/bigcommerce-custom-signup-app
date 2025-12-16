/**
 * Caching utilities using Next.js unstable_cache
 */

import { unstable_cache } from 'next/cache';

// Cache configuration
const CACHE_REVALIDATE_TIME = 300; // 5 minutes

/**
 * Cache store form settings
 */
export async function getCachedStoreForm(storeHash: string, fetchFn: () => Promise<any>) {
  return unstable_cache(
    async () => fetchFn(),
    [`store-form-${storeHash}`],
    {
      revalidate: CACHE_REVALIDATE_TIME,
      tags: [`store-form-${storeHash}`],
    }
  )();
}

/**
 * Cache email templates
 */
export async function getCachedEmailTemplates(storeHash: string, fetchFn: () => Promise<any>) {
  return unstable_cache(
    async () => fetchFn(),
    [`email-templates-${storeHash}`],
    {
      revalidate: CACHE_REVALIDATE_TIME,
      tags: [`email-templates-${storeHash}`],
    }
  )();
}

/**
 * Cache store settings
 */
export async function getCachedStoreSettings(storeHash: string, fetchFn: () => Promise<any>) {
  return unstable_cache(
    async () => fetchFn(),
    [`store-settings-${storeHash}`],
    {
      revalidate: CACHE_REVALIDATE_TIME,
      tags: [`store-settings-${storeHash}`],
    }
  )();
}

