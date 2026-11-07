# CLAUDE.md — Vahweh Design

## 1. Project Overview

Project Name: Vahweh Design

Project Type: Premium Boutique / Fashion E-commerce Website

Brand Identity: Luxury, elegant, sophisticated and premium fashion.

This project is being developed for a shared hosting environment with limited server resources. All implementation decisions must prioritize performance, efficiency, resource optimization, security and hosting compatibility.

**IMPORTANT: Resource efficiency and production performance are mandatory development requirements, not optional improvements.**

Every time you write, modify, refactor or review code, follow the instructions in this document.

---

## 2. Hosting Environment and Server Limitations

The website will be hosted on a shared hosting server with the following specifications.

### Storage and Bandwidth

- NVMe SSD Disk Space: 1 GB
- Monthly Bandwidth: 100 GB
- File/Inode Limit: 100,000 files
- Email Account Storage: 1 GB per account

### Server Resources

- CPU: 1 vCore
- RAM: 2 GB
- IOPS: 4 MB (as specified by the hosting provider; exact unit and measurement must be verified)
- Application Limit: 2 applications

### Hosting Environment

- Control Panel: cPanel
- Node.js Selector: v6 to v22
- Python Selector: v2.7 to v3.9
- PHP Selector: v7.4 to v8.4
- Security: Imunify360 malware protection
- SSL: AutoSSL certificate
- Unlimited Subdomains, Parked Domains and 1 Addon Domain
- Unlimited FTP Accounts
- Unlimited Databases

Important:

The available version selectors do not automatically guarantee that every runtime, module, extension or feature is enabled for this account.

Never assume that SSH, cron jobs, shell access, background workers, specific Apache modules, LiteSpeed, Redis, database engines or other server capabilities are available.

Verify actual hosting capabilities before depending on them.

Do not design the application as if it is running on a VPS, dedicated server or cloud infrastructure with unlimited resources.

---

## 3. Highest Priority: Code Optimization

Every implementation must follow these principles.

### General Rules

1. Write only essential code.
2. Avoid unnecessary dependencies.
3. Avoid unnecessary abstractions and excessive helper functions.
4. Reuse existing components and styles.
5. Avoid duplicate functionality.
6. Avoid unnecessary files.
7. Avoid unnecessary background processes.
8. Avoid expensive operations.
9. Keep implementations straightforward and maintainable.
10. Prefer simple solutions over complex architectures.

Do not introduce additional technologies unless they solve a genuine project requirement.

Before installing any package or library, evaluate whether the functionality can be implemented efficiently using existing technologies.

### Performance Philosophy

Prioritize:

- Low CPU consumption.
- Low memory consumption.
- Minimal disk usage.
- Efficient network requests.
- Minimal HTTP requests where practical.
- Fast initial page rendering.
- Optimized image delivery.
- Efficient JavaScript execution.
- Minimal third-party dependencies.

A visually impressive website must not come at the cost of unnecessary resource consumption.

---

## 4. Frontend Technology Standards

The current frontend stack is:

- HTML5
- CSS3
- Vanilla JavaScript
- Bootstrap 5.3
- Font Awesome 6 where required

Do not introduce:

- React
- Vue
- Angular
- Next.js
- Nuxt
- Tailwind CSS
- Large frontend frameworks
- Unnecessary JavaScript build systems

Use existing technologies wherever possible.

### HTML

- Use semantic HTML5.
- Maintain clean document structure.
- Avoid unnecessary nested elements.
- Use appropriate accessibility attributes.
- Include image dimensions where possible to prevent layout shifts.
- Avoid unnecessary inline styles.

### CSS

- Keep CSS organized and reusable.
- Avoid duplicated selectors and declarations.
- Use CSS variables for the brand colour palette.
- Avoid unnecessarily complex selectors.
- Avoid excessive specificity.
- Avoid loading multiple CSS libraries.
- Remove unused styles when safely possible.
- Avoid excessive animations and transitions.
- Prefer CSS transitions over JavaScript animations where appropriate.

### JavaScript

