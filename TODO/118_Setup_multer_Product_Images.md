Choosing **Path A** is a smart move. It allows us to master the file-handling logic in Express before we worry about network latency or cloud API keys. Since you're on Arch, we also need to be mindful of file system permissions.

Before we write the code, I need to see your current `Product` model one last time to decide if we should allow **multiple images** or just a **single primary image**. Most e-commerce sites prefer an array of images.

### 🛠️ Step 0: Preparation Commands

Run these in your terminal to set up the environment:

```bash
# 1. Install Multer and its types (since we are in TypeScript)
npm install multer
npm install -D @types/multer

# 2. Create the storage directory
mkdir -p public/uploads
```

---

### 🛠️ Step 1: Update the Schema

We need to store the file path (the URL) in the database.

**Please run `cat ./prisma/schema.prisma` and check the Product model.** I recommend adding this:

```prisma
model Product {
  // ... existing fields
  images    ProductImage[] // Better for future-proofing
}

model ProductImage {
  id        String   @id @default(uuid())
  url       String   // This will store "public/uploads/filename.jpg"
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

---

### 🛠️ Step 2: Information Request

To build the "Local Upload" middleware, I need to know a few things about your project structure:

1. **Current Product Controller:** Run `cat ./src/controllers/product.controller.ts`. I need to see how your `createProduct` controller is currently structured to inject the image logic.
2. **Existing Schemas:** Run `cat ./src/schemas/product.schema.ts`. We need to figure out how to validate "multipart/form-data" (which is what files use) because it's different from standard JSON.

### 📋 The Game Plan for this Sprint

- **The Utility:** Create a `fileUpload.ts` utility using Multer to handle disk storage and file filtering (e.g., only `.jpg`, `.png`).
- **The Static Server:** Update `app.ts` to serve the `public/uploads` folder so you can actually see the images in your browser at `http://localhost:3000/uploads/image.jpg`.
- **The Linking:** Update the `createProduct` service to save the file paths returned by Multer.

**Run those two `cat` commands and the `npm install`, then we’ll build the first version of the uploader.**
