// Tepup Admin UI Kit — atomic components.
const { useState } = React;

const COLOR_BG = {
  purple: { dot:'var(--purple-500)', bg:'var(--purple-50)',  fg:'var(--purple-700)' },
  blue:   { dot:'var(--blue-500)',   bg:'var(--blue-50)',    fg:'var(--blue-700)'   },
  green:  { dot:'var(--green-500)',  bg:'var(--green-50)',   fg:'var(--green-700)'  },
  orange: { dot:'var(--orange-500)', bg:'var(--orange-50)',  fg:'var(--orange-600)' },
  pink:   { dot:'var(--pink-500)',   bg:'#fdf2f8',           fg:'#be185d'           },
};

// Re-use ICON_MAP shape from web kit
const ADMIN_ICON_MAP = {
  'layout-dashboard': LayoutDashboard, 'folder-tree': FolderTree,
  'book-open': BookOpen, 'graduation-cap': GraduationCap, library: Library,
  users: Users, 'book-marked': BookMarked, 'user-cog': UserCog,
  'check-square': CheckSquare, lightbulb: Lightbulb, settings: Settings,
  'pie-chart': PieChart, receipt: Receipt, 'trending-up': TrendingUp,
  scale: Scale, brain: Brain, landmark: Landmark, coins: Coins,
};
function AIcon({ name, ...rest }) {
  const C = ADMIN_ICON_MAP[name] || BookOpen;
  return <C {...rest} />;
}

// =========================================================================
//  AdminSidebar
// =========================================================================
function AdminSidebar({ active, onNav, collapsed, setCollapsed }) {
  const items = [
    { key:'dashboard',        title:'Dashboard',        icon:LayoutDashboard },
    { key:'reviews',          title:'Duyệt nội dung',   icon:CheckSquare },
    { key:'categories',       title:'Danh mục',         icon:FolderTree },
    { key:'courses',          title:'Khóa học',         icon:BookOpen },
    { key:'lessons',          title:'Bài học',          icon:GraduationCap },
    { key:'library',          title:'Thư viện',         icon:Library },
    { key:'characters',       title:'Nhân vật',         icon:Users },
    { key:'stories',          title:'Câu chuyện',       icon:BookMarked },
    { key:'users',            title:'Người dùng',       icon:UserCog },
    { key:'feature-requests', title:'Yêu cầu tính năng', icon:Lightbulb },
  ];
  const width = collapsed ? 80 : 256;
  return (
    <aside style={{
      position:'fixed', top:0, left:0, height:'100vh',
      width, background:'#fff', borderRight:'1px solid var(--border-2)',
      zIndex:50, transition:'width 300ms',
      display:'flex', flexDirection:'column',
    }}>
      <div style={{ height:64, display:'flex', alignItems:'center',
                    justifyContent:'space-between', padding:'0 16px',
                    borderBottom:'1px solid var(--border-2)' }}>
        <a style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'var(--blue-500)',
                        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                        flexShrink:0, fontWeight:700, fontSize:20 }}>T</div>
          {!collapsed && <span style={{ fontWeight:700, color:'var(--fg-1)' }}>Tepup Admin</span>}
        </a>
        <button onClick={() => setCollapsed(!collapsed)}
                style={{ background:'transparent', border:'none', cursor:'pointer',
                         padding:6, borderRadius:8, color:'var(--fg-4)' }}>
          <ChevronLeft size={20} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition:'transform 200ms' }} />
        </button>
      </div>
      <nav style={{ padding:16, display:'flex', flexDirection:'column', gap:4, flex:1, overflowY:'auto' }}>
        {items.map(({ key, title, icon: I }) => {
          const isActive = active === key;
          return (
            <a key={key} onClick={() => onNav(key)}
               title={collapsed ? title : undefined}
               style={{
                 display:'flex', alignItems:'center', gap:12,
                 padding:'10px 12px', borderRadius:12, cursor:'pointer',
                 background: isActive ? 'var(--blue-50)' : 'transparent',
                 color:    isActive ? 'var(--blue-600)' : 'var(--fg-3)',
                 transition:'all 150ms',
               }}
               onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--gray-50)')}
               onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
              <I size={20} style={{ flexShrink:0 }} />
              {!collapsed && <span style={{ fontWeight:500, fontSize:14 }}>{title}</span>}
            </a>
          );
        })}
      </nav>
      <div style={{ padding:16, borderTop:'1px solid var(--border-2)' }}>
        <a style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                    borderRadius:12, color:'var(--fg-3)', cursor:'pointer' }}>
          <Settings size={20} />
          {!collapsed && <span style={{ fontWeight:500, fontSize:14 }}>Cài đặt</span>}
        </a>
      </div>
    </aside>
  );
}

