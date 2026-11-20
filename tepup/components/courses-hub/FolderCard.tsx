import type { CSSProperties } from 'react';
import Link from '@/components/ui/AppLink';
import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import './folder-card.css';

interface FolderCardProps {
  title: string;
  imageUrl?: string | null;
  isNew?: boolean;
  /** Có `href`: cả thẻ là một liên kết. Không có: bản xem trước tĩnh (admin). */
  href?: string;
  /** Biến màu danh mục (`categoryColorStyle()`); bỏ trống thì kế thừa từ phần tử cha. */
  style?: CSSProperties;
  /** Thẻ bọc ngoài: `li` khi nằm trong danh sách kệ, `div` cho bản xem trước. */
  as?: 'li' | 'div';
}

/**
 * Một thẻ folder khoá học (design demo-course-stories, `.folder`): ảnh bìa 190×170
 * cắm trong thân folder tô màu danh mục, tên khoá chữ Fraunces trắng, nhãn "Mới".
 * Không dùng hook nên chạy được trong server component lẫn client component.
 */
export default function FolderCard({
  title,
  imageUrl,
  isNew,
  href,
  style,
  as: Tag = 'li',
}: FolderCardProps) {
  // Ảnh bìa ngoài danh sách host cho phép thì không tải (không lộ IP người học): hiện bìa trống.
  const cover = isAllowedMediaUrl(imageUrl) ? imageUrl : null;
  const inner = (
    <>
      <span className={`pf-folder__img${cover ? '' : ' pf-folder__img--blank'}`}>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh bìa 190×170 từ Supabase Storage (host đã giới hạn)
          <img src={cover} alt="" loading="lazy" decoding="async" />
        )}
      </span>
      <span className="pf-folder__body">
        <span className="pf-folder__shape" aria-hidden="true" />
        <span className="pf-folder__title">
          <span>{title}</span>
        </span>
      </span>
      {isNew && <span className="pf-folder__badge">Mới</span>}
    </>
  );

  return (
    <Tag className="pf-folder" style={style}>
      {href ? (
        <Link className="pf-folder__link" href={href}>
          {inner}
        </Link>
      ) : (
        <span className="pf-folder__link" aria-hidden="true">
          {inner}
        </span>
      )}
    </Tag>
  );
}
