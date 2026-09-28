import Link from '@/components/ui/AppLink';
import { IconArrow } from '../icons';

/** Card CTA "Sẵn sàng bắt đầu" — Figma 140:5491 › Frame 1597880630. */

export default function FinalCta() {
  return (
    <section className="lp-final">
      <div className="lp-final__inner">
        <div className="lp-final__head">
          <h2 className="lp-h2">
            <span className="lp-b">Sẵn sàng</span> bắt đầu
          </h2>
          <p className="lp-final__sub">
            Học thử 1 bài đầu tiên — chỉ mất <strong>5 phút.</strong>
          </p>
        </div>
        <Link href="/courses" className="lp-btn lp-btn--solid">
          Bắt đầu học
          <IconArrow />
        </Link>
      </div>
    </section>
  );
}
