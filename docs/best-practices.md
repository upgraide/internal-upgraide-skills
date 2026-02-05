# Skill Authoring Best Practices

> Source: [Anthropic Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

Learn how to write effective Skills that Claude can discover and use successfully.

---

Good Skills are concise, well-structured, and tested with real usage. This guide provides practical authoring decisions to help you write Skills that Claude can discover and use effectively.

## Core Principles

### Concise is Key

The context window is a public good. Your Skill shares the context window with everything else Claude needs to know, including:

- The system prompt
- Conversation history
- Other Skills' metadata
- Your actual request

Not every token in your Skill has an immediate cost. At startup, only the metadata (name and description) from all Skills is pre-loaded. Claude reads SKILL.md only when the Skill becomes relevant, and reads additional files only as needed.

However, being concise in SKILL.md still matters: once Claude loads it, every token competes with conversation history and other context.

**Default assumption**: Claude is already very smart. Only add context Claude doesn't already have. Challenge each piece of information:

- "Does Claude really need this explanation?"
- "Can I assume Claude knows this?"
- "Does this paragraph justify its token cost?"

**Good example: Concise** (~50 tokens):

```markdown
## Extract PDF text
Use pdfplumber for text extraction:

import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

**Bad example: Too verbose** (~150 tokens):

```markdown
## Extract PDF text
PDF (Portable Document Format) files are a common file format that contains text, images, and other content. To extract text from a PDF, you'll need to use a library. There are many libraries available for PDF processing, but we recommend pdfplumber because it's easy to use and handles most cases well. First, you'll need to install it using pip. Then you can use the code below...
```

The concise version assumes Claude knows what PDFs are and how libraries work.

### Set Appropriate Degrees of Freedom

Match the level of specificity to the task's fragility and variability.

**High freedom** (text-based instructions): Use when multiple approaches are valid, decisions depend on context, heuristics guide the approach.

```markdown
## Code review process
1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

**Medium freedom** (pseudocode or scripts with parameters): Use when a preferred pattern exists, some variation is acceptable, configuration affects behavior.

```markdown
## Generate report
Use this template and customize as needed:

def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Generate output in specified format
    # Optionally include visualizations
```

**Low freedom** (specific scripts, few or no parameters): Use when operations are fragile and error-prone, consistency is critical, a specific sequence must be followed.

```markdown
## Database migration
Run exactly this script:

python scripts/migrate.py --verify --backup

Do not modify the command or add additional flags.
```

**Analogy**: Think of Claude as a robot exploring a path:

- **Narrow bridge with cliffs on both sides**: There's only one safe way forward. Provide specific guardrails and exact instructions (low freedom). Example: database migrations that must run in exact sequence.
- **Open field with no hazards**: Many paths lead to success. Give general direction and trust Claude to find the best route (high freedom). Example: code reviews where context determines the best approach.

### Test with All Models You Plan to Use

Skills act as additions to models, so effectiveness depends on the underlying model. Test your Skill with all the models you plan to use it with.

**Testing considerations by model:**

- **Claude Haiku** (fast, economical): Does the Skill provide enough guidance?
- **Claude Sonnet** (balanced): Is the Skill clear and efficient?
- **Claude Opus** (powerful reasoning): Does the Skill avoid over-explaining?

What works perfectly for Opus might need more detail for Haiku.

## Skill Structure

### YAML Frontmatter

The SKILL.md frontmatter requires two fields:

**name**:
- Maximum 64 characters
- Must contain only lowercase letters, numbers, and hyphens
- Cannot contain XML tags
- Cannot contain reserved words: "anthropic", "claude"

**description**:
- Must be non-empty
- Maximum 1024 characters
- Cannot contain XML tags
- Should describe what the Skill does and when to use it

### Naming Conventions

Use **gerund form** (verb + -ing) for Skill names, as this clearly describes the activity or capability the Skill provides.

**Good naming examples:**
- `processing-pdfs`
- `analyzing-spreadsheets`
- `managing-databases`
- `testing-code`
- `writing-documentation`

**Acceptable alternatives:**
- Noun phrases: `pdf-processing`, `spreadsheet-analysis`
- Action-oriented: `process-pdfs`, `analyze-spreadsheets`

**Avoid:**
- Vague names: `helper`, `utils`, `tools`
- Overly generic: `documents`, `data`, `files`
- Reserved words: `anthropic-helper`, `claude-tools`

### Writing Effective Descriptions

The description field enables Skill discovery and should include both what the Skill does and when to use it.

> **Always write in third person.** The description is injected into the system prompt, and inconsistent point-of-view can cause discovery problems.
>
> - **Good:** "Processes Excel files and generates reports"
> - **Avoid:** "I can help you process Excel files"
> - **Avoid:** "You can use this to process Excel files"

**Be specific and include key terms.** Each Skill has exactly one description field. The description is critical for skill selection.

**Effective examples:**

```yaml
# PDF Processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

# Excel Analysis
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.

# Git Commit Helper
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

**Avoid vague descriptions:**
- "Helps with documents"
- "Processes data"
- "Does stuff with files"

### Progressive Disclosure Patterns

SKILL.md serves as an overview that points Claude to detailed materials as needed, like a table of contents in an onboarding guide.

**Practical guidance:**
- Keep SKILL.md body under 500 lines for optimal performance
- Split content into separate files when approaching this limit

#### Pattern 1: High-level guide with references

```markdown
# PDF Processing

## Quick start
Extract text with pdfplumber:

import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()

## Advanced features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

Claude loads FORMS.md, REFERENCE.md, or EXAMPLES.md only when needed.

#### Pattern 2: Domain-specific organization

For Skills with multiple domains, organize content by domain to avoid loading irrelevant context.

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

#### Pattern 3: Conditional details

```markdown
# DOCX Processing

## Creating documents
Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents
For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

### Avoid Deeply Nested References

Claude may partially read files when they're referenced from other referenced files. **Keep references one level deep from SKILL.md.**

**Bad example: Too deep:**
```
SKILL.md → advanced.md → details.md
```

**Good example: One level deep:**
```
SKILL.md → advanced.md
SKILL.md → reference.md
SKILL.md → examples.md
```

### Structure Longer Reference Files with Table of Contents

For reference files longer than 100 lines, include a table of contents at the top.

```markdown
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features (batch operations, webhooks)
- Error handling patterns
- Code examples

## Authentication and setup
...
```

## Workflows and Feedback Loops

### Use Workflows for Complex Tasks

Break complex operations into clear, sequential steps. For particularly complex workflows, provide a checklist that Claude can copy and check off.

**Example: PDF form filling workflow:**

```markdown
## PDF form filling workflow

Copy this checklist and check off items as you complete them:

Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)

