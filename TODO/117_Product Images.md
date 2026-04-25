Moving to **Product Images** is a massive upgrade for your API. Since you mentioned you aren't familiar with this area yet, it’s the perfect time to shift from "Logic" to "Infrastructure."

Before we close this session, let's talk about the architecture of image handling.

---

## 🖼️ How Image Uploads Work

In a modern backend, we **never** store raw image data (binary) directly in the database. It makes the DB slow and massive. Instead, we use a "File Store."

### The Workflow

1. **The Request:** The user sends a `POST` request containing the image file.
2. **The Middleware (Multer):** Your Express app uses a tool called **Multer** to catch the file as it streams in.
3. **The Upload:** Your code sends that file to a Cloud provider (like **Cloudinary** or **AWS S3**).
4. **The Link:** The provider gives you back a **URL** (e.g., `https://cloudinary.com/nabil/clock.jpg`).
5. **The Database:** You save that **URL** string in your Prisma `Product` model.

---

## 🛠️ Prep for Next Session

To get ready for the next sprint, we have two paths. **Which one sounds better to you?**

### Path A: The "Local" Start (Easier)

We store images in a `/public/uploads` folder on your local machine first. This is great for understanding how `Multer` works without needing API keys.

- **What you'll need:** Just `npm install multer`.

### Path B: The "Pro" Start (Cloudinary)

We go straight to the cloud. Cloudinary has a great free tier and a nice Node.js SDK.

- **What you'll need:** You'll need to create a free account at [Cloudinary](https://cloudinary.com/) and get your `CLOUD_NAME`, `API_KEY`, and `API_SECRET`.

---

## 📋 Checklist Review

We didn't forget anything major, but since we just added Categories, the **only** missing piece in the "Discovery" section is:

- [ ] **Filtering by Category:** (e.g., `GET /api/products?category=Electronics`).

**My Suggestion:** Let's tackle **Filtering** at the start of next session as a "warm-up" (it's quick Prisma logic), and then spend the rest of the time on **Image Uploads**.

### To-Do for the break

1. **Prisma Clean-up:** Make sure you ran the `rm -rf node_modules/.prisma && npx prisma generate` command to fix that flaky test error.
2. **Decision:** Choose **Path A** or **Path B** for the images.

How does that sound for a plan? Ready to log off and enjoy the "100% green" test suite?
