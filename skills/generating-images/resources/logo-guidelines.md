# Logo Guidelines

## Logo.dev API Overview

### Two-Step Process

1. **Brand Search API** → Find company domain from brand name
2. **Logo Image API** → Construct logo URL from domain

---

## When to Use Logo.dev

### Use logo.dev when:
- ✅ Script mentions well-known brands
- ✅ Need professional brand logos
- ✅ Public company or established brand

### Do NOT use logo.dev when:
- ❌ Generic concepts (no specific brand)
- ❌ Fictional/unknown companies
- ❌ Custom graphics needed (use image generation instead)

---

## Logo Sizing

### Recommended Sizes

| Use Case | Size | Example |
|----------|------|---------|
| Overlay/corner | `128px` | Small logo in corner |
| Prominent display | `256px` | Featured brand |
| Thumbnail/icon | `64px` | Multiple logos |
| Background/hero | `512px` | Full-screen intro |

### Usage

```bash
node servers/logodev/search-brand.js \
  --brand "Sweetgreen" \
  --size 128

node servers/logodev/search-brand.js \
  --brand "Shopify" \
  --size 256
```

---

## Format Selection

### PNG (Recommended)
- ✅ Transparency support
- ✅ Clean edges
- Use for: Video overlays, layering

### JPG
- ⚠️ No transparency
- Use for: Solid backgrounds only

### WebP
- ✅ Smaller files with transparency
- ⚠️ Check compatibility first

---

## Theme Selection

| Theme | When to Use |
|-------|-------------|
| `light` | Light/medium backgrounds (default) |
| `dark` | Dark backgrounds |
| `auto` | Mixed backgrounds |

---

## Brand Search Best Practices

**Do:**
- Use official brand name: "Sweetgreen"
- Include proper capitalization: "McDonald's"
- Use full name if ambiguous: "Apple Inc"

**Don't:**
- Generic terms: "that salad place"
- Misspellings: "Shopfy"

---

## Caching

**First request:** Calls API → downloads → saves to `assets/logos/`

**Subsequent requests:** Returns cached path instantly

---

## Fallback Strategies

### Brand Not Found

1. Try alternative spelling
2. Search manually for company domain
3. Skip logo or use text instead
4. Generate text graphic with image generation

---

## Legal Considerations

### Generally Safe:
- ✅ Product reviews
- ✅ News/commentary
- ✅ Educational content

### Risky:
- ⚠️ Implying endorsement
- ⚠️ Misrepresenting relationship

### Do NOT:
- ❌ Alter logo colors
- ❌ Distort proportions
- ❌ Add obscuring effects

---

## Quality Checklist

- [ ] Brand name spelled correctly
- [ ] Appropriate size selected
- [ ] Correct format (PNG for transparency)
- [ ] Theme matches background
- [ ] Logo renders properly in preview
- [ ] Usage aligns with fair use

---

## Troubleshooting

### Logo Not Downloading
1. Check environment variables (`LOGO_SEARCH_KEY`, `LOGO_PUBLIC_TOKEN`)
2. Verify API keys are valid
3. Check network connectivity

### Wrong Logo Returned
- Use more specific brand name
- Review alternatives in response

### Logo Quality Poor
- Use 128-256px for best results
- Avoid <64px (pixelated) or >512px (unnecessary)