**Step 1: Analyze the form**
Run: `python scripts/analyze_form.py input.pdf`

**Step 2: Create field mapping**
Edit `fields.json` to add values for each field.

...
```

### Implement Feedback Loops

**Common pattern**: Run validator → fix errors → repeat

```markdown
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python ooxml/scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
```

## Content Guidelines

### Avoid Time-Sensitive Information

Don't include information that will become outdated:

**Bad:** "If you're doing this before August 2025, use the old API..."

**Good:** Use an "old patterns" section with collapsed details.

### Use Consistent Terminology

Choose one term and use it throughout:

- ✅ Always "API endpoint" (not mixing "URL", "API route", "path")
- ✅ Always "field" (not mixing "box", "element", "control")
- ✅ Always "extract" (not mixing "pull", "get", "retrieve")

## Common Patterns

### Template Pattern

Provide templates for output format:

```markdown
## Report structure
ALWAYS use this exact template structure:

# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```

### Examples Pattern

Provide input/output pairs:

```markdown
## Commit message format

**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication

**Example 2:**
Input: Fixed bug where dates displayed incorrectly
Output: fix(reports): correct date formatting in timezone conversion
```

### Conditional Workflow Pattern

Guide Claude through decision points:

```markdown
## Document modification workflow

1. Determine the modification type:

**Creating new content?** → Follow "Creation workflow" below
**Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow:
   - Use docx-js library
   - Build document from scratch

3. Editing workflow:
   - Unpack existing document
   - Modify XML directly
   - Validate after each change
```

