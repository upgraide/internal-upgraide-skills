# Asset Generation Examples

## Image Generation Examples

### Example 1: Office Workspace B-roll

**Context:** Script discusses "productivity in modern workspaces"

**Prompt:**
```
"clean modern office workspace with MacBook Pro on wooden desk,
succulent plants in white ceramic pots, large window with soft natural lighting,
minimal clutter, professional interior photography, shallow depth of field,
warm color palette"
```

**Parameters:**
- Aspect ratio: `16:9`
- Category: `broll`
- Auto-extracted tags: `office`, `workspace`, `modern`, `laptop`, `plants`, `professional`

**Output:**
- File: `assets/generated/broll/office-workspace-20251117-143000.jpg`
- Size: ~2.1 MB
- Dimensions: 1920x1080
- Generation time: 45 seconds
- Cost: $0.02

**Usage:**
- Used as B-roll when narrator discusses "focus and productivity"
- Overlaid with caption: "Modern workspaces boost creativity"
- Duration: 5 seconds

---

### Example 2: Team Collaboration Scene

**Context:** Script mentions "building effective teams"

**Prompt:**
```
"diverse team of four people collaborating around a modern standing desk,
two laptops open, whiteboard with diagrams in background,
bright contemporary office with plants, natural window lighting,
professional business photography, candid authentic moment,
engaged expressions"
```

**Parameters:**
- Aspect ratio: `16:9`
- Category: `broll`
- Auto-extracted tags: `team`, `collaboration`, `office`, `meeting`, `professional`, `modern`

**Output:**
- File: `assets/generated/broll/team-collaboration-20251117-150000.jpg`
- Size: ~2.5 MB
- Dimensions: 1920x1080
- Generation time: 52 seconds
- Cost: $0.02

**Reuse:**
- Used in 3 subsequent videos about teamwork
- Total savings: $0.06 (3 videos × $0.02 saved)
- Instant retrieval via catalog search

---

### Example 3: Coffee Shop Ambiance

**Context:** Script discusses "finding focus in coffee shops"

**Prompt:**
```
"cozy independent coffee shop interior, wooden counter with espresso machine,
barista preparing latte art, warm Edison bulb lighting, plants on shelves,
exposed brick wall, customers working on laptops in background,
lifestyle photography, authentic atmosphere, shallow depth of field"
```

**Parameters:**
- Aspect ratio: `4:5` (portrait for Instagram feed compatibility)
- Category: `broll`
- Auto-extracted tags: `coffee`, `cafe`, `cozy`, `lifestyle`, `small-business`

**Output:**
- File: `assets/generated/broll/coffee-shop-20251117-153000.jpg`
- Size: ~1.8 MB
- Dimensions: 1080x1350
- Generation time: 48 seconds
- Cost: $0.02

**Quality notes:**
- Excellent natural lighting rendering
- Text on chalkboard menu visible and realistic
- Depth of field creates professional aesthetic

---

### Example 4: Abstract Gradient Background

**Context:** Need background for text overlay section

**Prompt:**
```
"soft gradient background transitioning from deep navy blue to cyan,
smooth clean aesthetic, no objects, minimal design,
professional backdrop for text overlay, even lighting, subtle texture"
```

**Parameters:**
- Aspect ratio: `9:16` (vertical for Reels)
- Category: `backgrounds`
- Auto-extracted tags: `abstract`, `background`, `gradient`, `minimal`, `clean`

**Output:**
- File: `assets/generated/backgrounds/gradient-blue-20251117-160000.jpg`
- Size: ~800 KB (smaller due to simplicity)
- Dimensions: 1080x1920
- Generation time: 35 seconds
- Cost: $0.02

**Reuse:**
- Generic enough for multiple videos
- Used in 7 videos for quote slides and text sections
- High reuse value due to versatility
- Total savings: $0.14

---

### Example 5: Product Mockup (Laptop)

**Context:** Showcasing a SaaS product dashboard

**Prompt:**
```
"MacBook Pro on clean white desk displaying colorful analytics dashboard,
minimal workspace, small succulent plant to the side, coffee mug,
soft natural lighting from left, professional product photography,
shallow depth of field focusing on screen, modern aesthetic"
```

**Parameters:**
- Aspect ratio: `16:9`
- Category: `products`
- Auto-extracted tags: `product`, `laptop`, `software`, `dashboard`, `professional`

**Output:**
- File: `assets/generated/products/laptop-dashboard-20251117-163000.jpg`
- Size: ~2.3 MB
- Dimensions: 1920x1080
- Generation time: 50 seconds
- Cost: $0.02

