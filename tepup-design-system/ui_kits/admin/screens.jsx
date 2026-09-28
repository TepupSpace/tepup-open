// Tepup Admin UI Kit — screens.

// =========================================================================
//  Dashboard
// =========================================================================
function DashboardScreen({ data, navigate }) {
  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:'var(--fg-1)' }}>Dashboard</h1>
        <p style={{ margin:'4px 0 0', color:'var(--fg-3)' }}>Chào mừng đến với trang quản trị Tepup</p>
      </div>

      {/* Stat grid */}
      <div style={{ display:'grid',
                    gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',
                    gap:16, marginBottom:32 }}>
        {data.stats.map(s => (
          <StatCard key={s.href} stat={s} onClick={() => navigate(s.href)} />
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid var(--border-1)' }}>
        <h2 style={{ margin:'0 0 16px', fontSize:18, fontWeight:600, color:'var(--fg-1)' }}>
          Thao tác nhanh
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16 }}>
          <QuickAction icon="folder-tree"    color="purple" label="Thêm danh mục" />
          <QuickAction icon="book-open"      color="blue"   label="Thêm khóa học" />
          <QuickAction icon="users"          color="orange" label="Thêm nhân vật" />
          <QuickAction icon="book-marked"    color="pink"   label="Thêm câu chuyện" />
        </div>
      </div>

      {/* Pending reviews preview */}
      <div style={{ marginTop:24, background:'#fff', borderRadius:16, padding:24,
                    border:'1px solid var(--border-1)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:600, color:'var(--fg-1)' }}>
            Nội dung chờ duyệt
          </h2>
          <a onClick={() => navigate('reviews')}
             style={{ color:'var(--blue-600)', fontSize:14, fontWeight:500, cursor:'pointer' }}>
            Xem tất cả →
          </a>
        </div>
        <ReviewsList rows={data.reviews.slice(0, 3)} compact />
      </div>
    </div>
  );
}

// =========================================================================
//  Reviews queue
// =========================================================================
function ReviewsScreen({ data }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:'var(--fg-1)' }}>Duyệt nội dung</h1>
          <p style={{ margin:'4px 0 0', color:'var(--fg-3)' }}>
            Nội dung do AI tạo cần được duyệt trước khi xuất bản.
          </p>
        </div>
        <SearchBar placeholder="Tìm theo tiêu đề…" />
      </div>
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border-1)', overflow:'hidden' }}>
        <ReviewsList rows={data.reviews} />
      </div>
    </div>
  );
}

function ReviewsList({ rows, compact = false }) {
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
      {!compact && (
        <thead>
          <tr style={{ background:'var(--gray-50)', textAlign:'left', color:'var(--fg-4)' }}>
            <th style={{ padding:'14px 24px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Tiêu đề</th>
            <th style={{ padding:'14px 16px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Loại</th>
            <th style={{ padding:'14px 16px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Trạng thái</th>
            <th style={{ padding:'14px 16px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Người tạo</th>
            <th style={{ padding:'14px 16px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Ngày</th>
            <th style={{ padding:'14px 24px' }}></th>
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id}
              style={{ borderTop: i === 0 && compact ? 'none' : '1px solid var(--border-1)' }}>
            <td style={{ padding:'14px 24px', color:'var(--fg-1)', fontWeight:500 }}>{r.title}</td>
            <td style={{ padding:'14px 16px', color:'var(--fg-3)' }}>{r.type}</td>
            <td style={{ padding:'14px 16px' }}><StatusPill status={r.status} /></td>
            <td style={{ padding:'14px 16px', color:'var(--fg-3)' }}>{r.author}</td>
            <td style={{ padding:'14px 16px', color:'var(--fg-4)' }}>{r.date}</td>
            <td style={{ padding:'14px 24px', textAlign:'right' }}>
              <a style={{ color:'var(--blue-600)', fontWeight:500, cursor:'pointer' }}>Mở →</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =========================================================================
//  Courses list
// =========================================================================
function CoursesScreen({ data }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:'var(--fg-1)' }}>Khóa học</h1>
          <p style={{ margin:'4px 0 0', color:'var(--fg-3)' }}>Quản lý khóa học và bài học.</p>
        </div>
        <AdminButton icon={Plus}>Thêm khóa học</AdminButton>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center' }}>
        <SearchBar placeholder="Tìm khóa học…" />
      </div>
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border-1)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'var(--gray-50)', textAlign:'left', color:'var(--fg-4)' }}>
              <th style={{ padding:'14px 24px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Khóa học</th>
              <th style={{ padding:'14px 16px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Danh mục</th>
              <th style={{ padding:'14px 16px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Số bài</th>
              <th style={{ padding:'14px 16px', fontWeight:600, fontSize:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>Trạng thái</th>
              <th style={{ padding:'14px 24px' }}></th>
            </tr>
          </thead>
          <tbody>
            {data.courses.map(c => (
              <tr key={c.id} style={{ borderTop:'1px solid var(--border-1)' }}>
                <td style={{ padding:'14px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:'var(--blue-50)',
                                  color:'var(--blue-500)',
                                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <AIcon name={c.icon} size={20} />
                    </div>
                    <div>
                      <p style={{ margin:0, color:'var(--fg-1)', fontWeight:500 }}>{c.name}</p>
                      <p style={{ margin:0, color:'var(--fg-5)', fontSize:12, fontFamily:'var(--font-mono)' }}>{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'14px 16px', color:'var(--fg-3)' }}>{c.category}</td>
                <td style={{ padding:'14px 16px', color:'var(--fg-3)' }}>{c.lessons}</td>
                <td style={{ padding:'14px 16px' }}><StatusPill status={c.status} /></td>
                <td style={{ padding:'14px 24px', textAlign:'right' }}>
                  <a style={{ color:'var(--blue-600)', fontWeight:500, cursor:'pointer' }}>Chỉnh sửa →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
//  Placeholder screen for unimplemented routes
// =========================================================================
function PlaceholderScreen({ title }) {
  return (
    <div>
      <h1 style={{ margin:0, fontSize:24, fontWeight:700, color:'var(--fg-1)' }}>{title}</h1>
      <p style={{ margin:'4px 0 24px', color:'var(--fg-3)' }}>
        Trang này chưa được triển khai trong UI kit demo.
      </p>
      <div style={{ background:'#fff', borderRadius:16, padding:48, border:'1px solid var(--border-1)',
                    textAlign:'center', color:'var(--fg-4)' }}>
        Cấu trúc giống <code style={{ background:'var(--gray-100)', padding:'2px 6px', borderRadius:4, fontFamily:'var(--font-mono)' }}>tepup/app/admin/(restricted)/[entity]</code> trong codebase.
      </div>
    </div>
  );
}

Object.assign(window, {
  DashboardScreen, ReviewsScreen, ReviewsList, CoursesScreen, PlaceholderScreen,
});
