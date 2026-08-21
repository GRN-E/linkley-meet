# LINKLEY

Мэргэжлийн хүнээс зөвлөгөө авах, хамтдаа бүтээх талбар.

React 18 + Vite 5 + Supabase. Vercel дээр байршдаг.

## Deploy

```bash
cd ~/Downloads/linkley-meet
git init
git remote add origin https://github.com/GRN-E/linkley-meet.git
git checkout -b main
git add .
git commit -m "Update site"
git push -u origin main --force
```

Дэлгэрэнгүйг `DEPLOY.md`-ээс үзнэ үү.

## Local preview (заавал биш)

```bash
npm install
npm run dev
```

## Бүтэц

| Зам | Хуудас |
|---|---|
| `/` | Нүүр |
| `/about` | Бидний тухай |
| `/browse` | Мэргэжилтэн хайх |
| `/projects` | Төслүүд |
| `/points` | Point багц |
| `/messages` | Мессеж |
| `/expert/profile` | Мэргэжилтний профайл засах |
| `/dashboard` | Хяналтын самбар |