## Evaluation and Iteration

### Build Evaluations First

**Create evaluations BEFORE writing extensive documentation.** This ensures your Skill solves real problems.

**Evaluation-driven development:**
1. **Identify gaps**: Run Claude on representative tasks without a Skill
2. **Create evaluations**: Build three scenarios that test these gaps
3. **Establish baseline**: Measure Claude's performance without the Skill
4. **Write minimal instructions**: Just enough to pass evaluations
5. **Iterate**: Execute evaluations, compare, refine

### Develop Skills Iteratively with Claude

Work with one instance of Claude ("Claude A") to create a Skill that will be used by other instances ("Claude B").

1. **Complete a task without a Skill**
2. **Identify the reusable pattern**
3. **Ask Claude A to create a Skill**
4. **Review for conciseness**
5. **Test on similar tasks** with Claude B
6. **Iterate based on observation**

### Observe How Claude Navigates Skills

Watch for:
- Unexpected exploration paths
- Missed connections
- Overreliance on certain sections
- Ignored content

## Anti-Patterns to Avoid

### Avoid Windows-Style Paths

Always use forward slashes:
- ✅ `scripts/helper.py`
- ❌ `scripts\helper.py`

### Avoid Offering Too Many Options

Don't present multiple approaches unless necessary:

**Bad:** "You can use pypdf, or pdfplumber, or PyMuPDF, or..."

**Good:** "Use pdfplumber for text extraction. For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."

## Advanced: Skills with Executable Code

### Solve, Don't Punt

Handle error conditions rather than punting to Claude:

```python
def process_file(path):
    """Process a file, creating it if it doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
```

### Provide Utility Scripts

Pre-made scripts offer advantages:
- More reliable than generated code
- Save tokens (no need to include code in context)
- Save time (no code generation required)
- Ensure consistency across uses

### Use Visual Analysis

When inputs can be rendered as images, have Claude analyze them:

```markdown
## Form layout analysis
1. Convert PDF to images: `python scripts/pdf_to_images.py form.pdf`
2. Analyze each page image to identify form fields
3. Claude can see field locations and types visually
```

### Create Verifiable Intermediate Outputs

When Claude performs complex tasks, catch errors early with the "plan-validate-execute" pattern.

**Why this pattern works:**
- Catches errors early
- Machine-verifiable
- Reversible planning
- Clear debugging

### Package Dependencies

List required packages in your SKILL.md and verify availability.

## Checklist for Effective Skills

### Core Quality
- [ ] Description is specific and includes key terms
- [ ] Description includes both what the Skill does and when to use it
- [ ] SKILL.md body is under 500 lines
- [ ] Additional details are in separate files (if needed)
- [ ] No time-sensitive information
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references are one level deep
- [ ] Progressive disclosure used appropriately
- [ ] Workflows have clear steps

### Code and Scripts
- [ ] Scripts solve problems rather than punt to Claude
- [ ] Error handling is explicit and helpful
- [ ] No "voodoo constants" (all values justified)
- [ ] Required packages listed
- [ ] Scripts have clear documentation
- [ ] No Windows-style paths (all forward slashes)
- [ ] Validation/verification steps for critical operations
- [ ] Feedback loops included for quality-critical tasks

### Testing
- [ ] At least three evaluations created
- [ ] Tested with Haiku, Sonnet, and Opus
- [ ] Tested with real usage scenarios
- [ ] Team feedback incorporated