- Prefer vanilla JavaScript.
- Use event delegation for repeated interactive elements where appropriate.
- Avoid repeatedly querying the same DOM elements unnecessarily.
- Avoid unnecessary event listeners.
- Avoid memory leaks.
- Avoid unnecessary polling and timers.
- Use `defer` for external scripts where appropriate.
- Keep scripts separated logically.
- Do not introduce heavy libraries for simple functionality.

Do not execute expensive JavaScript during initial page rendering unless necessary.

---

## 5. Brand Design System

All UI implementations must follow the Vahweh Design brand identity.

### Brand Colour Palette

- Ivory Cream: #F7EED8
- Soft Pearl: #FFF9EB
- Champagne Gold: #D4A13B
- Antique Gold: #B77A16
- Deep Bronze: #5B2E08
- Espresso Brown: #301600

Use these colours consistently.

### Typography

Primary font: Cormorant Garamond.

Use for:
- Main headings.
- Editorial headings.
- Collection titles.
- Premium brand statements.

Secondary font: Montserrat.

Use for:
- Body content.
- Navigation.
- Product information.
- Buttons.
- Labels.
- Interface elements.

Do not introduce additional font families without a clear requirement.

Load only necessary font weights and styles.

Use font fallbacks and appropriate font-display settings.

### Design Philosophy

The website must feel like a premium luxury fashion boutique.

Prioritize:
- Elegant typography.
- Proper spacing.
- Premium product presentation.
- Refined interactions.
- Responsive layouts.
- Consistent visual hierarchy.

Avoid excessive decorative elements, unnecessary shadows, bright colours and generic templates.

Never compromise performance for decorative effects.

---

## 6. Image and Asset Optimization

Images are one of the biggest potential sources of bandwidth and storage consumption.

Follow these rules strictly.

### Image Formats

Prefer:

1. AVIF where supported and practical.
2. WebP for optimized modern image delivery.
3. JPEG or PNG only when appropriate.

Do not use large PNG images for ordinary photographs.

Do not use unnecessarily high-resolution images.

### Image Loading

- Use `loading="lazy"` for below-the-fold images.
- Do not lazy-load the primary hero image.
- Use `fetchpriority="high"` for the main LCP image where appropriate.
- Use `decoding="async"` for non-critical images.
- Define image width and height.
- Use responsive `srcset` and `sizes` for important responsive image assets where practical.
- Avoid loading hidden or unused images unnecessarily.

### Image Guidelines

- Compress images before deployment.
- Avoid duplicate copies of the same image.
- Do not use oversized source images for small product thumbnails.
- Use appropriately sized product images.
- Avoid loading multiple unnecessary image galleries simultaneously.
- Keep hero image sizes optimized for their actual display dimensions.

Do not sacrifice product photography quality excessively, but always balance image quality and bandwidth.

### Asset Management

- Reuse existing assets.
- Avoid unnecessary duplicate files.
- Remove unused assets only after verifying they are not referenced elsewhere.
- Keep filenames meaningful.
- Avoid storing temporary files and unnecessary generated files in production.

---

## 7. JavaScript and Animation Optimization

The website includes a premium hero slider, product interactions, navigation drawer, wishlist and shopping cart.

All interactions must be efficient.

### Animation Rules

- Prefer CSS transitions and keyframe animations.
- Animate `transform` and `opacity` where possible.
- Avoid frequent layout recalculations.
- Avoid unnecessary continuous animations.
- Avoid large particle animation systems.
- Avoid unnecessary animation libraries.
- Respect `prefers-reduced-motion`.

### Slider

- Do not load unnecessary slider libraries.
- Prefer a lightweight vanilla JavaScript implementation.
- Avoid excessive autoplay intervals.
- Pause autoplay when the page is not visible.
- Avoid unnecessary image preloading.
- Load the first hero image with priority.
- Load subsequent slides efficiently.

### Event Handling

- Avoid attaching duplicate listeners.
- Use event delegation for dynamic product cards where appropriate.
- Clean up listeners and timers when necessary.
- Avoid unnecessary repeated DOM updates.

---

## 8. E-commerce and Shopping Cart Rules

The website uses WhatsApp-based ordering.

