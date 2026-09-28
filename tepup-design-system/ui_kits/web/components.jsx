// Tepup Web UI Kit — atomic components.
// All visual values pulled from the live codebase (Tailwind tokens map to
// the CSS vars in colors_and_type.css).
// Globals from icons.jsx are referenced directly (window-scoped).

const { useState, useMemo, useEffect, useRef } = React;

// -------------- Icon resolution ------------------------------------------
const ICON_MAP = {
  lightbulb: Lightbulb, 'book-open': BookOpen, 'pie-chart': PieChart,
  receipt: Receipt, 'trending-up': TrendingUp, coins: Coins, scale: Scale,
  brain: Brain, landmark: Landmark, 'graduation-cap': GraduationCap,
  briefcase: Briefcase, store: Store, bike: Bike, headphones: Headphones,
  sparkles: Sparkles, shield: Shield, map: MapIcon, gift: Gift, heart: Heart,
  users: Users, check: Check, alert: AlertCircle,
};
const Icon = ({ name, ...rest }) => {
  const C = ICON_MAP[name] || BookOpen;
  return <C {...rest} />;
};

// -------------- Character color map -------------------------------------
const CHAR_COLOR = {
  teal:   { fg:'#0d9488', fg2:'#0f766e', bg:'#f0fdfa', bg2:'#ccfbf1', border:'#99f6e4', dot:'#14b8a6' },
  blue:   { fg:'#2563eb', fg2:'#1d4ed8', bg:'#eff6ff', bg2:'#dbeafe', border:'#bfdbfe', dot:'#3b82f6' },
  orange: { fg:'#ea580c', fg2:'#c2410c', bg:'#fff7ed', bg2:'#ffedd5', border:'#fed7aa', dot:'#f97316' },
  purple: { fg:'#9333ea', fg2:'#7e22ce', bg:'#faf5ff', bg2:'#f3e8ff', border:'#e9d5ff', dot:'#a855f7' },
};

