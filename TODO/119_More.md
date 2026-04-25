Excellent. You've got `multer` installed and the `ProductImage` model ready to go. Go ahead and run your migration first:

```bash
npx prisma migrate dev --name add_product_images
```

Once that's done, we have a unique challenge: **Zod and Multer don't play together perfectly** out of the box because files aren't part of the `req.body` until Multer processes them, and `zod` usually validates before that happens.

---

### 🛠️ Step 1: The Multer Utility (`./src/config/multer.ts`)

We need a configuration that tells Multer where to put the files and how to name them so they don't overwrite each other.

```ts
import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (_req, file, cb) => {
    // Creating a unique name: timestamp-originalName
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new AppError(
        "Only images (jpeg, jpg, png, webp) are allowed",
        400,
      ) as any,
      false,
    );
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
```

---

### 🛠️ Step 2: Update the Service (`./src/services/product.service.ts`)

We need to update `createProduct` to handle the image URLs.

```ts
export const createProduct = async (data: any, filePaths: string[] = []) => {
  const { categoryNames, ...productData } = data;

  return await prisma.product.create({
    data: {
      ...productData,
      categories: {
        connectOrCreate: categoryNames?.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
      // Link the uploaded file paths here
      images: {
        create: filePaths.map((path) => ({ url: path })),
      },
    },
    include: {
      categories: true,
      images: true,
    },
  });
};
```

---

### 🛠️ Step 3: Serve Static Files (`./src/app.ts`)

To actually see the images in a browser, Express needs to be told that the `public` folder is open for business.

```ts
import path from "path";
// ... inside app.ts, before routes
app.use("/uploads", express.static("public/uploads"));
```

---

### 🛠️ Step 4: Update the Route (`./src/routes/product.routes.ts`)

This is where the magic happens. We insert the `upload.array('images')` middleware **before** the controller, but **after** authentication.

```ts
import { upload } from "../config/multer.js";

// Update the POST route
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  upload.array("images", 5), // 'images' is the field name, max 5 files
  validate(CreateProductSchema), // Note: You might need to adjust validation!
  createProduct,
);
```

### ⚠️ The "Zod vs Multipart" Problem

When using `multipart/form-data`, everything (like `price` and `stock`) comes in as a **string**. Your Zod schema already uses `z.coerce.number()`, so it should handle it, but you'll need to send the data as **Form Data** in your tests/Postman, not JSON.

**Ready to try this?** Once you've updated the files, try a `curl` like this (using the `-F` flag for Form Data):

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=Retro Keyboard" \
  -F "description=Clicky and mechanical" \
  -F "price=120" \
  -F "stock=15" \
  -F "images=@/path/to/your/image.jpg"
```

Does this structure make sense, or should we walk through how `multer` intercepts the request more closely?
