import { IconStory, IconInteractive, IconPath, IconPrivate } from '../icons';

/** Section "Học như thế nào?" — Figma 140:5491 › Frame 1597880624. */

const ITEMS = [
  {
    Icon: IconStory,
    title: 'Học qua những câu chuyện gần gũi',
    body: 'Mỗi bài học bắt đầu từ những câu chuyện và tình huống quen thuộc trong đời sống Việt Nam, giúp bạn dễ dàng liên hệ kiến thức với những gì diễn ra xung quanh.',
  },
  {
    Icon: IconInteractive,
    title: 'Học bằng cách tương tác',
    body: 'Không chỉ đọc và tiếp nhận thông tin. Bạn sẽ được thử nghiệm, trả lời câu hỏi và khám phá các tình huống để hiểu sâu hơn về vấn đề.',
  },
  {
    Icon: IconPath,
    title: 'Lộ trình học từng bước',
    body: 'Các chủ đề được sắp xếp từ cơ bản đến nâng cao, giúp bạn xây dựng kiến thức một cách có hệ thống và học theo tốc độ của riêng mình.',
  },
  {
    Icon: IconPrivate,
    title: 'Miễn phí và tôn trọng quyền riêng tư',
    body: 'Tépup hoàn toàn miễn phí, không quảng cáo và không thu thập dữ liệu cá nhân. Bạn có thể học mà không cần tiết lộ danh tính.',
  },
];

export default function HowSection() {
  return (
    <section id="cach-hoc" className="lp-how">
      <div className="lp-sec__head">
        <h2 className="lp-h2">
          Học <span className="lp-b">như thế nào?</span>
        </h2>
        <p className="lp-sub">
          Thiết kế để bạn thực sự <span className="lp-em">hiểu</span>, không chỉ để biết.
        </p>
      </div>

      <div className="lp-how__grid">
        {ITEMS.map(({ Icon, title, body }) => (
          <div className="lp-how__item" key={title}>
            <Icon />
            <div>
              <h3 className="lp-card__title">{title}</h3>
              <p className="lp-card__body">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
