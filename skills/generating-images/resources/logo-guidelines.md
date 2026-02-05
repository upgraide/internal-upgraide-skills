# Logo Guidelines

## Logo.dev API Overview

### Two-Step Process

1. **Brand Search API** → Find company domain from brand name
2. **Logo Image API** → Construct logo URL from domain

**Why this approach:**
- Brand names may have multiple companies (e.g., "Apple Records" vs "Apple Inc")
- Domain ensures correct logo retrieval
- Enables caching by consistent domain identifier

---

## When to Use Logo.dev

### Use logo.dev when:
- ✅ Script mentions well-known brands (Sweetgreen, Shopify, Tesla)
- ✅ Need professional brand logos (recognizable companies)
- ✅ Public company or established brand
- ✅ Logo needed for brand credibility/recognition

### Do NOT use logo.dev when:
- ❌ Generic concepts (no specific brand mentioned)
- ❌ Fictional/unknown companies
- ❌ Abstract logos not tied to real brands
- ❌ Custom graphics needed (use image generation instead)

---

## Logo Sizing for Video Composition

### Recommended Sizes

**For overlay/corner placement (most common):**
- Size: `128px` (default)
- Use case: Small logo in corner or sidebar
- Example: Brand mention in B-roll overlay

**For prominent display:**
- Size: `256px`
- Use case: Featured brand, larger screen real estate
- Example: Product review, brand spotlight

**For thumbnail/icon:**
- Size: `64px`
- Use case: Small references, multiple logos
- Example: Partner logos, app icons

**For background/hero:**
- Size: `512px`
- Use case: Large banner, hero section
- Example: Opening frame, full-screen brand intro

### Size Parameter Usage

```bash
node servers/logodev/search-brand.js \
  --brand "Sweetgreen" \
  --size 128  # Corner overlay (default)

node servers/logodev/search-brand.js \
  --brand "Shopify" \
  --size 256  # Prominent display
```

---

## Format Selection

### PNG (Recommended Default)

**When to use:**
- ✅ Need transparency (most video overlays)
- ✅ Layering over video content
- ✅ Clean edges and sharp details
- ✅ Any background color variation

**Format:** `--format png`

**Example use case:** Logo overlay in corner of video

### JPG (Solid Background Only)

**When to use:**
- ⚠️ File size critical (PNG too large)
- ⚠️ Logo on solid white/light background
- ❌ Generally avoid for video overlays (no transparency)

**Format:** `--format jpg`

**Trade-off:** Smaller file, but no transparency

### WebP (Modern Alternative)

**When to use:**
- ✅ Smaller file size than PNG with transparency
- ✅ Modern video editing pipelines support it
- ⚠️ Check Remotion compatibility first

**Format:** `--format webp`

**Recommendation:** Test WebP support before using in production

---

## Theme Selection

### Light Theme (Default)

**When to use:**
- Light or medium backgrounds
- Colorful video content
- Default safe choice for most videos

**Parameter:** `--theme light`

**Behavior:** Returns logo optimized for light backgrounds

### Dark Theme

**When to use:**
- Dark video backgrounds
- Night scenes or low-key lighting
- Dark mode aesthetic

**Parameter:** `--theme dark`

**Behavior:** Returns logo variant optimized for dark backgrounds (often white/light version)

### Auto Theme

**When to use:**
- Mixed background colors throughout video
- Uncertain about predominant background tone
- Want logo.dev to automatically choose

**Parameter:** `--theme auto`

**Behavior:** Logo.dev determines best variant based on context

**Recommendation:** For Instagram Reels with varied backgrounds, use `auto` or test both `light` and `dark` to see which works better.

---

## Brand Search Best Practices

### Exact Brand Names

**Do:**
- Use official brand name: "Sweetgreen"
- Include proper capitalization: "McDonald's"
- Use full name if ambiguous: "Apple Inc" vs "Apple Records"

**Don't:**
- Use generic terms: "that salad place"
- Abbreviations (unless official): "McD" instead of "McDonald's"
- Misspellings: "Shopfy" instead of "Shopify"

### Handling Multiple Results

The API returns multiple matches ranked by relevance:

```json
{
  "success": true,
  "brand": "Apple",
  "domain": "apple.com",  // Best match (Apple Inc)
  "alternatives": [
    { "name": "Apple Inc", "domain": "apple.com" },
    { "name": "Apple Records", "domain": "applerecords.com" },
    { "name": "Apple Bank", "domain": "applebank.com" }
  ]
}
```

