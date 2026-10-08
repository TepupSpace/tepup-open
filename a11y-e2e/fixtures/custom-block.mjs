// Prints SQL for a LOCAL-ONLY test lesson with a custom (Sandpack) block, in the inactive
// "sandbox-block" course (learners can't see it; the signed-in staff view can).
// The component is written the way the generator's old instructions produced blocks
// (div with onClick, unlabelled input, blue-500 button, pale text), so the audit can show
// what axe finds inside the sandbox iframe and test the wrapper's "Bỏ qua bài tập" escape.
// run.sh pipes this into the local Docker database only.
const app = `import { useState } from 'react';
export default function App() {
  const fields = (typeof window !== 'undefined' && window.__BLOCK_FIELDS) || {};
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const finish = () => { setDone(true); window.parent.postMessage({ type: 'tepup:complete' }, '*'); };
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h3 style={{ color: '#9ca3af' }}>{fields.title || 'Bạn sẽ chi bao nhiêu cho thuế?'}</h3>
      <input type="number" value={n} onChange={(e) => setN(Number(e.target.value))} style={{ outline: 'none' }} />
      <div onClick={() => setN(n + 10)} style={{ cursor: 'pointer', background: '#e5e7eb', padding: 8, marginTop: 8 }}>+10</div>
      <button onClick={finish} style={{ background: '#3b82f6', color: '#fff', border: 0, padding: '8px 16px', marginTop: 8 }}>Xong</button>
      {done && <p style={{ color: '#22c55e' }}>Hoàn thành!</p>}
    </div>
  );
}
`;

const blocks = [
  { type: 'text', title: 'Bài thử khối tuỳ chỉnh', paragraphs: ['Bài này chỉ có ở môi trường local, để kiểm tra trợ năng của khối tuỳ chỉnh.'] },
  {
    type: 'custom',
    customBlockTypeId: 'a11y_fixture_type',
    fields: { title: 'Bạn sẽ chi bao nhiêu cho thuế?' },
    configSnapshot: { version: 2, name: 'Ước tính thuế (thử nghiệm)', files: { '/App.jsx': app }, editorSchema: [] },
  },
  { type: 'text', title: 'Sau bài tập', paragraphs: ['Phần này chỉ hiện sau khi xong hoặc bỏ qua bài tập.'] },
];

const json = JSON.stringify(blocks);
console.log(`
BEGIN;
DELETE FROM "LessonContent" WHERE "lessonId" = 'a11y_fixture_custom';
DELETE FROM "Lesson" WHERE id = 'a11y_fixture_custom';
INSERT INTO "Lesson" (id, slug, name, "isActive", "sortOrder", "courseId", "levelId", "updatedAt")
SELECT 'a11y_fixture_custom', 'a11y-custom-block-fixture', 'A11y: khối tuỳ chỉnh (local)', true, 999, c.id,
       (SELECT v.id FROM "Level" v WHERE v."courseId" = c.id ORDER BY v."sortOrder" LIMIT 1), now()
FROM "Course" c WHERE c.slug = 'sandbox-block';
INSERT INTO "LessonContent" (id, "lessonId", title, blocks, "updatedAt")
VALUES ('a11y_fixture_custom_content', 'a11y_fixture_custom', 'A11y: khối tuỳ chỉnh', $json$${json}$json$::jsonb, now());
COMMIT;
`);
