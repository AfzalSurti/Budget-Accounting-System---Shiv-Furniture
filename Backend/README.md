# Shiv Furniture Budget Accounting Backend

Production-ready Node.js/Express API for the Budget Accounting System.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   copy .env.example .env
   ```
3. Generate Prisma client:
   ```bash
   npm run generate
   ```
4. Run migrations (if applicable):
   ```bash
   npx prisma migrate dev
   ```
5. Start the API:
   ```bash
   npm run dev
   ```

## Seed Data
```bash
npm run seed
```

Default admin user created by the seed script:
- Email: `admin@example.com`
- Password: `password`

## Docs
- Swagger UI: `http://localhost:4000/api-docs`

## Notes
- Admin registration is restricted via `/auth/register-admin` (requires Admin token).
- Portal registration uses `/auth/register` with role `PORTAL`.
