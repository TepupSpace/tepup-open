'use client';

import { useEffect } from 'react';

/**
 * Khai báo chiều cao phần giao diện dính ở đáy màn hình hiện tại.
 *
 * Nút chat nổi nằm trong Providers, tức là anh em với cây trang chứ không phải
 * con cháu, nên nó không thể thừa kế biến CSS từ layout. Thay vào đó, màn nào có
 * thanh dính ở đáy thì tự ghi chiều cao của mình lên thẻ gốc, và nút chat đọc
 * biến đó để tự nâng lên — nếu không nó sẽ che mất nút Tiếp tục hoặc thanh tab.
 *
 * Phần đệm vùng an toàn không tính ở đây; bên dùng tự cộng thêm.
 */
export function useBottomChrome(height: string) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue('--bottom-chrome');
    root.style.setProperty('--bottom-chrome', height);

    return () => {
      if (previous) root.style.setProperty('--bottom-chrome', previous);
      else root.style.removeProperty('--bottom-chrome');
    };
  }, [height]);
}
