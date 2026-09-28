// Tepup Web UI Kit — top-level screens.
// Each screen receives `navigate` for routing and `data` from the demo host.

const { useState: useState_, useEffect: useEffect_, useRef: useRef_ } = React;

// =========================================================================
//  HomeScreen — the marketing-meets-product homepage
// =========================================================================
function HomeScreen({ data, navigate }) {
  return (
    <div style={{ minHeight:'100vh', background:'#fff' }}>
      <Header active="home" onHome={() => navigate('home')}
              onNav={(k) => navigate(k === 'courses' ? 'courses' : 'home')} />
      <main>
        <HeroSlogan onStart={() => navigate('courses')} />
        <WhyTepupGrid />
        <FeaturedTopics categories={data.categories} onCourseClick={(c) => navigate('course', { course: c })} />
        <OpenPlatform />
        <BottomCTA onCTAClick={() => navigate('courses')} />
      </main>
    </div>
  );
}

function FeaturedTopics({ categories, onCourseClick }) {
  return (
    <section style={{ padding:'80px 0' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 style={{ margin:0, fontSize:30, fontWeight:700, color:'var(--fg-1)' }}>Chủ đề nổi bật</h2>
          <p style={{ margin:'12px 0 0', fontSize:18, color:'var(--fg-4)' }}>Khám phá các lĩnh vực Khoa học Xã hội</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24 }}>
          {categories.map(cat => (
            <TopicCard key={cat.id} category={cat} onClick={() => onCourseClick(cat.courses[0])} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TopicCard({ category, onClick }) {
  const [hover, setHover] = useState_(false);
  return (
    <a onClick={onClick}
       onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
       style={{ display:'flex', gap:16, cursor:'pointer',
                background:'#fff', borderRadius:16, padding:24,
                border:`1px solid ${hover ? 'var(--blue-200)' : 'var(--border-1)'}`,
                boxShadow: hover ? 'var(--shadow-lg)' : 'none',
                transition:'all 200ms' }}>
      <div style={{ width:48, height:48, borderRadius:12, background:'var(--blue-50)',
                    color:'var(--blue-500)', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
        <BookOpen size={24} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <h3 style={{ margin:0, fontWeight:700, fontSize:16,
                     color: hover ? 'var(--blue-600)' : 'var(--fg-1)' }}>{category.name}</h3>
        <p style={{ margin:'4px 0 8px', fontSize:14, color:'var(--fg-4)' }}>{category.description}</p>
        <p style={{ margin:0, color:'var(--blue-500)', fontSize:14, fontWeight:500,
                    display:'inline-flex', alignItems:'center', gap: hover ? 8 : 4,
                    transition:'gap 200ms' }}>
          {category.courses.length} khóa học <ArrowRight size={14} />
        </p>
      </div>
    </a>
  );
}

function OpenPlatform() {
  return (
    <section style={{ background:'var(--gray-50)', padding:'80px 0' }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px', textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:16, background:'var(--cyan-50)',
                      color:'var(--cyan-500)', margin:'0 auto 24px',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Users size={32} />
        </div>
        <h2 style={{ margin:'0 0 16px', fontSize:30, fontWeight:700, color:'var(--fg-1)' }}>
          Nền tảng mở cho tất cả
        </h2>
        <p style={{ margin:'0 0 16px', fontSize:18, color:'var(--fg-3)', lineHeight:1.6 }}>
          Tương tự như Wikipedia, Tepup là nền tảng mở nơi ai cũng có thể đóng góp nội dung. Mỗi bài học đều được xây dựng và hoàn thiện bởi cộng đồng.
        </p>
        <p style={{ margin:'0 0 32px', color:'var(--fg-4)', lineHeight:1.6 }}>
          Bạn có kiến thức về kinh tế, chính trị, xã hội? Hãy chia sẻ và cùng nhau xây dựng kho kiến thức Khoa học Xã hội bằng tiếng Việt lớn nhất.
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button style={{ display:'inline-flex', alignItems:'center', gap:8,
                           padding:'14px 28px', background:'var(--cyan-500)', color:'#fff',
                           fontWeight:600, fontSize:18, border:'none', borderRadius:16,
                           cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            Trở thành người đóng góp <Heart size={20} />
          </button>
          <button style={{ display:'inline-flex', alignItems:'center', gap:8,
                           padding:'14px 28px', background:'transparent',
                           color:'var(--cyan-600)', fontWeight:600, fontSize:18,
                           border:'1px solid #a5f3fc', borderRadius:16,
                           cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            Tìm hiểu cách đóng góp <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
//  CoursesScreen — the "Lộ trình Học" list
// =========================================================================
function CoursesScreen({ data, navigate }) {
  return (
    <div style={{ minHeight:'100vh', background:'#fff' }}>
      <Header active="courses" onHome={() => navigate('home')}
              onNav={(k) => navigate(k === 'home' ? 'home' : 'courses')} />
      <main style={{ maxWidth:1280, margin:'0 auto', padding:'32px 24px 80px' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ margin:0, fontSize:30, fontWeight:700, color:'var(--fg-1)' }}>Lộ trình Học</h1>
          <p style={{ margin:'4px 0 0', color:'var(--fg-4)' }}>Từng bước nắm vững kiến thức</p>
        </div>
        <StorySection characters={data.characters}
                      onCharacterClick={() => alert('Story flow not implemented in this kit demo.')} />
        <div style={{ borderTop:'1px solid var(--border-2)', margin:'32px 0' }} />
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {data.categories.map(cat => (
            <CategorySection key={cat.id} category={cat}
                             onCourseClick={(c) => navigate('course', { course: c })} />
          ))}
        </div>
      </main>
    </div>
  );
}

// =========================================================================
//  CourseDetailScreen — sticky info card + zigzag roadmap
// =========================================================================
function CourseDetailScreen({ data, navigate }) {
  const course = data.course;
  const [popup, setPopup] = useState_(null); // {lesson, skip}

  const handleLessonClick = (lesson) => {
    const skip = !lesson.current && !lesson.completed;
    setPopup({ lesson, skip });
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-50)' }}>
      <Header active="courses" onHome={() => navigate('home')}
              onNav={(k) => navigate(k === 'home' ? 'home' : 'courses')} />
      <main style={{ maxWidth:1152, margin:'0 auto', padding:'32px 24px 80px' }}>
        <BackButton onClick={() => navigate('courses')} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:32 }}>
          <div>
            <div style={{ position:'sticky', top:96,
                          background:'#fff', borderRadius:24, padding:24,
                          boxShadow:'var(--shadow-sm)', border:'1px solid var(--border-1)' }}>
              <div style={{ width:96, height:96, borderRadius:16,
                            background:'var(--blue-50)', color:'var(--blue-500)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            marginBottom:16 }}>
                <Icon name={course.icon} size={48} />
              </div>
              <h1 style={{ margin:'0 0 8px', fontSize:24, fontWeight:700, color:'var(--fg-1)' }}>{course.name}</h1>
              <p style={{ margin:'0 0 24px', color:'var(--fg-3)' }}>{course.description}</p>
              <div style={{ display:'flex', gap:24, color:'var(--fg-4)', fontSize:14 }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                  <GraduationCap size={18} /> {course.lessonsCount} Bài học
                </span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                  <Dumbbell size={18} /> {course.exercisesCount} Bài tập
                </span>
              </div>
            </div>
            {/* Related stories */}
            <div style={{ marginTop:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <Headphones size={14} style={{ color:'var(--purple-500)' }} />
                <span style={{ fontSize:12, fontWeight:600, color:'var(--fg-4)',
                               letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  Câu chuyện liên quan
                </span>
              </div>
              {course.relatedStories.map(s => {
                const ch = data.characters.find(c => c.slug === s.characterId);
                const cc = ch ? CHAR_COLOR[ch.color] : CHAR_COLOR.blue;
                return (
                  <a key={s.slug}
                     style={{ display:'flex', alignItems:'center', gap:12,
                              padding:16, borderRadius:12,
                              background:'#fff', border:'2px solid var(--border-2)',
                              marginBottom:12, textDecoration:'none', cursor:'pointer' }}>
                    <div style={{ width:40, height:40, borderRadius:8,
                                  background: cc.bg, color: cc.fg,
                                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon name={ch?.icon || 'graduation-cap'} size={20} />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontWeight:500, color:'var(--fg-1)', fontSize:14 }}>{s.title}</p>
                      <p style={{ margin:'2px 0 0', fontSize:13, color:'var(--fg-4)' }}>của {ch?.name}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <LearningPath levels={course.levels} onLessonClick={handleLessonClick} />
          </div>
        </div>
      </main>
      {popup && (
        <LessonPopup lesson={popup.lesson} isSkippingAhead={popup.skip}
                     onClose={() => setPopup(null)}
                     onStart={() => { setPopup(null); navigate('lesson'); }} />
      )}
    </div>
  );
}

// =========================================================================
//  LessonReaderScreen — full-screen, progress header, progressive reveal
// =========================================================================
function LessonReaderScreen({ data, navigate }) {
  const lesson = data.lesson;
  const total = lesson.blocks.length;
  const [visible, setVisible] = useState_(1);
  const [qstate, setQstate] = useState_({}); // { idx: { selected, checked, correct } }
  const [points, setPoints] = useState_(0);

  const done = visible > total;
  const progress = Math.min((visible / total) * 100, 100);
  const idx = visible - 1;
  const current = lesson.blocks[idx];

  const isQ = current?.type === 'question';
  const qState = qstate[idx] || { selected:null, checked:false, correct:null };

  const handleSelect = (oid) =>
    setQstate(s => ({ ...s, [idx]: { selected:oid, checked:false, correct:null } }));
  const handleCheck = () => {
    const opt = current.options.find(o => o.id === qState.selected);
    setQstate(s => ({ ...s, [idx]: { ...qState, checked:true, correct: !!opt.correct } }));
    if (opt.correct) setPoints(p => p + 10);
  };

  let btnText='Tiếp tục', btnAction=()=>setVisible(v=>v+1), btnDisabled=false, btnBg='var(--gray-900)', btnHover='var(--gray-800)';
  if (done) { btnText='Hoàn thành'; btnBg='var(--green-500)'; btnHover='var(--green-600)';
              btnAction=()=>navigate('course'); }
  else if (isQ) {
    if (!qState.selected) { btnText='Chọn đáp án'; btnDisabled=true; btnBg='var(--gray-200)'; }
    else if (!qState.checked) { btnText='Kiểm tra'; btnAction=handleCheck; btnBg='var(--blue-500)'; btnHover='var(--blue-600)'; }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#fff', display:'flex', flexDirection:'column' }}>
      {/* Sticky header with progress bar */}
      <header style={{ position:'sticky', top:0, zIndex:50, background:'#fff',
                       borderBottom:'1px solid var(--border-1)', padding:'12px 24px' }}>
        <div style={{ maxWidth:768, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => navigate('course')}
                  style={{ background:'transparent', border:'none', padding:6,
                           borderRadius:8, color:'var(--fg-3)', cursor:'pointer' }}>
            <X size={24} />
          </button>
          <div style={{ flex:1, margin:'0 32px' }}>
            <div role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
                 style={{ height:8, background:'var(--gray-100)', borderRadius:9999, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progress}%`, background:'var(--green-500)',
                            transition:'width 500ms' }} />
            </div>
          </div>
          {points > 0 && (
            <span style={{ fontSize:14, fontWeight:600, color:'var(--green-600)' }}>+{points}</span>
          )}
        </div>
      </header>
      {/* Content */}
      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ maxWidth:768, margin:'0 auto', padding:'32px 24px' }}>
          {lesson.blocks.slice(0, visible).map((b, i) => (
            <div key={i} style={{ animation:'tepup-fade-in 0.4s ease-out' }}>
              {b.type === 'text' && <TextBlock block={b} />}
              {b.type === 'callout' && <CalloutBlock block={b} />}
              {b.type === 'library-document' && <LibraryDocumentBlock block={b} />}
              {b.type === 'question' && (
                <QuestionBlock block={b}
                               state={qstate[i] || { selected:null, checked:false, correct:null }}
                               onSelect={(oid) => setQstate(s => ({ ...s, [i]: { selected:oid, checked:false, correct:null } }))}
                               onCheck={() => {/* parent reads — only current binds */}} />
              )}
            </div>
          ))}
        </div>
      </main>
      {/* Sticky footer */}
      <footer style={{ position:'sticky', bottom:0, background:'#fff',
                       borderTop:'1px solid var(--border-1)', padding:16 }}>
        <div style={{ maxWidth:768, margin:'0 auto' }}>
          <button onClick={btnAction} disabled={btnDisabled}
                  onMouseEnter={e => !btnDisabled && (e.currentTarget.style.background = btnHover || btnBg)}
                  onMouseLeave={e => !btnDisabled && (e.currentTarget.style.background = btnBg)}
                  style={{ width:'100%', padding:16, borderRadius:12,
                           background: btnBg, color: btnDisabled ? 'var(--fg-5)' : '#fff',
                           fontWeight:600, fontSize:18, border:'none',
                           cursor: btnDisabled ? 'not-allowed' : 'pointer',
                           transition:'background 200ms',
                           fontFamily:'var(--font-sans)' }}>
            {btnText}
          </button>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { HomeScreen, CoursesScreen, CourseDetailScreen, LessonReaderScreen });
