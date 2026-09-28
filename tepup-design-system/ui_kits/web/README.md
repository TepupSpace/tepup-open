# Tepup Web UI Kit

High-fidelity recreation of Tepup's **learner-facing web product**: homepage, courses index, course detail with the zigzag roadmap, and the lesson reader with progressive content reveal.

The kit is a clickable prototype — start at the homepage, click "Bắt đầu học" or any course card, open a lesson popup from the roadmap, and step through the lesson with the `Tiếp tục` / `Kiểm tra` / `Hoàn thành` button states.

## Run
Open `index.html`. No build step — React 18 + Babel-standalone load via CDN; CSS variables come from `../../colors_and_type.css`.

## Files
| File | Purpose |
|---|---|
| `index.html` | App shell + keyframes + tiny route table |
| `data.js` | Fake content (characters, categories, course, lesson) — same shape as the real `data/courses.ts` |
| `icons.jsx` | All Lucide-style icons used across the kit (2px stroke, inline SVG components) |
| `components.jsx` | Atomic components: Header, HeroSlogan, WhyTepupGrid, FeatureCard, PrimaryButton/GhostButton, CourseCard, CategorySection, CharacterCard, StorySection, LessonNode, LearningPath (the zigzag), LessonPopup, BackButton, BottomCTA, TextBlock, CalloutBlock, QuestionBlock, LibraryDocumentBlock |
| `screens.jsx` | Top-level screens: HomeScreen, CoursesScreen, CourseDetailScreen, LessonReaderScreen, plus FeaturedTopics, TopicCard, OpenPlatform |

## Screens covered
- **Home** (`/`) — slogan hero with the signature blurred-circle glow, "Why Tepup" feature grid, featured topics, "Open platform" community section, dark bottom CTA.
- **Courses** (`/courses`) — page header, "Học theo Câu chuyện" character section, then per-category course-card grids.
- **Course detail** (`/courses/[slug]`) — sticky 1/3 info card on the left, 2/3 zigzag roadmap on the right, related stories, lesson popup on tap.
- **Lesson reader** (`/learn/[id]`) — sticky progress header, progressive reveal of content blocks (text · callout · library document · MCQ question), context-aware footer button.

## Caveats — what this kit intentionally skips
- **Story flow** (`/story/[character]` and its detail page) — the character cards open an alert. Add `StoryScreen` and `StoryDetailScreen` to extend; the shape mirrors `CourseDetailScreen` with character-tinted nodes.
- **Auth / Library** — login, register, library index aren't represented.
- **The 24 interactive gamification blocks** (calculator, slider-simulator, budget-allocator, bias-detector, etc.) — only the four canonical blocks (text, callout, question, library-document) are rendered. The full set lives in `tepup/components/blocks/` in the source.
- **Progressive scroll-to** behaviour and per-block `interactiveBlockCompleted` gating are not implemented in the demo — the reveal works on Continue clicks only.

## Source of truth
Each component is mapped to a real file under `tepup/components/` in the TepUp app repository (`tepup/`):
- `Header.tsx` → `Header`
- `CourseCard.tsx` → `CourseCard`
- `CategorySection.tsx` → `CategorySection`
- `CharacterCard.tsx` / `StorySection.tsx` → `CharacterCard` / `StorySection`
- `LessonNode.tsx` / `LearningPath.tsx` / `LessonPopup.tsx` → `LessonNode` / `LearningPath` / `LessonPopup`
- `app/learn/[lessonId]/page.tsx` → `LessonReaderScreen` (+ block components)

Visual values (radius, color, shadow tokens) come from Tailwind via `colors_and_type.css`. The implementation is plain inline-style React for portability; in the real codebase these are Tailwind class strings.
