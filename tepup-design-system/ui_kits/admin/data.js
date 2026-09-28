// Fake content for the Tepup Admin UI Kit
window.ADMIN_DATA = {
  user: { name: 'Nguyễn Quỳnh Anh', email: 'qa@tepup.vn', role: 'ADMIN' },

  stats: [
    { title: 'Danh mục',   count: 3,   icon: 'folder-tree',     color: 'purple', href: 'categories' },
    { title: 'Khóa học',   count: 14,  icon: 'book-open',       color: 'blue',   href: 'courses' },
    { title: 'Bài học',    count: 187, icon: 'graduation-cap',  color: 'green',  href: 'lessons' },
    { title: 'Nhân vật',   count: 4,   icon: 'users',           color: 'orange', href: 'characters' },
    { title: 'Câu chuyện', count: 12,  icon: 'book-marked',     color: 'pink',   href: 'stories' },
  ],

  reviews: [
    { id:'r1', title:'Cung và Cầu cơ bản',      type:'Bài học',    status:'Chờ duyệt',  author:'AI Draft', date:'15/05' },
    { id:'r2', title:'Tiền lương đầu tiên của Minh', type:'Câu chuyện', status:'Chờ duyệt',  author:'AI Draft', date:'14/05' },
    { id:'r3', title:'Hệ thống Thuế VN — Chương 1', type:'Bài học', status:'Đã duyệt',  author:'Hương Lê',  date:'13/05' },
    { id:'r4', title:'Phương pháp khoa học',     type:'Bài học',    status:'Cần sửa',     author:'AI Draft', date:'12/05' },
    { id:'r5', title:'Bác Tư — Chương 3: Giá rau cuối tuần', type:'Câu chuyện', status:'Chờ duyệt', author:'AI Draft', date:'11/05' },
  ],

  courses: [
    { id:'c1', name:'Nhập môn Kinh tế',   slug:'nhap-mon-kinh-te', category:'Nền tảng KHXH', icon:'pie-chart', lessons:14, status:'Đã xuất bản' },
    { id:'c2', name:'Tư duy phản biện',   slug:'tu-duy-phan-bien', category:'Nền tảng KHXH', icon:'lightbulb', lessons:12, status:'Đã xuất bản' },
    { id:'c3', name:'Hệ thống Thuế VN',   slug:'he-thong-thue-vn', category:'Kinh tế & Thuế', icon:'receipt',   lessons:11, status:'Bản nháp' },
    { id:'c4', name:'Lạm phát & CPI',     slug:'lam-phat-va-cpi',  category:'Kinh tế & Thuế', icon:'trending-up', lessons:7, status:'Đã xuất bản' },
    { id:'c5', name:'Công bằng xã hội',   slug:'cong-bang-xa-hoi', category:'Triết học Chính trị', icon:'scale', lessons:12, status:'Đã xuất bản' },
  ],
};