// =========================================================================
//  Header
// =========================================================================
function Header({ active = 'home', onNav, onHome }) {
  const items = [
    { key: 'home',     label: 'Trang chủ', icon: Home },
    { key: 'courses',  label: 'Khóa học',  icon: BookOpen },
    { key: 'library',  label: 'Thư viện',  icon: Library },
  ];
  return (
    <header style={{
      position:'sticky', top:0, zIndex:50, background:'#fff',
      borderBottom:'1px solid var(--border-1)',
    }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    height:64 }}>
        <a onClick={onHome} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <img src="../../assets/tepup-logo.png" alt="Tepup" width={32} height={32} style={{ borderRadius:8 }} />
          <span style={{ fontWeight:700, color:'var(--fg-1)', fontSize:20 }}>Tepup</span>
        </a>
        <nav style={{ display:'flex', gap:4 }}>
          {items.map(({ key, label, icon: Ic }) => {
            const isActive = active === key;
            return (
              <a key={key} onClick={() => onNav?.(key)}
                 aria-current={isActive ? 'page' : undefined}
                 style={{
                   display:'inline-flex', alignItems:'center', gap:8,
                   padding:'8px 16px', borderRadius: isActive ? 0 : 8,
                   color: isActive ? 'var(--fg-1)' : 'var(--fg-3)',
                   fontWeight: isActive ? 500 : 400,
                   borderBottom: isActive ? '2px solid var(--fg-1)' : '2px solid transparent',
                   cursor:'pointer', transition:'background 150ms',
                 }}
                 onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--gray-50)')}
                 onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
                <Ic size={20} />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
        <button style={{
          padding:8, borderRadius:8, background:'transparent', border:'none',
          color:'var(--fg-3)', cursor:'pointer',
        }}>
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}

// =========================================================================
//  HeroSlogan — homepage hero, the "Tép riu / stép up / stép out" trio
// =========================================================================
function HeroSlogan({ onStart }) {
  return (
    <section style={{ position:'relative', overflow:'hidden', background:'#fff' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'96px 24px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center' }}>
          <h1 style={{ margin:0, fontWeight:700, fontSize:72, lineHeight:1.05, letterSpacing:'-0.02em' }}>
            <span style={{ display:'block', color:'var(--brand-teal)'   }}>Tép riu</span>
            <span style={{ display:'block', color:'var(--brand-blue)'   }}>stép up</span>
            <span style={{ display:'block', color:'var(--brand-orange)' }}>stép out</span>
          </h1>
          <p style={{ marginTop:32, fontSize:20, lineHeight:1.6, color:'var(--fg-3)', maxWidth:560, marginInline:'auto' }}>
            TepUp là nơi nằm ngoài ao làng quen thuộc, nơi những “tép riu” có thể tự do học hỏi và thể hiện chính kiến một cách an toàn.
          </p>
          <div style={{ marginTop:40, display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <PrimaryButton onClick={onStart} large>
              Bắt đầu học <ArrowRight size={20} />
            </PrimaryButton>
            <GhostButton large>Tìm hiểu thêm</GhostButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
//  Why-Tepup feature grid — 3 (or 5) icon-tile cards
// =========================================================================
function WhyTepupGrid() {
  const cards = [
    { color:'teal',   icon:'sparkles', title:'Học qua câu chuyện',
      body:'Kiến thức được truyền tải qua hành trình của các nhân vật thực tế, giúp bạn dễ dàng hiểu và nhớ lâu.' },
    { color:'blue',   icon:'map',      title:'Lộ trình rõ ràng',
      body:'Từng bước nắm vững kiến thức từ cơ bản đến nâng cao, với bài tập thực hành xuyên suốt.' },
    { color:'orange', icon:'shield',   title:'An toàn & Tự do',
      body:'Không gian học tập an toàn để tìm hiểu và thể hiện chính kiến về các vấn đề xã hội.' },
  ];
  return (
    <section style={{ background:'var(--gray-50)', padding:'80px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ margin:0, fontWeight:700, fontSize:30, color:'var(--fg-1)' }}>Tại sao chọn Tepup?</h2>
          <p style={{ margin:'12px 0 0', fontSize:18, color:'var(--fg-4)' }}>Học Khoa học Xã hội theo cách hoàn toàn mới</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
          {cards.map(c => <FeatureCard key={c.title} {...c} />)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ color, icon, title, body }) {
  const c = CHAR_COLOR[color] || CHAR_COLOR.blue;
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         style={{
           background:'#fff', border:'1px solid var(--border-1)',
           borderRadius:16, padding:32,
           boxShadow: hover ? 'var(--shadow-lg)' : 'none',
           transition:'all 200ms',
         }}>
      <div style={{
        width:56, height:56, borderRadius:16, background:c.bg, color:c.dot,
        display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20,
      }}>
        <Icon name={icon} size={28} />
      </div>
      <h3 style={{ margin:'0 0 8px', fontSize:20, fontWeight:700, color:'var(--fg-1)' }}>{title}</h3>
      <p style={{ margin:0, color:'var(--fg-3)', lineHeight:1.6 }}>{body}</p>
    </div>
  );
}

// =========================================================================
//  Buttons
// =========================================================================
function PrimaryButton({ children, onClick, large=false, color='blue', disabled=false, style={} }) {
  const bg = { blue:'var(--blue-500)', orange:'var(--orange-500)', green:'var(--green-500)',
               dark:'var(--gray-900)' }[color] || color;
  const bgHover = { blue:'var(--blue-600)', orange:'var(--orange-600)', green:'var(--green-600)',
                    dark:'var(--gray-800)' }[color];
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
            onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding: large ? '14px 28px' : '12px 24px',
              background: disabled ? 'var(--gray-200)' : (hover ? bgHover : bg),
              color: disabled ? 'var(--fg-5)' : '#fff',
              fontWeight:600, fontSize: large ? 18 : 16,
              border:'none', borderRadius:12,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition:'background 200ms',
              fontFamily:'var(--font-sans)',
              ...style,
            }}>
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, large=false }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
            onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
            style={{
              padding: large ? '14px 28px' : '12px 20px',
              background: hover ? 'var(--gray-50)' : 'transparent',
              color:'var(--fg-3)', fontWeight:600, fontSize: large ? 18 : 16,
              border:'none', borderRadius:12, cursor:'pointer',
              fontFamily:'var(--font-sans)',
            }}>
      {children}
    </button>
  );
}

// =========================================================================
//  Course Card
// =========================================================================
function CourseCard({ course, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <a onClick={onClick}
       onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
       style={{
         position:'relative', display:'block', cursor:'pointer',
         background:'#fff', border:`1px solid ${hover ? 'var(--border-3)' : 'var(--border-2)'}`,
         borderRadius:16, padding:24,
         boxShadow: hover ? 'var(--shadow-lg)' : 'none',
         transform: hover ? 'translateY(-4px)' : 'translateY(0)',
         transition:'all 200ms',
       }}>
      {course.isNew && (
        <div style={{ position:'absolute', top:-8, right:-8,
                      background:'var(--green-500)', color:'#fff',
                      fontSize:11, fontWeight:700, padding:'4px 10px',
                      borderRadius:9999 }}>NEW</div>
      )}
      <div style={{ width:80, height:80, borderRadius:16,
                    background: hover ? 'var(--blue-100)' : 'var(--blue-50)',
                    color:'var(--blue-500)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:16, transition:'background 200ms' }}>
        <Icon name={course.icon} size={40} />
      </div>
      <h3 style={{ margin:0, fontWeight:600, fontSize:16, lineHeight:1.35,
                   color: hover ? 'var(--blue-600)' : 'var(--fg-1)',
                   transition:'color 200ms' }}>
        {course.name}
      </h3>
    </a>
  );
}

// =========================================================================
//  Category section
// =========================================================================
function CategorySection({ category, onCourseClick }) {
  return (
    <section style={{ padding:'32px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'var(--blue-100)',
                      color:'var(--blue-500)',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name={category.icon} size={28} />
        </div>
        <div>
          <h2 style={{ margin:0, fontWeight:700, fontSize:20, color:'var(--fg-1)' }}>{category.name}</h2>
          <p style={{ margin:0, color:'var(--fg-4)' }}>{category.description}</p>
        </div>
      </div>
      <div style={{ background:'var(--gray-50)', borderRadius:24, padding:24 }}>
        <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
                      gap:16 }}>
          {category.courses.map(c => (
            <CourseCard key={c.slug} course={c} onClick={() => onCourseClick?.(c)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
//  Character card + Story section
// =========================================================================
function CharacterCard({ character, onClick }) {
  const c = CHAR_COLOR[character.color] || CHAR_COLOR.blue;
  const [hover, setHover] = useState(false);
  return (
    <a onClick={onClick}
       onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
       style={{
         display:'block', cursor:'pointer', overflow:'hidden',
         borderRadius:16, padding:20,
         background:'#fff',
         border:`2px solid ${hover ? c.fg : c.border}`,
         boxShadow: hover ? 'var(--shadow-lg)' : 'none',
         transform: hover ? 'translateY(-4px)' : 'translateY(0)',
         transition:'all 250ms',
       }}>
      <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
        <div style={{ width:64, height:64, borderRadius:16, background:c.bg2, color:c.fg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0 }}>
          <Icon name={character.icon} size={32} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ marginBottom:8 }}>
            <h3 style={{ margin:0, fontWeight:700, fontSize:18, color:'var(--fg-1)' }}>{character.name}</h3>
            <p style={{ margin:'2px 0 0', fontSize:13, fontWeight:500, color:c.fg }}>{character.role}</p>
          </div>
          <p style={{ margin:'0 0 12px', color:'var(--fg-3)', fontSize:14, lineHeight:1.5 }}>
            “{character.teaser}”
          </p>
          <div style={{ display:'inline-flex', alignItems:'center', gap: hover ? 8 : 4,
                        fontSize:14, fontWeight:600, color:c.fg, transition:'gap 200ms' }}>
            <span>Khám phá hành trình</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </a>
  );
}

function StorySection({ characters, onCharacterClick }) {
  return (
    <section style={{ marginBottom:48 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ width:40, height:40, borderRadius:12,
                      background:'linear-gradient(to bottom right, var(--purple-500), var(--pink-500))',
                      color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h2 style={{ margin:0, fontWeight:700, fontSize:20, color:'var(--fg-1)' }}>Học theo Câu chuyện</h2>
          <p style={{ margin:0, color:'var(--fg-4)', fontSize:14 }}>Khám phá kiến thức qua hành trình của các nhân vật</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
        {characters.map(ch => (
          <CharacterCard key={ch.id} character={ch} onClick={() => onCharacterClick?.(ch)} />
        ))}
      </div>
    </section>
  );
}

// =========================================================================
//  Lesson node — circle node, completed / current / locked
// =========================================================================
function LessonNode({ lesson, onClick, color='blue' }) {
  const c = CHAR_COLOR[color] || CHAR_COLOR.blue;
  let stateStyle, glyph;
  if (lesson.completed) {
    stateStyle = { background:'var(--green-500)', color:'#fff', border:'none' };
    glyph = <Check size={32} strokeWidth={3} />;
  } else if (lesson.current) {
    stateStyle = { background:'#fff', border:`4px solid ${c.dot}`,
                   boxShadow:`0 10px 15px -3px ${c.dot}55` };
    glyph = <div style={{ width:14, height:14, borderRadius:9999, background:c.dot }} />;
  } else {
    stateStyle = { background:'var(--gray-100)', color:'var(--gray-400)', border:'none' };
    glyph = <Lock size={24} />;
  }

  return (
    <button onClick={onClick}
            style={{ background:'transparent', border:'none', padding:0, cursor:'pointer',
                     display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                     position:'relative' }}>
      <div style={{ width:64, height:64, borderRadius:9999,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 200ms', ...stateStyle }}>
        {glyph}
      </div>
      {lesson.current && (
        <div style={{ position:'absolute', top:-8, left:'50%', transform:'translateX(-50%)',
                      width:80, height:80, borderRadius:9999,
                      border:`2px solid ${c.dot}`,
                      animation:'tepup-ping 2s cubic-bezier(0,0,.2,1) infinite',
                      pointerEvents:'none' }} />
      )}
      <span style={{
        fontSize:12, fontWeight:500, textAlign:'center', maxWidth:100,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        color: lesson.current ? c.fg : (lesson.completed ? 'var(--fg-2)' : 'var(--fg-5)'),
      }}>
        {lesson.name}
      </span>
    </button>
  );
}

// =========================================================================
//  Learning path — zigzag stack of nodes (no connectors)
// =========================================================================
function LearningPath({ levels, onLessonClick, color='blue' }) {
  return (
    <div>
      {levels.map((lvl, lvlIdx) => (
        <div key={lvl.id} style={{ marginBottom:48 }}>
          <div style={{ background:'#fff', border:'1px solid var(--border-2)',
                        borderRadius:16, padding:16, marginBottom:32,
                        textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--blue-500)',
                           letterSpacing:'0.08em', textTransform:'uppercase' }}>
              Cấp độ {lvlIdx + 1}
            </span>
            <h3 style={{ margin:'4px 0 0', fontSize:18, fontWeight:700, color:'var(--fg-1)' }}>
              {lvl.name}
            </h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24 }}>
            {lvl.lessons.map((l, lIdx) => (
              <div key={l.id}
                   style={{ transform: lIdx % 2 === 0 ? 'none' : 'translateX(64px)' }}>
                <LessonNode lesson={l} color={color}
                            onClick={() => onLessonClick?.(l)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =========================================================================
//  Lesson popup
// =========================================================================
function LessonPopup({ lesson, isSkippingAhead=false, onClose, onStart }) {
  // ESC close
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} aria-hidden
           style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.20)', zIndex:40 }} />
      <div role="dialog" aria-modal="true"
           style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
                    zIndex:50, animation:'tepup-slide-up 0.25s cubic-bezier(0.32, 0.72, 0, 1)' }}>
        <div style={{ background:'#fff', borderRadius:16, boxShadow:'var(--shadow-2xl)',
                      padding:24, minWidth:300 }}>
          <h3 style={{ margin:'0 0 16px', textAlign:'center', fontWeight:700,
                       fontSize:18, color:'var(--fg-1)' }}>
            {lesson.name}
          </h3>
          <PrimaryButton onClick={onStart} color={isSkippingAhead ? 'orange' : 'blue'}
                         style={{ width:'100%', justifyContent:'center' }}>
            {isSkippingAhead ? 'Nhảy cóc' : 'Bắt đầu'}
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}

// =========================================================================
//  Back button
// =========================================================================
function BackButton({ onClick, label='Quay lại' }) {
  return (
    <button onClick={onClick}
            style={{ display:'inline-flex', alignItems:'center', gap:8,
                     background:'transparent', border:'none',
                     color:'var(--fg-3)', cursor:'pointer', marginBottom:24,
                     padding:0, fontSize:14, fontFamily:'var(--font-sans)' }}>
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
}

// =========================================================================
//  Bottom CTA (dark band)
// =========================================================================
function BottomCTA({ onCTAClick }) {
  return (
    <section style={{ background:'var(--gray-900)', padding:'80px 0' }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px', textAlign:'center' }}>
        <h2 style={{ margin:'0 0 16px', fontSize:30, fontWeight:700, color:'#fff' }}>
          Sẵn sàng khám phá?
        </h2>
        <p style={{ margin:'0 0 32px', fontSize:18, color:'var(--gray-400)' }}>
          Bắt đầu hành trình học tập Khoa học Xã hội cùng Tepup ngay hôm nay.
        </p>
        <PrimaryButton onClick={onCTAClick} large>
          Bắt đầu ngay <ArrowRight size={20} />
        </PrimaryButton>
      </div>
    </section>
  );
}

// =========================================================================
//  Lesson content blocks (the lesson reader)
// =========================================================================
function TextBlock({ block }) {
  return (
    <div style={{ marginBottom:24 }}>
      {block.title && (
        <h2 style={{ margin:'0 0 16px', fontWeight:700, fontSize:24, color:'var(--fg-1)' }}>
          {block.title}
        </h2>
      )}
      {block.paragraphs.map((p, i) => (
        <p key={i} style={{ margin:'0 0 16px', color:'var(--fg-2)',
                            lineHeight:1.7, fontSize:18, whiteSpace:'pre-line' }}>{p}</p>
      ))}
    </div>
  );
}

function CalloutBlock({ block }) {
  const variants = {
    info:    { bg:'var(--blue-50)',  border:'var(--blue-200)',   ic:'var(--blue-500)',  title:'var(--blue-800)',   text:'var(--blue-700)'  , Glyph:Lightbulb },
    warning: { bg:'var(--yellow-50)', border:'var(--yellow-200)', ic:'var(--yellow-500)', title:'var(--yellow-800)', text:'var(--yellow-700)', Glyph:AlertCircle },
    success: { bg:'var(--green-50)',  border:'var(--green-200)',  ic:'var(--green-500)',  title:'var(--green-800)',  text:'var(--green-700)' , Glyph:CheckCircle },
  };
  const v = variants[block.variant || 'info'];
  const G = v.Glyph;
  return (
    <div style={{ background:v.bg, border:`2px solid ${v.border}`,
                  borderRadius:16, padding:20, marginBottom:24,
                  display:'flex', gap:12 }}>
      <G size={24} style={{ color:v.ic, flexShrink:0, marginTop:2 }} />
      <div>
        {block.title && <h3 style={{ margin:'0 0 4px', fontWeight:600, color:v.title, fontSize:16 }}>{block.title}</h3>}
        <p style={{ margin:0, color:v.text, lineHeight:1.6, whiteSpace:'pre-line' }}>{block.text}</p>
      </div>
    </div>
  );
}

function QuestionBlock({ block, state, onSelect, onCheck }) {
  return (
    <div style={{ marginBottom:24 }}>
      <p style={{ margin:'0 0 16px', fontSize:18, fontWeight:500, color:'var(--fg-1)' }}>
        {block.question}
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {block.options.map((opt) => {
          const isSelected = state.selected === opt.id;
          const showCorrect = state.checked && opt.correct;
          const showWrong   = state.checked && isSelected && !opt.correct;
          let bg='#fff', border='var(--border-2)', color='var(--fg-2)', dotBg='#fff', dotBorder='var(--gray-300)';
          if (showCorrect) { bg='var(--green-50)'; border='var(--green-500)'; color='var(--green-700)'; dotBg='var(--green-500)'; dotBorder='var(--green-500)'; }
          else if (showWrong)   { bg='var(--red-50)';   border='var(--red-500)';   color='var(--red-700)';   dotBg='var(--red-500)';   dotBorder='var(--red-500)'; }
          else if (isSelected)  { bg='var(--blue-50)';  border='var(--blue-500)';  color='var(--blue-700)';  dotBg='var(--blue-500)';  dotBorder='var(--blue-500)'; }
          return (
            <button key={opt.id}
                    onClick={() => !state.checked && onSelect(opt.id)}
                    disabled={state.checked}
                    style={{ background:bg, border:`2px solid ${border}`, borderRadius:12,
                             padding:16, textAlign:'left', cursor: state.checked ? 'default' : 'pointer',
                             fontFamily:'var(--font-sans)', display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:24, height:24, borderRadius:9999,
                            border:`2px solid ${dotBorder}`, background:dotBg,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            flexShrink:0 }}>
                {showCorrect && <Check size={14} strokeWidth={3} style={{ color:'#fff' }} />}
                {showWrong   && <X size={12} strokeWidth={3} style={{ color:'#fff' }} />}
                {isSelected && !state.checked && (
                  <div style={{ width:8, height:8, background:'#fff', borderRadius:9999 }} />
                )}
              </div>
              <span style={{ color, fontWeight: (isSelected||showCorrect) ? 500 : 400, fontSize:15 }}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
      {state.checked && block.explanation && (
        <div style={{ marginTop:16, padding:16, borderRadius:12,
                      background: state.correct ? 'var(--green-50)' : 'var(--blue-50)',
                      border: `1px solid ${state.correct ? 'var(--green-200)' : 'var(--blue-200)'}`,
                      color: state.correct ? 'var(--green-700)' : 'var(--blue-700)' }}>
          <span style={{ fontWeight:600 }}>{state.correct ? 'Chính xác! ' : 'Giải thích: '}</span>
          {block.explanation}
        </div>
      )}
    </div>
  );
}

function LibraryDocumentBlock({ block }) {
  return (
    <div style={{ background:'#fff', border:'2px solid var(--purple-200)',
                  borderRadius:16, padding:20, marginBottom:24 }}>
      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        <BookOpen size={24} style={{ color:'var(--purple-600)', flexShrink:0, marginTop:4 }} />
        <div style={{ flex:1 }}>
          {block.category && (
            <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:9999,
                           background:'var(--purple-100)', color:'var(--purple-700)',
                           fontSize:12, fontWeight:500, marginBottom:8 }}>
              {block.category}
            </span>
          )}
          <h3 style={{ margin:'0 0 6px', fontWeight:700, fontSize:20, color:'var(--fg-1)' }}>{block.title}</h3>
          <p style={{ margin:0, color:'var(--fg-2)', lineHeight:1.55 }}>{block.description}</p>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16 }}>
        <button style={{ display:'inline-flex', alignItems:'center', gap:8,
                         padding:'8px 16px', background:'var(--purple-600)', color:'#fff',
                         fontWeight:600, fontSize:14, border:'none', borderRadius:12, cursor:'pointer' }}>
          Xem tài liệu <ChevronRight size={14} strokeWidth={2.5} />
        </button>
        {block.readTime && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4,
                         color:'var(--fg-4)', fontSize:13 }}>
            <Clock size={14} /> {block.readTime}
          </span>
        )}
      </div>
    </div>
  );
}

// Expose to window so screens.jsx can use them
Object.assign(window, {
  Icon, ICON_MAP, CHAR_COLOR,
  Header, HeroSlogan, WhyTepupGrid, FeatureCard,
  PrimaryButton, GhostButton,
  CourseCard, CategorySection, CharacterCard, StorySection,
  LessonNode, LearningPath, LessonPopup, BackButton, BottomCTA,
  TextBlock, CalloutBlock, QuestionBlock, LibraryDocumentBlock,
});
