import type { MetadataRoute } from 'next';

const BASE_URL = 'https://vindecoder-391.pages.dev';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/dashboard/',
                    '/api/',
                    '/report',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