There is no traditional online payment gateway.

### Shopping Cart

The frontend shopping cart should:

- Use localStorage for basic cart persistence.
- Store only necessary product information.
- Update cart quantities efficiently.
- Avoid storing unnecessary duplicate data.
- Handle invalid or outdated cart data safely.
- Display a proper empty-cart state.

Do not store sensitive personal information in localStorage.

### WhatsApp Ordering

The final ordering process is through WhatsApp.

The generated message should include:

- Product names.
- Product prices.
- Selected sizes.
- Selected colours where applicable.
- Quantities.
- Total amount.

Use a configurable WhatsApp business number.

Use the official WhatsApp click-to-chat URL format.

Properly URL-encode messages.

Do not claim an order has been confirmed merely because WhatsApp was opened.

### Business Rules

Never introduce:

- Payment gateways.
- Online card processing.
- UPI payment processing.
- Fake payment confirmation.
- Unnecessary checkout functionality.

Unless explicitly requested, do not add backend order management or payment infrastructure.

---

## 9. cPanel Shared Hosting Compatibility

All code must be suitable for deployment on cPanel shared hosting.

### Frontend Deployment

The static website should be deployable through the cPanel document root.

Avoid requiring:

- A permanently running Node.js process.
- A frontend development server.
- A separate application server.
- Docker.
- Kubernetes.
- A VPS-only deployment configuration.

A build process may be used only if genuinely necessary and compatible with the available development and deployment workflow. The deployed frontend should not require a Node.js process to serve static HTML, CSS and JavaScript.

### Server Configuration

Do not blindly add server configuration directives.

Before using `.htaccess`, verify that the hosting environment supports the required Apache directives and that they are permitted.

Where supported, consider:

- Browser caching for static assets.
- GZIP or Brotli compression.
- Appropriate cache headers.
- HTTPS redirection.
- Security headers.

Never assume that a specific web server, caching module or compression module is enabled.

Avoid configuration changes that could make the website unavailable.

### Application Limits

The hosting plan allows two applications.

Avoid unnecessary separate applications.

Do not deploy multiple independent processes when a single application or static website is sufficient.

---

## 10. Storage, Bandwidth and File Usage

The hosting account has only 1 GB of disk space.

This is a strict constraint.

Avoid:

- Large dependency directories.
- Unnecessary package installations.
- Duplicate assets.
- Unused libraries.
- Large image collections.
- Unnecessary log files.
- Temporary generated files.
- Multiple copies of backups.
- Unnecessary cache files.

The hosting account has a 100,000-file inode limit.

Avoid creating excessive small files.

Do not introduce unnecessary package ecosystems that generate large numbers of dependency files.

The monthly bandwidth allowance is 100 GB.

Optimize image sizes, font loading, JavaScript, CSS and other static assets to reduce bandwidth usage.

Avoid unnecessary third-party network requests.

Do not automatically download large assets during every page load.

---

## 11. Security Standards

Security must be considered in every implementation.

### Frontend Security

- Avoid unsafe DOM insertion.
- Prefer `textContent` for untrusted text.
- Validate and sanitize user-controlled content appropriately.
- Avoid unsafe use of `innerHTML`.
- Do not expose secrets or private configuration.
- Avoid unnecessary third-party scripts.
- Use HTTPS for external integrations.
- Use safe URL handling.
- Do not trust client-side data for security-sensitive decisions.

### Cart Security

The frontend cart is not a trusted order database.

Product prices and quantities stored in localStorage can be modified by users.

Do not treat localStorage values as verified business records.

If server-side ordering is introduced later, all product prices, availability and quantities must be validated on the server.

### Server Security

- Keep private credentials outside publicly accessible files.
- Never commit API keys or passwords.
- Avoid exposing configuration files.
- Use appropriate file permissions.
- Do not disable hosting security protections.
- Follow cPanel security recommendations.

Imunify360 and AutoSSL are available, but they do not replace secure application code.

---

## 12. Third-Party Libraries and Dependencies

Before adding a library, ask:

