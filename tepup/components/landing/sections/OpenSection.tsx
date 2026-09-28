import Link from '@/components/ui/AppLink';
import { IconArrow, IconHandTap } from '../icons';

/** Section "Nền tảng mở cho tất cả" — Figma 140:5491 › Frame 1597880634. */

export default function OpenSection() {
  return (
    <section id="dong-gop" className="lp-open">
      <div className="lp-open__text">
        <h2 className="lp-h2">
          <span className="lp-b">Nền tảng</span> mở <span className="lp-b">cho tất cả</span>
        </h2>

        <div className="lp-open__paras">
          <p>
            Được truyền cảm hứng bởi <strong>Wikipedia</strong>, Tépup tin rằng kiến thức tốt nhất
            khi được xây dựng bởi chính <strong>cộng đồng</strong> — không phải bởi một nhóm nhỏ
            chuyên gia đứng từ trên xuống.
          </p>
          <p>
            Bất kỳ ai có kiến thức muốn chia sẻ đều có thể đóng góp khóa học, bài học, và tài liệu
            cho Tépup. Bạn là luật sư, nhà giáo, nhà báo, kỹ sư, hay chỉ đơn giản là người đã tự tìm
            hiểu một chủ đề — đều có chỗ cho bạn ở đây.
          </p>
          <p className="lp-open__note">
            <b>Ẩn danh hoàn toàn</b>, không cần email, không cần tên thật. Chỉ cần một username và
            kiến thức bạn muốn chia sẻ.
            <br />
            *Mỗi đóng góp đều được cộng đồng rà soát trước khi xuất bản.
          </p>
        </div>
      </div>

      <div className="lp-open__actions">
        <Link href="/contributor" className="lp-btn lp-btn--solid">
          Trở thành người đóng góp
          <IconHandTap />
        </Link>
        <Link href="/contributor-guide" className="lp-btn lp-btn--outline">
          Tìm hiểu cách đóng góp
          <IconArrow />
        </Link>
      </div>
    </section>
  );
}
