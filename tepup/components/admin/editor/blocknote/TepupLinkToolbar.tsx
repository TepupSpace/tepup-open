'use client';
import { DeleteLinkButton, LinkToolbar, OpenLinkButton, type LinkToolbarProps } from '@blocknote/react';

/**
 * Thanh nhỏ hiện khi bấm vào một link có sẵn trong bài: chỉ "Mở" và "Xoá liên kết".
 * Bỏ ô "Sửa liên kết" của BlockNote, vì ô đó cho gõ thẳng một URL ngoài mà không qua
 * mục Nguồn trong thư viện. Muốn đổi đích: xoá liên kết rồi dùng "Tham chiếu".
 */
export function TepupLinkToolbar(props: LinkToolbarProps) {
  return (
    <LinkToolbar {...props}>
      <OpenLinkButton url={props.url} />
      <DeleteLinkButton range={props.range} setToolbarOpen={props.setToolbarOpen} />
    </LinkToolbar>
  );
}
