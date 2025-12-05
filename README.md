# Chronos - GitHub Unwrapped 🚀

A minimal, serverless web application that generates a beautiful "GitHub Unwrapped" summary of your coding year. Built with Next.js, TypeScript, and Tailwind CSS.

![Chronos Preview](https://via.placeholder.com/800x400/0a0a0f/10b981?text=Chronos+GitHub+Unwrapped)

## ✨ Features

- **🎯 Comprehensive Stats**: Total contributions, top languages, coding streaks, and more
- **🌙 Dark Theme**: Premium terminal-inspired design with beautiful gradients
- **📱 Responsive**: Works perfectly on desktop and mobile devices
- **🚀 Fast**: Serverless architecture with intelligent caching
- **🔒 Secure**: OAuth authentication with minimal required permissions
- **📤 Shareable**: Generate beautiful cards optimized for social media

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: NextAuth.js with GitHub OAuth
- **API**: GitHub GraphQL API v4
- **Animations**: Framer Motion
- **Caching**: Redis (Upstash) + in-memory fallback
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd chronos-github-unwrapped
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# GitHub OAuth App Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: Redis for production caching
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Development Mode (uses in-memory cache)
DEV_MODE=true
```

### 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Chronos GitHub Unwrapped
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📊 Statistics Included

Your GitHub Unwrapped includes:

| Statistic | Description | Example |
|-----------|-------------|---------|
| **Total Contributions** | Sum of commits, issues, PRs, and reviews | 5,342 Total Contributions |
| **Top Language** | Most used programming language | Your 2025 language is TypeScript |
| **Longest Streak** | Maximum consecutive days of contributions | You went on a 98-Day coding streak! |
| **Most Active Time** | Hour with highest contribution volume | You are a 10 PM developer |
| **Commit Breakdown** | Percentage of different contribution types | 82% of your work was Commits |
| **Busiest Day** | Single day with most contributions | Your busiest day was Nov 12th |
| **Sleep Efficiency** | Average coding session duration | You code in 6.4 hour bursts |

## 🎨 Design System

Chronos uses a carefully crafted design system:

- **Colors**: Deep blue/purple base with bright orange/green accents
- **Typography**: Inter for UI, JetBrains Mono for code
- **Theme**: Dark mode with terminal-inspired aesthetics
- **Animations**: Smooth transitions with Framer Motion

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
DEV_MODE=false
```

## 🔧 Configuration

### Caching Strategy

- **Development**: In-memory cache (6 hours TTL)
- **Production**: Redis with in-memory fallback
- **Rate Limiting**: Respects GitHub API limits with intelligent caching

### Security Features

- OAuth-only authentication
- No permanent token storage
- Minimal required GitHub permissions
- CSRF protection via NextAuth.js

## 📈 Performance

- **Data Processing**: < 7 seconds for average user
- **Caching**: 6-hour cache TTL reduces API calls
- **Bundle Size**: Optimized with Next.js automatic splitting
- **Lighthouse Score**: 90+ on all metrics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Spotify Wrapped and similar year-end summaries
- Built with love for the developer community
- Special thanks to GitHub for their excellent GraphQL API

---

**Made with ❤️ by the Chronos Team**

[Live Demo](https://chronos-github-unwrapped.vercel.app) • [Report Bug](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues)
