import Link from '@/components/ui/AppLink';
import { IconTax, IconThinking, IconDigital, IconArrow } from '../icons';

/** Section "03 trụ cột kiến thức" — Figma 140:5491 › Frame 1597880633. */

const PILLARS = [
  {
    Icon: IconTax,
    eyebrow: 'Tiền của bạn đi đâu?',
    color: 'var(--teal)',
    title: 'Thuế & Ta',
    body: 'Hiểu cách nhà nước thu và chi tiêu thuế, bạn có những quyền lợi và nghĩa vụ gì khi đóng thuế.',
  },
  {
    Icon: IconThinking,
    eyebrow: 'Nghĩ rõ ràng giữa thông tin ngồn ngộn',
    color: 'var(--blue)',
    title: 'Tư Duy & Ta',
    body: 'Nhận diện ngụy biện, đánh giá nguồn tin, phân biệt sự thật với cảm xúc. Công cụ tư duy để bạn không bị “dắt mũi”.',
  },
  {
    Icon: IconDigital,
    eyebrow: 'Tự bảo vệ trên không gian số',
    color: 'var(--pink)',
    title: 'Quyền Số & Ta',
    body: 'Hiểu dữ liệu cá nhân của bạn nằm ở đâu, ai có thể xem, và làm sao để bạn kiểm soát nó. Quyền riêng tư trong thời đại số.',
  },
];

export default function PillarsSection() {
  return (
    <section id="ba-tru-cot" className="lp-pillars">
      <div className="lp-sec__head">
        <h2 className="lp-h2">
          03 <span className="lp-b">trụ cột kiến thức</span>
        </h2>
        <p className="lp-sub">Ba lĩnh vực thiết yếu, bổ trợ cho nhau</p>
      </div>

      <div className="lp-pillars__row">
        {PILLARS.map(({ Icon, eyebrow, color, title, body }) => (
          <div className="lp-pillars__col" key={title}>
            <Icon />
            <div>
              <p className="lp-eyebrow" style={{ color }}>
                {eyebrow}
              </p>
              <h3 className="lp-card__title">{title}</h3>
              <p className="lp-card__body">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Link href="/courses" className="lp-link">
        Xem các khoá học hiện có
        <IconArrow />
      </Link>
    </section>
  );
}
