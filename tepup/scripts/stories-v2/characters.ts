/**
 * The 6-character roster.
 *
 * The first four already exist on production — slug, name, role and colours are
 * reproduced verbatim so the seeder never rewrites them into something new.
 * `retiree` and `homemaker` are added by this rewrite: the old roster was made
 * entirely of "money / labour" personas, with nobody standing in for the person
 * whose data leaks (Bà Bảy) or the person who unknowingly spreads bad
 * information (Cô Nga).
 */
import type { CharacterSeed } from './types';

export const CHARACTERS: CharacterSeed[] = [
  {
    slug: 'student',
    name: 'Minh',
    role: 'Sinh viên năm 3',
    description: 'Sắp ra trường, muốn hiểu về thuế và tài chính cá nhân trước khi đi làm',
    icon: 'graduation-cap',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    sortOrder: 0,
  },
  {
    slug: 'office-worker',
    name: 'Hương',
    role: 'Nhân viên kế toán',
    description: 'Lương 15 triệu/tháng, muốn tối ưu thuế và bắt đầu đầu tư',
    icon: 'briefcase',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    sortOrder: 1,
  },
  {
    slug: 'street-vendor',
    name: 'Bác Tư',
    role: 'Chủ xe bánh mì',
    description: 'Bán bánh mì 10 năm, muốn hiểu nghĩa vụ thuế và mở rộng kinh doanh',
    icon: 'store',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    sortOrder: 2,
  },
  {
    slug: 'gig-driver',
    name: 'Đức',
    role: 'Tài xế công nghệ',
    description: 'Chạy xe ôm công nghệ 12 tiếng mỗi ngày, muốn hiểu quyền lợi lao động',
    icon: 'bike',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    sortOrder: 3,
  },
  {
    slug: 'retiree',
    name: 'Bà Bảy',
    role: 'Người hưu trí sống một mình',
    description: '72 tuổi, con cái ở xa, mới dùng điện thoại thông minh được hai năm, sống bằng lương hưu',
    icon: 'heart',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    sortOrder: 4,
  },
  {
    slug: 'homemaker',
    name: 'Cô Nga',
    role: 'Nội trợ, quản trị nhóm phụ huynh',
    description: '45 tuổi, ở nhà lo cho hai con, quản trị nhóm Facebook phụ huynh 800 thành viên',
    icon: 'users',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    sortOrder: 5,
  },
];
