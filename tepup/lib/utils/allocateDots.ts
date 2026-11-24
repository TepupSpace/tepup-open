/**
 * Chia `total` chấm (hoặc ô, hình) cho các nhóm theo tỉ lệ `pops`, bằng phương pháp phần dư
 * lớn nhất, để tổng luôn đúng bằng `total`.
 *
 * Nhóm có người (`pop > 0`) luôn được ít nhất 1 chấm, để một nhóm rất nhỏ vẫn hiện trên lưới
 * (block "Đám đông tỉ lệ nền"); phần bù lấy từ nhóm đang nhiều chấm nhất. Vì vậy số chấm chỉ
 * để nhìn: con số chính xác phải tính từ `pops` thật.
 */
export function allocateDots(pops: readonly number[], total: number): number[] {
  const sum = pops.reduce((a, b) => a + (b > 0 ? b : 0), 0);
  if (sum <= 0 || total <= 0) return pops.map(() => 0);
  const raw = pops.map((p) => (p > 0 ? (p / sum) * total : 0));
  const out = raw.map((r) => Math.floor(r));
  pops.forEach((p, i) => {
    if (p > 0 && out[i] === 0) out[i] = 1;
  });
  let rest = total - out.reduce((a, b) => a + b, 0);
  const byFraction = raw
    .map((r, i) => ({ i, f: r - Math.floor(r) }))
    .filter(({ i }) => pops[i] > 0)
    .sort((a, b) => b.f - a.f);
  for (let k = 0; rest > 0 && byFraction.length; k++, rest--) out[byFraction[k % byFraction.length].i]++;
  while (rest < 0) {
    out[out.indexOf(Math.max(...out))]--;
    rest++;
  }
  return out;
}
