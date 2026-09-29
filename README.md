# EduSphere - Modern Education Management Platform

EduSphere is a robust, premium web application for managing academic operations across Students, Faculty, and Administrators.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Radix UI, React Hook Form, Zod.
- **Backend:** Node.js, Express, TypeScript, Drizzle ORM.
- **Database:** PostgreSQL.
- **Security:** Helmet, express-rate-limit, JWT, bcrypt, strict role/permission checks.

## Production Deployment Wrap-Up

### Prerequisites
1. Node.js (v18+)
2. PostgreSQL Database instance (e.g., Neon, AWS RDS, or local pg instance)

### 1. Environment Setup

You need to provide `.env` files for both the frontend and backend.

**Backend (`Backend/.env`):**
```env
PORT=5000
NODE_ENV=production
# Update with your production PostgreSQL URL
DATABASE_URL=postgresql://user:pass@host:5432/db 
# Use a strong, randomly generated string for JWT
JWT_SECRET=your_super_secret_production_key_here
```

**Frontend (`Frontend/.env`):**
```env
# The URL of your production backend API
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Backend Deployment

1. **Install Dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Run Database Migrations:**
   Ensure your database is up to date with the latest schema.
   ```bash
   npm run db:push
   ```
   *(Optional)* If starting from scratch, seed initial admin credentials:
   ```bash
   npm run db:seed
   ```

3. **Build the Application:**
   Compile TypeScript to JavaScript.
   ```bash
   npm run build
   ```

4. **Start the Production Server:**
   ```bash
   npm run start
   ```
   *Note: In production, it is highly recommended to run the app using a process manager like **PM2** (`pm2 start dist/server.js --name "edusphere-api"`) or containerize it via **Docker**.*

### 3. Frontend Deployment

1. **Install Dependencies:**
   ```bash
   cd Frontend
   npm install
   ```

2. **Build for Production:**
   ```bash
   npm run build
   ```
   This will generate a `dist/` directory containing the minified and optimized production assets.

3. **Serve the Frontend:**
   The frontend is a static SPA (Single Page Application). You should serve the `dist/` folder using a web server such as **Nginx**, **Vercel**, **Netlify**, or **AWS S3/CloudFront**.
   
   If using Nginx, ensure you include a catch-all route redirecting to `index.html` to support React Router:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

### Post-Deployment Security Checklist
- [ ] Verify `Helmet` headers are actively stripping framework metadata (`X-Powered-By`).
- [ ] Verify CORS is configured to only allow requests from your production frontend URL (in `server.ts`).
- [ ] Ensure `JWT_SECRET` is complex and kept absolutely secret.
- [ ] Ensure `logger.ts` is active and actively stripping sensitive tokens/passwords from the production logs.
