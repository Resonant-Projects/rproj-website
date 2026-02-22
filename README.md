# 🎨 Resonant Projects .ART

> **A creative technology studio—your hub for tech consulting, mixing &
> mastering, photography, and short film finishing.**  
> Bringing together technical expertise and artistic vision to help creators
> finish and present their work at the highest level.

---

[![Website](https://img.shields.io/badge/Visit%20Live%20Site-resonantprojects.art-556bf2?style=flat-square&logo=vercel&logoColor=white)](https://www.resonantprojects.art)
[![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Resonant-Projects/rproj-website?labelColor=171717&color=FF570A&label=CodeRabbit+Reviews)](https://coderabbit.ai)

---

## ✨ What is Resonant Projects .ART?

Resonant Projects .ART is a multidisciplinary platform by Keith Elliott,
designed to help artists, creators, and businesses finish and elevate their
creative and technical projects.  
Whether you're a musician, filmmaker, photographer, or content creator, this is
your one-stop shop for:

- 🎚️ **Audio Mixing & Mastering**
- 📸 **Photography**
- 🎬 **Short Film Finishing**
- 💡 **Technology Consulting**

---

## 🚀 Key Features

- 🧑‍💻 **Multi-Service Platform:** Dedicated sections for audio, photography, video, and tech consulting.
- 🤝 **Personalized Collaboration:** Work directly with Keith to bring your vision to life.
- 🛠️ **Technical Expertise:** Deep knowledge in networking, home studio setup, and creative workflows.
- 🗂️ **Organized Content:** Easy navigation with clear service pages and content pillars.
- 📚 **Curated Resources:** A comprehensive collection of tools, tutorials, and references for creators.
- 📬 **Lead Generation:** Service-specific landing pages and newsletter signup.
- 🔍 **SEO Optimized:** Structured for discoverability and fast performance.
- ⚡ **Automated Deployment:** Every commit updates the live site automatically.

---

## 📚 Resources Section

The Resources section provides a curated collection of tools, tutorials, and references specifically selected for creators, musicians, and audio professionals. Features include:

- **Categorized Content:** Resources organized by type (tools, tutorials, references) and category (audio, video, photography, tech)
- **Smart Search:** Find exactly what you need with our powerful search functionality
- **Skill Level Filtering:** Resources tagged by difficulty level (Beginner, Intermediate, Advanced)
- **Regular Updates:** Content is regularly reviewed and updated to ensure relevance
- **Personal Recommendations:** Hand-picked resources that Keith personally uses and recommends

Access the Resources section at: [https://www.resonantprojects.art/resources](https://www.resonantprojects.art/resources)

---

## 🌐 Live Site

[https://www.resonantprojects.art](https://www.resonantprojects.art)

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Astro 5, React 19 (interactive islands) |
| **Styling** | Tailwind CSS 4, Starwind UI, PostCSS |
| **Content** | Notion API (CMS), MDX, Remark/Rehype pipeline |
| **Media** | Cloudinary (image CDN), Sharp |
| **Search & SEO** | Pagefind, Astro Sitemap, RSS, structured metadata |
| **Email** | React Email, Resend |
| **Scheduling** | Cal.com embed |
| **Analytics** | Vercel Analytics, Vercel Speed Insights |
| **Testing** | Playwright, axe-core, Lighthouse |
| **Deployment** | Vercel, CI/CD from GitHub |
| **Language** | TypeScript |
| **Package Manager** | Bun |

---

## ✅ E2E Testing Setup

Before running Playwright e2e tests for resources/static-search journeys, refresh the Notion-backed fallback cache:

```bash
bun run resources:cache:refresh
```

Then run:

```bash
bun run test:e2e
```

If `src/content/resources-cache.json` is empty, the resources core-journey test intentionally fails fast with setup guidance.

---

## 📬 Contact

Questions, collaborations, or want to request a service?  
**Email Keith Elliott:**
[keith@resonantrhythm.com](mailto:keith@resonantrhythm.com)

---

## 🤝 Contributing

There are no formal contribution guidelines yet.  
If you'd like to help or collaborate, just reach out to Keith via email!

---

_Resonant Projects .ART: Helping you finish and share your creative work with the world!_ 🌍✨
