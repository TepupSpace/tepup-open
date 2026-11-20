'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import {
  CheckCircle2,
  Compass,
  Copy,
  Download,
  EllipsisVertical,
  Globe,
  LayoutGrid,
  Menu,
  Share,
  Smartphone,
  SquarePlus,
  ToggleRight,
  Zap,
  Maximize,
  BookmarkCheck,
  BadgeCheck,
} from 'lucide-react';
import {
  detectPlatform,
  getInstallPrompt,
  isInAppBrowser,
  isStandalone,
  runInstallPrompt,
  subscribeInstallPrompt,
  type Platform,
} from '@/lib/pwa/platform';

type Tab = 'ios' | 'android';

const noSubscribe = () => () => {};

interface Step {
  icon: ReactNode;
  body: ReactNode;
}

const IOS_STEPS: Step[] = [
  {
    icon: <Compass aria-hidden="true" />,
    body: (
      <>
        Mở <b>tepup.space</b> bằng <b>Safari</b>. (Từ iOS 16.4, Chrome và Edge trên iPhone cũng làm được, các bước
        giống hệt.)
      </>
    ),
  },
  {
    icon: <Share aria-hidden="true" />,
    body: (
      <>
        Bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên chỉ lên). iPhone: ở thanh dưới cùng. iPad: góc trên bên phải. Nếu
        không thấy, bấm <b>•••</b> cạnh thanh địa chỉ rồi chọn <b>Chia sẻ</b>.
      </>
    ),
  },
  {
    icon: <SquarePlus aria-hidden="true" />,
    body: (
      <>
        Kéo danh sách xuống, chọn <b>Thêm vào MH chính</b> (Add to Home Screen).
      </>
    ),
  },
  {
    icon: <ToggleRight aria-hidden="true" />,
    body: (
      <>
        Nếu có ô <b>Mở dưới dạng ứng dụng web</b>, để nó bật. Bấm <b>Thêm</b> ở góc trên bên phải.
      </>
    ),
  },
  {
    icon: <Smartphone aria-hidden="true" />,
    body: (
      <>
        Biểu tượng con tôm Tépup xuất hiện trên màn hình chính. Từ giờ mở Tépup từ biểu tượng này.
      </>
    ),
  },
];

const ANDROID_STEPS: Step[] = [
  {
    icon: <Globe aria-hidden="true" />,
    body: (
      <>
        Mở <b>tepup.space</b> bằng <b>Chrome</b>.
      </>
    ),
  },
  {
    icon: <EllipsisVertical aria-hidden="true" />,
    body: (
      <>
        Bấm nút <b>⋮</b> (ba chấm dọc) ở góc trên bên phải.
      </>
    ),
  },
  {
    icon: <Download aria-hidden="true" />,
    body: (
      <>
        Chọn <b>Cài đặt ứng dụng</b>. Máy đời cũ có thể ghi <b>Thêm vào màn hình chính</b>.
      </>
    ),
  },
  {
    icon: <CheckCircle2 aria-hidden="true" />,
    body: (
      <>
        Bấm <b>Cài đặt</b> để xác nhận.
      </>
    ),
  },
  {
    icon: <LayoutGrid aria-hidden="true" />,
    body: (
      <>
        Biểu tượng Tépup xuất hiện trên màn hình chính và trong ngăn ứng dụng.
      </>
    ),
  },
];