1. Is it genuinely necessary?
2. Can existing technologies implement the same functionality?
3. What is its impact on page size?
4. Does it introduce additional runtime requirements?
5. Does it increase storage or inode usage?
6. Does it create unnecessary maintenance work?

Prefer lightweight alternatives.

Do not install dependencies simply because they are popular.

Avoid large animation, carousel and UI libraries when a small vanilla JavaScript implementation is sufficient.

For third-party CDN assets:

- Use reliable sources.
- Pin library versions.
- Load only required assets.
- Avoid loading duplicate versions.
- Use Subresource Integrity where supported and appropriate.
- Provide sensible fallbacks for essential functionality.

---

## 13. SEO and Page Performance

Every public-facing page should follow basic SEO and performance practices.

- Use descriptive page titles.
- Write meaningful meta descriptions.
- Use semantic headings.
- Add descriptive image alt attributes.
- Avoid duplicate page metadata.
- Use clean URLs where applicable.
- Prevent layout shifts.
- Optimize the initial viewport.
- Avoid unnecessary blocking scripts.
- Load non-critical assets efficiently.

Prioritize the following Core Web Vitals:

- Largest Contentful Paint (LCP).
- Interaction to Next Paint (INP).
- Cumulative Layout Shift (CLS).

Do not claim performance scores without actually measuring them.

---

## 14. Development Workflow and File Modification Rules

Before modifying any feature:

1. Inspect the existing implementation.
2. Understand the current file structure.
3. Identify reusable components and styles.
4. Identify existing functionality that must be preserved.
5. Determine the smallest appropriate change.

During implementation:

- Modify only relevant files.
- Avoid unnecessary refactoring.
- Do not duplicate existing functionality.
- Avoid creating unnecessary abstractions.
- Preserve working features.
- Maintain consistent naming.
- Keep code readable and maintainable.

Do not rewrite entire files when a small targeted modification is sufficient.

Do not remove functionality simply to make implementation easier.

---

## 15. Testing and Quality Assurance

After implementing a feature, perform appropriate checks.

### Frontend

- Verify HTML structure.
- Check browser console errors.
- Test responsive layouts.
- Check image loading.
- Verify CSS and JavaScript references.
- Check for horizontal overflow.
- Test interactive elements.
- Check keyboard accessibility.

### E-commerce

- Test Add to Cart.
- Test quantity updates.
- Test product removal.
- Test cart persistence.
- Test WhatsApp message generation.
- Verify price and total calculations.
- Test empty-cart behaviour.

### Performance

- Check image sizes.
- Check unnecessary network requests.
- Identify large assets.
- Avoid duplicate libraries.
- Check for unnecessarily expensive JavaScript.
- Review CSS and JavaScript loading behaviour.

Do not claim a feature has been tested if it has not actually been tested.

---

## 16. Important Rules for Claude Code

These rules take priority throughout development.

1. Always optimize code for the supplied shared hosting environment.
2. Prefer minimal, efficient and maintainable implementations.
3. Never introduce unnecessary frameworks or dependencies.
4. Never assume unlimited server resources.
5. Avoid unnecessary background processes.
6. Optimize images and static assets.
7. Preserve existing working functionality.
8. Avoid modifying unrelated files.
9. Follow the Vahweh Design colour palette and typography.
10. Maintain premium design quality without sacrificing performance.
11. Verify hosting compatibility before relying on server capabilities.
12. Never invent deployment capabilities or claim unverified configuration support.
13. Explain any important trade-offs before introducing resource-intensive solutions.
14. If a requirement cannot be implemented efficiently within the hosting limits, explain the limitation and propose a lighter alternative.
15. Prioritize production reliability over unnecessary technical complexity.

---

## 17. Final Development Philosophy

Vahweh Design must deliver a premium boutique shopping experience while operating efficiently on a resource-limited shared hosting plan.

The objective is not to build the most technically complex application.

The objective is to build a website that is:

- Beautiful.
- Fast.
- Lightweight.
- Secure.
- Responsive.
- Maintainable.
- Hosting-compatible.
- Efficient with storage and bandwidth.

**Remember: Premium user experience does not require heavy code. Write the simplest efficient solution that meets the requirement without compromising design quality or reliability.**