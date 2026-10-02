const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://maps.googleapis.com https://*.paystack.co https://*.stanbicbank.com.gh https://*.advansistechnologies.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https://cdn.enter.pro https://res.cloudinary.com https://images.unsplash.com https://*.googleusercontent.com https://*.stanbicbank.com.gh https://*.advansistechnologies.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https: wss: http://localhost:*",
  "frame-src 'self' https://*.paystack.co https://*.stanbicbank.com.gh https://*.advansistechnologies.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https:",
  "upgrade-insecure-requests", // Strictly value-less per RFC / W3C CSP spec (fixes Veracode 6.5 Medium)
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
