**PRP: The Crown Shop – “Merch & Art Store”**

---

## **1\. Product Context & Goals**

- **Problem**: Our merch store is static and disconnected from the artist ecosystem—fans can’t easily find artist-branded merch or complete purchases in a seamless flow.

- **Who**: Fans looking to buy apparel, art prints, limited editions, and tie their purchases directly to their favorite AI artists.

- **User Story**:

  As a fan, I want to browse curated merchandise by category and artist, add items to my cart, and complete checkout in a fast, intuitive experience so I can support my favorite virtual artists.

## **2\. Success Metrics**

- **Store Conversion Rate** ≥ 3% of visitors

- **Average Order Value (AOV)** ≥ $45

- **Cart Abandonment Rate** ≤ 60%

## **3\. Feature Specifications**

| User Story                                                      | Acceptance Criteria                                                                                                                                                                                                                           |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browse merch by category with artist-specific filtering.        | 1\. **CategoryCard** grid on `/shop` linking to `/shop/[category]` for “Apparel,” “Art Prints,” “Limited Editions,” “Music.” 2\. Category pages (`/shop/apparel`, etc.) display **ProductGrid** filtered by category and optional `?artist=`. |
| View product detail and select variants (size, color, edition). | 1\. **ProductDetail** page shows image carousel, title, description, price, variant selector (sizes/colors), real-time inventory count. 2\. “Add to Cart” respects selected variant and quantity (max ≤ inventory).                           |
| Manage cart contents and initiate checkout.                     | 1\. **ShoppingCart** drawer or page lists items with thumbnail, variant, unit price, quantity controls, subtotal. 2\. “Remove” button for each line; cart total updates dynamically.                                                          |
| Complete payment and shipping details in one flow.              | 1\. **CheckoutForm** collects shipping address, contact, payment method via Stripe Elements. 2\. “Place Order” triggers `/api/stripe/create-checkout-session` and redirects to Stripe’s hosted checkout.                                      |
| See confirmation and order summary after purchase.              | 1\. **OrderConfirmation** page shows order number, summary, shipping details, and download links for digital music products.                                                                                                                  |

### **Data & API**

- **Endpoints**:
  - `GET /api/products?category=&artist=&page=&limit=`

  - `GET /api/products/[slug]`

  - `POST /api/cart` → adds/updates cart items (stored in Redis via Upstash)

  - `GET /api/cart` → current cart

  - `POST /api/stripe/create-checkout-session` → returns checkout URL

  - `GET /api/orders/[id]` → order details

- **DB Tables**:
  - `products` (fields: `id`, `name`, `slug`, `category`, `price`, `images[]`, `variants` JSONB, `inventory_count`, `artist_id`)

  - `orders` (fields: `id`, `user_id`, `items` JSONB, `total_amount`, `status`, `created_at`)

### **Components**

- **CategoryCard** (Server)

- **ProductGrid** (Server)

- **ProductDetail** (Server)

- **ShoppingCart** (Client)

- **CheckoutForm** (Client)

- **OrderConfirmation** (Server)

## **4\. Prompt Examples for UI Generation**

- **CategoryCard**

  “Create a Next.js 15 Server Component `CategoryCard` using shadcn/ui Card. Props: `{ title: string; description: string; image: string; href: string }`. Render an image overlay with title and description, linking to `href`.”

- **ProductGrid**

  “Generate a Server Component `ProductGrid` that fetches `/api/products` with optional filters and renders a responsive grid of `ProductCard` items.”

- **ProductDetail**

  “Build a Server Component `ProductDetail` in TypeScript that accepts a product slug, fetches `/api/products/[slug]`, and displays an image carousel (using shadcn/ui Carousel), variant selectors (size, color), and an ‘Add to Cart’ button.”

- **ShoppingCart**

  “Create a React 19 client component `ShoppingCart` as a slide-in drawer. It should fetch `/api/cart`, list line items with thumbnail, title, variant, quantity controls, subtotal, and a ‘Checkout’ button.”

- **CheckoutForm**

  “Generate a client component `CheckoutForm` using Stripe Elements (`@stripe/react-stripe-js`). Collect name, address fields, email, and payment card, then call `POST /api/stripe/create-checkout-session` on submit.”

- **OrderConfirmation**

  “Create a Server Component `OrderConfirmation` that reads an order ID from the URL, fetches `/api/orders/[id]`, and displays order number, line items with thumbnails, totals, shipping info, and download links for digital products.”