**Quality notes:**
- Screen content rendered clearly
- Professional composition suitable for marketing
- Realistic lighting and shadows

---

### Example 6: Storefront with Text

**Context:** Explaining a local business concept

**Prompt:**
```
"a modern storefront called \"Daily Grind Coffee\", large glass windows,
wooden door, hanging sign with coffee cup icon, plants by entrance,
bright daylight, professional architectural photography, street view,
welcoming atmosphere"
```

**Parameters:**
- Aspect ratio: `16:9`
- Category: `broll`
- Auto-extracted tags: `storefront`, `coffee`, `business`, `retail`
- **Force new:** Yes (specific text rendering needed)

**Output:**
- File: `assets/generated/broll/daily-grind-storefront-20251117-170000.jpg`
- Size: ~2.4 MB
- Dimensions: 1920x1080
- Generation time: 58 seconds (text rendering takes longer)
- Cost: $0.02

**Quality notes:**
- Text "Daily Grind Coffee" rendered accurately on sign
- Seedream-4's text generation capability showcased
- Specific enough that reuse unlikely (custom branding)

---

## Logo Extraction Examples

### Example 7: Sweetgreen Logo (First Request)

**Context:** Video reviewing healthy fast-casual restaurants

**Command:**
```bash
node servers/logodev/search-brand.js \
  --brand "Sweetgreen" \
  --size 128 \
  --format png \
  --theme light
```

**API Response:**
```json
{
  "success": true,
  "cached": false,
  "brand": "Sweetgreen",
  "domain": "sweetgreen.com",
  "logoUrl": "https://img.logo.dev/sweetgreen.com?token=...&size=128&format=png",
  "filePath": "assets/logos/sweetgreen.png",
  "alternatives": [
    { "name": "sweetgreen", "domain": "sweetgreen.com" }
  ],
  "catalogUpdated": true
}
```

**Result:**
- Downloaded to: `assets/logos/sweetgreen.png`
- File size: ~15 KB
- Time: 2.3 seconds
- Cost: Free (within rate limits)

**Catalog entry created:**
```json
{
  "id": "logo-sweetgreen",
  "type": "logo",
  "brand": "Sweetgreen",
  "domain": "sweetgreen.com",
  "filePath": "assets/logos/sweetgreen.png",
  "logoUrl": "https://img.logo.dev/sweetgreen.com?token=...",
  "format": "png",
  "size": 128,
  "theme": "light",
  "downloadedAt": "2025-11-17T17:00:00Z",
  "usageCount": 1,
  "usedInVideos": ["healthy-eating-20251117-170000"]
}
```

---

### Example 8: Sweetgreen Logo (Cached Request)

**Context:** Second video mentioning Sweetgreen

**Command:**
```bash
node servers/logodev/search-brand.js --brand "Sweetgreen"
```

**Response (instant):**
```json
{
  "success": true,
  "cached": true,
  "brand": "Sweetgreen",
  "domain": "sweetgreen.com",
  "logoUrl": "https://img.logo.dev/sweetgreen.com?token=...",
  "filePath": "assets/logos/sweetgreen.png",
  "message": "Logo found in cache"
}
```

**Result:**
- Time: <0.1 seconds (instant)
- No API call needed
- Same logo guaranteed (consistency)

**Catalog updated:**
```json
{
  "usageCount": 2,
  "usedInVideos": [
    "healthy-eating-20251117-170000",
    "restaurant-review-20251118-100000"
  ]
}
```

---

### Example 9: Multiple Brand Logos

**Context:** Video comparing "Top 5 E-commerce Platforms"

**Commands:**
```bash
node servers/logodev/search-brand.js --brand "Shopify"
node servers/logodev/search-brand.js --brand "WooCommerce"
node servers/logodev/search-brand.js --brand "BigCommerce"
node servers/logodev/search-brand.js --brand "Magento"
node servers/logodev/search-brand.js --brand "Wix"
```

**Results:**
- 5 logos extracted
- Total time: ~12 seconds (parallel execution possible)
- All saved to `assets/logos/`
- All cataloged with metadata

**Usage in video:**
- Grid layout showing all 5 logos
- Size: 96px each
- Duration: Full video (comparison chart)
- Consistent appearance across all brands

---

### Example 10: Logo Not Found (Fallback)

**Context:** Startup brand "NexGen AI" not in logo.dev database

**Command:**
```bash
node servers/logodev/search-brand.js --brand "NexGen AI"
```

**Response:**
```json
{
  "success": false,
  "error": "Brand 'NexGen AI' not found",
  "suggestions": "Try alternative spelling or check brand name"
}
```