const BENEFITS = [
  { icon: <Zap aria-hidden="true" />, text: 'Mở nhanh từ màn hình chính' },
  { icon: <Maximize aria-hidden="true" />, text: 'Toàn màn hình, không thanh địa chỉ' },
  { icon: <BookmarkCheck aria-hidden="true" />, text: 'Tiến độ học được mang theo' },
  { icon: <BadgeCheck aria-hidden="true" />, text: 'Miễn phí, không cần tài khoản hay cửa hàng ứng dụng' },
];

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="ig-steps">
      {steps.map((s, i) => (
        <li key={i} className="ig-step">
          <span className="ig-step__num" aria-hidden="true">
            {i + 1}
          </span>
          <span className="ig-step__icon">{s.icon}</span>
          <span className="ig-step__body">{s.body}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Hướng dẫn cài Tépup về máy (PWA), nằm trong bảng Cài đặt.
 *
 * iOS không có API cài: chỉ có thể chỉ từng bước trong Safari. Android (Chromium)
 * cho gọi hộp thoại cài bằng mã → nút "Cài đặt ngay", kèm các bước bấm tay phòng
 * khi trình duyệt chưa cho. Mở trong trình duyệt của Facebook/Zalo… thì không cài
 * được ở cả hai: nhắc mở bằng Safari/Chrome và cho sao chép đường dẫn.
 */
export default function InstallGuide() {
  const platform = useSyncExternalStore<Platform>(noSubscribe, detectPlatform, () => 'other');
  const inApp = useSyncExternalStore(noSubscribe, isInAppBrowser, () => false);
  const installed = useSyncExternalStore(noSubscribe, isStandalone, () => false);
  const canPrompt = useSyncExternalStore(subscribeInstallPrompt, () => !!getInstallPrompt(), () => false);

  const [tab, setTab] = useState<Tab | null>(null);
  const current: Tab = tab ?? (platform === 'android' ? 'android' : 'ios');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const base = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ ios: null, android: null });

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setStatus('Đã sao chép đường dẫn Tépup.');
    } catch {
      setStatus('Không sao chép được. Hãy gõ tepup.space vào trình duyệt.');
    }
  };

  const install = async () => {
    const ok = await runInstallPrompt();
    setStatus(ok ? 'Đang cài Tépup về máy.' : 'Đã huỷ cài đặt.');
  };

  // Mẫu tab của WAI-ARIA: mũi tên trái/phải chuyển tab, Home/End về đầu/cuối.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const order: Tab[] = ['ios', 'android'];
    const i = order.indexOf(current);
    let next: Tab | null = null;
    if (e.key === 'ArrowRight') next = order[(i + 1) % order.length];
    else if (e.key === 'ArrowLeft') next = order[(i - 1 + order.length) % order.length];
    else if (e.key === 'Home') next = order[0];
    else if (e.key === 'End') next = order[order.length - 1];
    if (!next) return;
    e.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ios', label: 'iPhone / iPad' },
    { id: 'android', label: 'Android' },
  ];

  return (
    <div className="ig">
      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      {installed ? (
        <p className="ig-note ig-note--ok">
          <CheckCircle2 aria-hidden="true" />
          <span>Bạn đang mở Tépup từ màn hình chính: đã cài xong.</span>
        </p>
      ) : (
        <ul className="ig-benefits">
          {BENEFITS.map((b) => (
            <li key={b.text}>
              {b.icon}
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      )}

      {inApp && !installed && (
        <div className="ig-note ig-note--warn" role="note">
          <span>
            Bạn đang mở Tépup bên trong một ứng dụng khác (Facebook, Messenger, Zalo…), nơi không cài được. Bấm{' '}
            <b>•••</b> hoặc <b>⋮</b> rồi chọn <b>Mở bằng trình duyệt</b> (Safari trên iPhone, Chrome trên Android), hoặc
            sao chép đường dẫn để dán vào trình duyệt.
          </span>
          <button type="button" className="ig-btn ig-btn--ghost" onClick={copyLink}>
            <Copy aria-hidden="true" />
            {copied ? 'Đã sao chép' : 'Sao chép đường dẫn'}
          </button>
        </div>
      )}

      <div className="ig-tabs" role="tablist" aria-label="Chọn loại điện thoại">
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={current === t.id}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={current === t.id ? 0 : -1}
            className="ig-tab"
            onClick={() => setTab(t.id)}
            onKeyDown={onTabKey}
          >
            {t.label}
            {platform === t.id && <span className="ig-tab__here">Máy của bạn</span>}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={current !== t.id}
          tabIndex={0}
          className="ig-panel"
        >
          {t.id === 'android' && canPrompt && !installed && (
            <div className="ig-quick">
              <button type="button" className="ig-btn ig-btn--primary" onClick={install}>
                <Download aria-hidden="true" />
                Cài đặt ngay
              </button>
              <span>Một chạm là xong. Hoặc làm tay theo các bước dưới đây.</span>
            </div>
          )}
          <Steps steps={t.id === 'ios' ? IOS_STEPS : ANDROID_STEPS} />
          {t.id === 'android' ? (
            <p className="ig-extra">
              <Menu aria-hidden="true" />
              <span>
                <b>Samsung Internet:</b> bấm <b>≡</b> ở góc dưới bên phải → <b>Thêm trang vào</b> →{' '}
                <b>Màn hình chính</b>.
              </span>
            </p>
          ) : (
            <p className="ig-extra">
              <Smartphone aria-hidden="true" />
              <span>
                Không thấy <b>Thêm vào MH chính</b>? Kiểm tra bạn đang mở bằng Safari, không phải trong Facebook hay
                Zalo.
              </span>
            </p>
          )}
        </div>
      ))}

      {platform === 'other' && !installed && (
        <p className="ig-extra">
          <Download aria-hidden="true" />
          <span>
            <b>Trên máy tính</b> (Chrome, Edge): bấm biểu tượng cài đặt ở cuối thanh địa chỉ, hoặc menu <b>⋮</b> →{' '}
            <b>Cài đặt Tépup</b>.
          </span>
        </p>
      )}
    </div>
  );
}
