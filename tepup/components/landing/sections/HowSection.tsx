import { IconStory, IconInteractive, IconPath, IconPrivate } from '../icons';

/** Section "Học như thế nào?" — Figma 140:5491 › Frame 1597880624. */

const ITEMS = [
  {
    Icon: IconStory,
    title: 'Học qua câu chuyện ngắn',
    body: 'Mỗi bài học gắn với hành trình của những nhân vật đời thực ở Việt Nam — dễ hiểu và gần gũi với cuộc sống.',
  },
  {
    Icon: IconInteractive,
    title: 'Tương tác thực tế',
    body: 'Không chỉ đọc chay. Mỗi bài học đi kèm bài tập mô phỏng và câu hỏi để bạn dễ hiểu, không chỉ lướt qua.',
  },
  {
    Icon: IconPath,
    title: 'Lộ trình rõ ràng',
    body: 'Từ cơ bản đến nâng cao, chia thành từng bước nhỏ vừa sức. Bạn biết mình đang ở đâu và sẽ đi đến đâu.',
  },
  {
    Icon: IconPrivate,
    title: 'Riêng tư và miễn phí',
    body: 'Tépup không thu thập dữ liệu cá nhân. Bạn có thể học ẩn danh, hoàn toàn không phí và không quảng cáo.',
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