**Default behavior:** Script selects first (best) match

**To override:** Review alternatives and re-run with specific domain if needed

---

## Caching Strategy

### Why Caching Matters

**Benefits:**
- ⚡ Instant retrieval (no API call)
- 💰 No rate limit consumption
- 🎯 Consistent logo appearance across videos
- 📦 Builds reusable library

### How Caching Works

**First request:**
```bash
node servers/logodev/search-brand.js --brand "Sweetgreen"
# Calls logo.dev API → downloads logo → saves to assets/logos/sweetgreen.png → updates catalog
```

**Subsequent requests:**
```bash
node servers/logodev/search-brand.js --brand "Sweetgreen"
# Checks catalog.json → finds existing → returns cached path instantly (0 seconds)
```

**Cache lookup:**
- By brand name (case-insensitive)
- Returns filePath + logoUrl from catalog
- No API call needed

### Cache Invalidation

**When to refresh cached logo:**
- Brand redesigns logo (rare)
- Need different size/format/theme
- Corrupted/missing file

**How to force refresh:**
```bash
# Delete from catalog and assets/, then re-run
rm assets/logos/sweetgreen.png
# Edit catalog.json to remove entry (or use --force-refresh flag if implemented)
node servers/logodev/search-brand.js --brand "Sweetgreen"
```

---

## Fallback Strategies

### Brand Not Found

**Scenario:** `logo.dev` returns no results for brand name

**Error response:**
```json
{
  "success": false,
  "error": "Brand 'XYZ Startup' not found",
  "suggestions": "Try alternative spelling or check brand name"
}
```

**Fallback options:**

1. **Try alternative spelling:**
   ```bash
   # Try variations
   --brand "XYZ"
   --brand "XYZ Inc"
   --brand "XYZ Company"
   ```

2. **Search manually:**
   - Find company domain via web search
   - Use domain directly (if script supports domain input)

3. **Skip logo:**
   - Continue without logo
   - Use text-based brand mention instead

4. **Generate text graphic:**
   - Use image generation to create brand name text
   ```bash
   node servers/seedream/generate-image.js \
     --prompt "text logo reading \"XYZ Startup\", modern sans-serif, clean white background"
   ```

### Logo Rendering Issues

**Scenario:** Downloaded logo doesn't render properly

**Common issues:**
- Transparent PNG shows as black background (video layer issue)
- Logo too small/large for intended placement
- Wrong theme (light logo on light background)

**Solutions:**

1. **Re-download with different parameters:**
   ```bash
   --size 256  # Larger if too small
   --theme dark  # If light logo invisible on light background
   --format jpg  # If PNG transparency causing issues (last resort)
   ```

2. **Check video composition settings:**
   - Verify Remotion template supports PNG transparency
   - Adjust logo layer z-index
   - Test logo in video preview

3. **Manual override:**
   - Download logo from company website
   - Save to `assets/logos/[brand].png`
   - Manually add to catalog.json

---

## Legal Considerations

### Fair Use & Trademark

**Educational/Commentary (generally safe):**
- ✅ Product reviews mentioning brand
- ✅ News/commentary about company
- ✅ Educational content featuring brand examples

**Commercial/Endorsement (risky):**
- ⚠️ Implying brand endorsement
- ⚠️ Using logo to sell competing products
- ⚠️ Misrepresenting brand relationship

**Best practices:**
- Use logos only when brand is relevant to content
- Don't imply official partnership without permission
- Follow Instagram's brand usage guidelines
- Include disclaimers if reviewing/critiquing brands

**Disclaimer example (if needed):**
> "Brand logos shown for illustrative purposes. No endorsement implied."

### Logo Modification

**Do NOT:**
- ❌ Alter logo colors
- ❌ Distort proportions
- ❌ Add effects that obscure brand
- ❌ Combine with other brand logos misleadingly

**OK to:**
- ✅ Resize proportionally
- ✅ Adjust opacity for subtle overlay
- ✅ Crop to fit frame (if full logo visible)

---

## Integration with Video Composition

### Common Placement Patterns

**Corner overlay (most common):**
- Position: Bottom-right or top-right corner
- Size: 64-128px
- Opacity: 80-100%
- Duration: Full video or during brand mention