**Fallback strategy:**
1. Try variations: "NexGen", "Nexgen", "NexGen Inc"
2. Still not found → Use text-based alternative

**Text generation fallback:**
```bash
node servers/seedream/generate-image.js \
  --prompt "text logo reading \"NexGen AI\", modern sans-serif font,
  gradient blue to purple, clean white background, professional tech branding" \
  --aspect-ratio "1:1"
```

**Result:**
- Generated text logo: `assets/generated/products/nexgen-logo-20251117-173000.jpg`
- Cost: $0.02
- Quality: Acceptable for temporary use
- Note: Custom branding, recommend getting official logo from company

---

## Asset Reuse Examples

### Example 11: Finding Similar Office Workspace

**Context:** New video needs office B-roll

**Search command:**
```bash
node servers/search-catalog.js \
  --tags "office,workspace,modern" \
  --type "generated" \
  --category "broll"
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "gen-broll-20251117-143000",
      "filePath": "assets/generated/broll/office-workspace-20251117-143000.jpg",
      "prompt": "clean modern office workspace with MacBook Pro...",
      "tags": ["office", "workspace", "modern", "laptop", "plants", "professional"],
      "similarity": 1.0,
      "usageCount": 3
    },
    {
      "id": "gen-broll-20251116-120000",
      "filePath": "assets/generated/broll/standing-desk-20251116-120000.jpg",
      "prompt": "modern standing desk workspace...",
      "tags": ["office", "workspace", "modern", "desk"],
      "similarity": 0.67,
      "usageCount": 1
    }
  ],
  "total": 2
}
```

**Decision:**
- First result: Perfect match (100% tag overlap)
- Reused instead of generating new
- Time saved: 45 seconds
- Cost saved: $0.02
- Consistency maintained across videos

---

### Example 12: No Match Found - Generate New

**Context:** Need "sunset beach scene" for transition

**Search command:**
```bash
node servers/search-catalog.js \
  --tags "beach,sunset,nature" \
  --type "generated"
```

**Response:**
```json
{
  "success": true,
  "results": [],
  "total": 0
}
```

**Action:** Generate new asset
```bash
node servers/seedream/generate-image.js \
  --prompt "beautiful sunset on tropical beach, golden hour lighting,
  palm trees silhouette, gentle waves, orange and pink sky,
  professional landscape photography, peaceful atmosphere" \
  --aspect-ratio "16:9"
```

**Result:**
- New asset added to library
- Available for future videos with beach/sunset themes
- Library grows organically based on actual needs

---

### Example 13: Partial Match - Review and Decide

**Context:** Need "team meeting" scene

**Search command:**
```bash
node servers/search-catalog.js \
  --tags "team,meeting,office" \
  --type "generated"
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "gen-broll-20251117-150000",
      "filePath": "assets/generated/broll/team-collaboration-20251117-150000.jpg",
      "tags": ["team", "collaboration", "office", "meeting", "professional"],
      "similarity": 0.75,
      "prompt": "diverse team of four people collaborating..."
    }
  ],
  "total": 1
}
```

**Decision process:**
1. Review existing asset (75% tag match)
2. Check if "collaboration" style fits "meeting" concept
3. Review image quality and composition
4. **Decision:** Reuse (close enough match, saves time/cost)

**Alternative decision:**
- If video requires formal boardroom aesthetic vs casual collaboration
- Generate new with specific prompt for boardroom setting
- Keep both in library for future flexibility

---

## Workflow Examples

### Example 14: Complete Video Asset Workflow

**Script:** "How to Build a Successful SaaS Startup in 2025"

**Step 1: Identify asset needs**
- Logo: Shopify (mentioned as example)
- B-roll: Office workspace, team collaboration, laptop dashboard
- Background: Abstract gradient for quote slide

**Step 2: Search existing assets**
```bash
# Check for office workspace
node servers/search-catalog.js --tags "office,workspace"
# → Found! Reuse existing

# Check for team collaboration
node servers/search-catalog.js --tags "team,collaboration"
# → Found! Reuse existing

# Check for laptop dashboard
node servers/search-catalog.js --tags "laptop,dashboard,software"
# → Not found, need to generate

# Check for gradient background
node servers/search-catalog.js --tags "gradient,background"
# → Found! Reuse existing
```

**Step 3: Extract logos**
```bash
# Shopify logo
node servers/logodev/search-brand.js --brand "Shopify"
# → Already cached! Instant retrieval
```

