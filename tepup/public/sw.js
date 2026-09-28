/**
 * Service worker tối thiểu — cố ý không nhớ đệm gì cả.
 *
 * Nó tồn tại vì Chrome/Android chỉ hiện nút "Cài đặt" khi trang có service worker
 * đăng ký kèm trình xử lý fetch. iOS không cần điều này (Chia sẻ → Thêm vào Màn
 * hình chính luôn hoạt động).
 *
 * Tepup là nền tảng nội dung, admin sửa bài liên tục, mà nhớ đệm sai trong một app
 * đã cài thì người học không có cách nào tải lại để thoát ra. Nên mọi request đều
 * đi thẳng ra mạng: nội dung luôn mới, đổi lại mất mạng là trang trắng.
 */
const VERSION = 'tepup-sw-v1-no-cache';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Dọn sạch nhớ đệm nếu một phiên bản trước đó từng tạo.
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

// Trình xử lý rỗng: không gọi respondWith nên trình duyệt tự đi mạng như thường.
// Bỏ hẳn listener này thì Chrome không coi trang là cài đặt được.
self.addEventListener('fetch', () => {});