**Featured display:**
- Position: Center or prominent area
- Size: 256-512px
- Duration: 2-5 seconds during brand discussion
- Transition: Fade in/out

**Multiple logos (partners/comparisons):**
- Position: Grid or row layout
- Size: 128px (consistent across all)
- Spacing: Equal padding
- Duration: Simultaneous display

### Remotion Template Integration

**Example composition structure:**
```typescript
<Sequence from={30} durationInFrames={90}>
  <Img
    src={logoPath}  // From catalog: assets/logos/sweetgreen.png
    style={{
      position: 'absolute',
      bottom: 40,
      right: 40,
      width: 128,
      height: 128,
      objectFit: 'contain',
      opacity: 0.9
    }}
  />
</Sequence>
```

**When logo appears:**
- Sync with script mention of brand
- Use Assembly AI timestamps for precise timing
- Fade in 0.5s before mention, fade out 1s after

---

## Quality Checklist

Before using a logo in video:

- [ ] Searched catalog for cached version
- [ ] Brand name spelled correctly
- [ ] Appropriate size selected (128px for overlay)
- [ ] Correct format chosen (PNG for transparency)
- [ ] Theme matches video background (light/dark/auto)
- [ ] Logo renders properly in preview
- [ ] Placement doesn't obscure important content
- [ ] Usage aligns with fair use guidelines
- [ ] Tracked usage in catalog.json

---

## Common Use Cases

### Product Review Video

**Scenario:** Review of Sweetgreen salad delivery

**Implementation:**
```bash
# Extract logo (cached after first use)
node servers/logodev/search-brand.js \
  --brand "Sweetgreen" \
  --size 128 \
  --format png \
  --theme light

# Use in composition
# Position: Bottom-right corner
# Duration: Full video
# Opacity: 85%
```

### Brand Comparison Video

**Scenario:** "Shopify vs WooCommerce for beginners"

**Implementation:**
```bash
# Extract both logos
node servers/logodev/search-brand.js --brand "Shopify"
node servers/logodev/search-brand.js --brand "WooCommerce"

# Use in composition
# Position: Side-by-side at top
# Size: 128px each
# Duration: Full video or per-section
```

### Startup Ecosystem Video

**Scenario:** "Top 10 Tech Startups 2025"

**Implementation:**
```bash
# Extract all 10 logos
for brand in "Stripe" "Figma" "Notion" "Canva" "Airtable" ...; do
  node servers/logodev/search-brand.js --brand "$brand"
done

# Use in composition
# Position: Animated carousel or grid
# Size: 64-96px
# Duration: 3-5 seconds per logo
```

---

## Performance Notes

**First extraction (not cached):**
- Brand search: ~1-2 seconds
- Logo download: ~1-2 seconds
- Catalog update: <1 second
- **Total: ~2-4 seconds**

**Cached extraction:**
- Catalog lookup: <0.1 seconds
- **Total: Instant**

**Rate limits:**
- Logo.dev free tier: Check current limits
- Caching eliminates repeated API calls
- Build library of common brands early

**Optimization:**
- Extract logos for common brands proactively
- Reuse across multiple videos
- Track usage to identify most valuable cached logos

---

## Troubleshooting

### Logo Not Downloading

**Check:**
1. Environment variables set? (`LOGO_SEARCH_KEY`, `LOGO_PUBLIC_TOKEN`)
2. API keys valid and active?
3. Network connectivity?
4. File write permissions on `assets/logos/`?

**Debug:**
```bash
# Validate environment
node servers/validate-env.js

# Test API directly
curl -H "Authorization: Bearer $LOGO_SEARCH_KEY" \
  "https://api.logo.dev/search?q=Sweetgreen"
```

### Wrong Logo Returned

**Cause:** Multiple companies with similar names

**Solution:** Review alternatives in response, use more specific brand name

**Example:**
```bash
# Ambiguous
--brand "Apple"  # Might return Apple Records instead of Apple Inc

# Specific
--brand "Apple Inc"  # More likely to return correct result
```

### Logo Quality Poor

**Cause:** Requested size too small or too large

**Solution:**
- For overlay: Use 128-256px (sweet spot)
- For featured: Use 256-512px
- Avoid: <64px (pixelated) or >512px (unnecessary size)

**Also check:**
- Format (PNG for best quality with transparency)
- Theme (correct variant for background)
- Source logo quality (some brands have low-res logos)
