# Koa TypeScript Starter

A production-ready Koa API server with TypeScript, background workers, email templates, and PDF report generation.

## Features

- 🚀 TypeScript with strict type checking
- 🔄 Background job processing with BullMQ/Redis
- 📧 Email templating with Handlebars
- 📊 PDF report generation with Puppeteer
- 🗄️ Database integration with TypeORM
- 🛣️ Structured routing and controllers
- 🔒 Authentication middleware
- 📝 Logging with Winston
- 🐳 Docker ready

## Quick Start

1. **Install dependencies**

```bash
npm install
```

1. **Setup environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

1. **Run in development**

```bash
npm run dev
```

1. **Start Redis**

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine
```

1. **Build for production**

```bash
npm run build
npm start
```

## Project Structure

See the main README for detailed structure explanation.

### API Endpoints

- `GET /health` - Health check
- `POST /api/reports/invoice` - Generate PDF invoice
- `POST /api/emails/welcome` - Send welcome email
- `POST /api/reports/queue` - Queue report generation

### Workers

- Email worker: Processes email sending jobs
- Report worker: Processes PDF generation jobs

## License

MIT