// =========================================================================
//  AdminHeader
// =========================================================================
function AdminHeader({ user, title }) {
  return (
    <header style={{ height:64, background:'#fff', borderBottom:'1px solid var(--border-2)',
                     display:'flex', alignItems:'center', justifyContent:'space-between',
                     padding:'0 24px' }}>
      <h1 style={{ margin:0, fontSize:18, fontWeight:600, color:'var(--fg-1)' }}>{title}</h1>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <a style={{ fontSize:14, color:'var(--fg-3)', cursor:'pointer' }}>Xem trang chủ</a>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9999, background:'var(--blue-100)',
                          color:'var(--blue-600)',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
              <User size={16} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:14, fontWeight:500, color:'var(--fg-1)' }}>{user.name}</p>
              <p style={{ margin:0, fontSize:12, color:'var(--fg-4)' }}>{user.email}</p>
            </div>
          </div>
          <button title="Đăng xuất"
                  style={{ background:'transparent', border:'none', padding:8, borderRadius:8,
                           color:'var(--fg-4)', cursor:'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

// =========================================================================
//  AdminLayout
// =========================================================================
function AdminLayout({ active, onNav, title, user, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarW = collapsed ? 80 : 256;
  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-50)' }}>
      <AdminSidebar active={active} onNav={onNav} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarW, transition:'margin 300ms' }}>
        <AdminHeader user={user} title={title} />
        <main style={{ padding:32 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// =========================================================================
//  Reusable bits
// =========================================================================
function StatCard({ stat, onClick }) {
  const c = COLOR_BG[stat.color] || COLOR_BG.blue;
  const [hover, setHover] = useState(false);
  return (
    <a onClick={onClick}
       onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
       style={{ display:'block', cursor:'pointer',
                background:'#fff', borderRadius:16, padding:24,
                border:'1px solid var(--border-1)',
                boxShadow: hover ? 'var(--shadow-md)' : 'none',
                transition:'box-shadow 200ms' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:c.dot, color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
          <AIcon name={stat.icon} size={24} />
        </div>
        <div>
          <p style={{ margin:0, fontSize:24, fontWeight:700, color:'var(--fg-1)' }}>{stat.count}</p>
          <p style={{ margin:0, fontSize:14, color:'var(--fg-4)' }}>{stat.title}</p>
        </div>
      </div>
    </a>
  );
}

function QuickAction({ icon, color, label, onClick }) {
  const c = COLOR_BG[color] || COLOR_BG.blue;
  const I = ADMIN_ICON_MAP[icon] || Plus;
  const [hover, setHover] = useState(false);
  return (
    <a onClick={onClick}
       onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
       style={{ display:'flex', alignItems:'center', gap:12,
                padding:16, background: hover ? `color-mix(in oklab, ${c.bg} 70%, white)` : c.bg,
                color: c.fg, borderRadius:12, cursor:'pointer',
                transition:'background 150ms' }}>
      <I size={20} />
      <span style={{ fontWeight:500 }}>{label}</span>
    </a>
  );
}

function StatusPill({ status }) {
  const map = {
    'Chờ duyệt':    { bg:'var(--yellow-50)', fg:'var(--yellow-800)', border:'var(--yellow-200)' },
    'Đã duyệt':     { bg:'var(--green-50)',  fg:'var(--green-700)',  border:'var(--green-200)' },
    'Cần sửa':      { bg:'var(--red-50)',    fg:'var(--red-700)',    border:'var(--red-200)' },
    'Đã xuất bản':  { bg:'var(--blue-50)',   fg:'var(--blue-700)',   border:'var(--blue-200)' },
    'Bản nháp':     { bg:'var(--gray-100)',  fg:'var(--fg-3)',       border:'var(--gray-200)' },
  };
  const s = map[status] || map['Bản nháp'];
  return (
    <span style={{ display:'inline-flex', padding:'3px 10px', borderRadius:9999,
                   background:s.bg, color:s.fg, border:`1px solid ${s.border}`,
                   fontSize:12, fontWeight:600 }}>
      {status}
    </span>
  );
}

function AdminButton({ children, onClick, variant='primary', icon }) {
  const [hover, setHover] = useState(false);
  const variants = {
    primary: { bg:'var(--blue-500)', bgHover:'var(--blue-600)', fg:'#fff' },
    ghost:   { bg:'transparent',     bgHover:'var(--gray-100)',  fg:'var(--fg-2)' },
    danger:  { bg:'var(--red-500)',  bgHover:'var(--red-600)',   fg:'#fff' },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick}
            onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
            style={{ display:'inline-flex', alignItems:'center', gap:8,
                     padding:'10px 18px', background: hover ? v.bgHover : v.bg,
                     color:v.fg, border:'none', borderRadius:12,
                     fontWeight:600, fontSize:14, cursor:'pointer',
                     fontFamily:'var(--font-sans)', transition:'background 200ms' }}>
      {icon && React.createElement(icon, { size: 16 })}
      {children}
    </button>
  );
}

function SearchBar({ placeholder = 'Tìm kiếm…' }) {
  return (
    <div style={{ position:'relative', flex:1, maxWidth:360 }}>
      <Search size={18} style={{ position:'absolute', left:14, top:'50%',
                                  transform:'translateY(-50%)', color:'var(--fg-4)' }} />
      <input placeholder={placeholder}
             style={{ width:'100%', padding:'10px 14px 10px 42px',
                      border:'1px solid var(--border-2)', borderRadius:12,
                      fontSize:14, color:'var(--fg-1)', outline:'none',
                      fontFamily:'var(--font-sans)' }} />
    </div>
  );
}

Object.assign(window, {
  AIcon, ADMIN_ICON_MAP, COLOR_BG,
  AdminSidebar, AdminHeader, AdminLayout,
  StatCard, QuickAction, StatusPill, AdminButton, SearchBar,
});