**Step 4: Generate missing assets**
```bash
# Only need laptop dashboard (others reused)
node servers/seedream/generate-image.js \
  --prompt "MacBook Pro displaying SaaS analytics dashboard..." \
  --aspect-ratio "16:9"
# → New asset generated and cataloged
```

**Step 5: Track usage**
```bash
node servers/track-usage.js \
  --asset-id "gen-broll-20251117-143000" \
  --video-id "saas-startup-20251117-180000"

node servers/track-usage.js \
  --asset-id "gen-broll-20251117-150000" \
  --video-id "saas-startup-20251117-180000"
# ... (track all reused assets)
```

**Results:**
- **Assets needed:** 5 (3 images, 1 background, 1 logo)
- **Generated new:** 1 ($0.02)
- **Reused existing:** 4 ($0.00)
- **Total cost:** $0.02 (vs $0.10 if all generated new)
- **Time saved:** ~3 minutes (instant catalog retrieval)
- **Consistency:** Maintained visual style across video library

---

### Example 15: Building Library Over Time

**Video 1:** "Remote Work Tips"
- Generated: 5 images (office, coffee shop, laptop, team, abstract)
- Cost: $0.10
- Library: 5 assets

**Video 2:** "Productivity Hacks"
- Reused: 3 images (office, laptop, abstract)
- Generated: 2 new (time management, calendar)
- Cost: $0.04
- Library: 7 assets

**Video 3:** "Team Building Strategies"
- Reused: 2 images (team, office)
- Generated: 3 new (workshop, retreat, celebration)
- Cost: $0.06
- Library: 10 assets

**Video 4:** "Coffee Shop Productivity"
- Reused: 4 images (coffee shop, laptop, abstract, office)
- Generated: 1 new (specific coffee shop angle)
- Cost: $0.02
- Library: 11 assets

**Video 10:** "Year in Review"
- Reused: 8 images
- Generated: 2 new
- Cost: $0.04
- Library: 25 assets

**Compound value:**
- **Traditional approach:** 10 videos × 5 images avg × $0.02 = $1.00
- **Library approach:** $0.10 + $0.04 + $0.06 + $0.02 + ... ≈ $0.40
- **Savings:** ~$0.60 (60% reduction)
- **Reuse rate improvement:** Video 1: 0% → Video 10: 80%
- **Time savings:** ~15 minutes total (avoiding regeneration)

---

## Common Patterns

### Pattern 1: Brand Mention with Logo Overlay

**Use case:** Mentioning a company in script

1. Extract logo via `search-brand.js` (cached if previously used)
2. Overlay in corner during brand mention
3. Sync with Assembly AI timestamp
4. Fade in 0.5s before, fade out 1s after
5. Track usage in catalog

### Pattern 2: Concept Illustration with Generated Image

**Use case:** Abstract concept needs visual representation

1. Search catalog for similar existing assets
2. If no match (< 50% tags), generate new with detailed prompt
3. Use as B-roll overlay for 3-5 seconds
4. Auto-categorized and tagged for future reuse
5. Track usage to identify high-value assets

### Pattern 3: Multiple Brand Comparison

**Use case:** Comparing services/products

1. Batch extract all logos (check cache first)
2. Consistent sizing (128px recommended)
3. Grid or side-by-side layout
4. Equal display duration per brand
5. Track all logo usage

### Pattern 4: Building Asset Library Proactively

**Use case:** Common brands/concepts you'll frequently use

1. Identify recurring themes (e.g., tech companies, office scenes)
2. Extract logos and generate images in batch
3. Build library before needing them
4. Instant availability for future videos
5. Amortize costs across multiple videos

---

## Quality Comparison

### High-Quality Example (Detailed Prompt)

**Prompt:**
```
"clean modern office workspace with MacBook Pro on wooden desk,
succulent plants in white ceramic pots, large window with soft natural lighting,
minimal clutter, professional interior photography, shallow depth of field,
warm color palette, morning sunlight"
```

**Result:** ⭐⭐⭐⭐⭐
- Highly specific details
- Professional photography terminology
- Clear composition guidance
- Excellent visual quality

### Medium-Quality Example (Adequate Prompt)

**Prompt:**
```
"office workspace with laptop and plants, natural lighting"
```

**Result:** ⭐⭐⭐
- Basic details covered
- Acceptable but generic
- Missing photography style guidance
- Usable but not Instagram-optimized

### Low-Quality Example (Vague Prompt)

**Prompt:**
```
"office"
```

**Result:** ⭐
- Too vague
- Unpredictable output
- Likely generic and low-quality
- Avoid this approach

**Lesson:** Detail and specificity directly correlate with output quality. Invest time in prompting for best results.
