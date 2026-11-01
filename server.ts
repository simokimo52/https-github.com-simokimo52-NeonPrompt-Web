import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getCategories,
  getAllPrompts,
  getPromptBySlug,
  filterPrompts,
  validateEmail,
  validateContactPayload,
  generateSitemapXml,
  auditPromptSecurity,
  estimateTokens,
} from './src/lib/promptEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newsletterSubscribers = new Set<string>(['architect@neonprompt.ai', 'secops@neonprompt.ai']);
const contactSubmissions: Array<{
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}> = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '256kb' }));

  // Security headers matching vercel.json (without X-Frame-Options: DENY so AI Studio preview iframe works)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (req.path.startsWith('/api/')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    }
    next();
  });

  // Health & Telemetry API
  app.get('/api/health', (_req, res) => {
    const categories = getCategories();
    const prompts = getAllPrompts();
    res.json({
      status: 'ok',
      service: 'NeonPrompt Engine',
      counts: {
        categories: categories.length,
        subcategories: categories.reduce((sum, c) => sum + c.subcategories.length, 0),
        prompts: prompts.length,
        subscribers: newsletterSubscribers.size,
        contactSubmissions: contactSubmissions.length,
      },
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Paginated & Multi-Facet Filtered Prompts API
  app.get('/api/prompts', (req, res) => {
    const result = filterPrompts({
      query: typeof req.query.q === 'string' ? req.query.q : undefined,
      categorySlug: typeof req.query.category === 'string' ? req.query.category : undefined,
      subcategorySlug: typeof req.query.subcategory === 'string' ? req.query.subcategory : undefined,
      model: typeof req.query.model === 'string' ? req.query.model : undefined,
      difficulty: typeof req.query.difficulty === 'string' ? req.query.difficulty : undefined,
      sortBy:
        typeof req.query.sort === 'string' &&
        ['popular', 'rating', 'tokens-asc', 'tokens-desc', 'newest'].includes(req.query.sort)
          ? (req.query.sort as 'popular' | 'rating' | 'tokens-asc' | 'tokens-desc' | 'newest')
          : 'popular',
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 24,
    });
    res.json(result);
  });

  // Single Prompt Lookup API
  app.get('/api/prompts/:slug', (req, res) => {
    const prompt = getPromptBySlug(req.params.slug);
    if (!prompt) {
      res.status(404).json({ error: 'Prompt not found', slug: req.params.slug });
      return;
    }
    res.json(prompt);
  });

  // Prompt Security Audit & Token Estimator API
  app.post('/api/audit', (req, res) => {
    const promptText = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
    const audit = auditPromptSecurity(promptText);
    const tokens = estimateTokens(promptText);
    res.json({ tokens, audit });
  });

  // Newsletter Subscription API with strict sanitization
  app.post('/api/newsletter', (req, res) => {
    const check = validateEmail(req.body?.email);
    if (!check.valid) {
      res.status(400).json({ ok: false, error: check.error || 'Invalid email address.' });
      return;
    }
    const alreadySubscribed = newsletterSubscribers.has(check.sanitized);
    newsletterSubscribers.add(check.sanitized);
    res.json({
      ok: true,
      email: check.sanitized,
      alreadySubscribed,
      totalSubscribers: newsletterSubscribers.size,
      message: alreadySubscribed
        ? 'This email is already subscribed to the weekly prompt engineering dispatch.'
        : 'Subscribed to the weekly NeonPrompt engineering dispatch.',
    });
  });

  // Contact Submission API with strict sanitization
  app.post('/api/contact', (req, res) => {
    const validation = validateContactPayload(req.body || {});
    if (!validation.valid) {
      res.status(400).json({ ok: false, errors: validation.errors });
      return;
    }
    const entry = {
      id: `msg-${Date.now()}`,
      ...validation.sanitized,
      createdAt: new Date().toISOString(),
    };
    contactSubmissions.unshift(entry);
    if (contactSubmissions.length > 200) {
      contactSubmissions.pop();
    }
    res.json({
      ok: true,
      submission: entry,
      message: 'Your inquiry has been sanitized, logged, and routed to the NeonPrompt engineering team.',
    });
  });

  // Dynamic XML Sitemap
  app.get('/sitemap.xml', (_req, res) => {
    const baseUrl = process.env.APP_URL || 'https://neonprompt.ai';
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(generateSitemapXml(baseUrl, 5000));
  });

  // Dynamic robots.txt
  app.get('/robots.txt', (_req, res) => {
    const baseUrl = process.env.APP_URL || 'https://neonprompt.ai';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeonPrompt server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NeonPrompt server:', err);
  process.exit(1);
});
