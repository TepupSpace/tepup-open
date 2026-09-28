/**
 * LibraryDocument records referenced by Logic 101 B02 ("Ngụy biện là gì?").
 *
 * None of these exist in any environment yet — B02 is the first lesson to cite them.
 * Upserted by slug, so re-running is safe.
 *
 * Sources map to final.md citations: c1 (Stanford/fallacies), c2 (IEP/valid-sound),
 * c3 (Toulmin), c7 (Tversky & Kahneman / anchoring).
 */

import type { LibraryDocSeed } from './library-docs';

export const B02_LIBRARY_DOCS: LibraryDocSeed[] = [
  {
    slug: 'stanford-fallacies',
    title: 'Fallacies — Stanford Encyclopedia of Philosophy',
    description:
      'Mục từ nền tảng về ngụy biện: vì sao "lập luận tồi có tính đánh lừa" mới là cách hiểu hữu ích, và vì sao lỗi phải có tính hệ thống chứ không phải một cú lỡ lời.',
    category: 'Bách khoa triết học — Logic',
    icon: 'library',
    content: {
      sections: [
        {
          heading: 'Nguồn',
          paragraphs: [
            'Stanford Encyclopedia of Philosophy, mục từ "Fallacies".',
            'https://plato.stanford.edu/entries/fallacies/',
          ],
        },
        {
          heading: 'Hai cách hiểu "ngụy biện"',
          paragraphs: [
            'Mục từ nêu hai quan niệm cạnh tranh nhau: ngụy biện là "niềm tin sai nhưng phổ biến" (false but popular beliefs), hoặc ngụy biện là "lập luận tồi có tính đánh lừa" (deceptively bad arguments).',
            'Khoá học này dùng cách hiểu thứ hai. Lý do: cách hiểu thứ nhất chỉ nói về nội dung có đúng hay không, còn cách thứ hai chỉ đúng vào chỗ khó chịu nhất — một lập luận có thể gồm toàn dữ kiện thật mà vẫn dẫn người nghe tới kết luận sai.',
          ],
        },
        {
          heading: 'Điều kiện "có hệ thống"',
          paragraphs: [
            'Một lỗi suy luận chỉ được xếp là ngụy biện khi nó lặp lại theo khuôn, đủ phổ biến để đặt tên và nhận diện được. Một cú lỡ lời ngẫu nhiên không phải ngụy biện.',
            'Đây là lý do việc học các khuôn ngụy biện có ích: chúng tái xuất hiện với cùng một hình dạng qua vô số bối cảnh khác nhau — quảng cáo, tranh luận chính trị, tin tức, hay một cuộc cãi vã trong gia đình.',
          ],
        },
      ],
    },
    sortOrder: 0,
  },
  {
    slug: 'valid-vs-sound-argument',
    title: 'Validity and Soundness — Đúng cấu trúc và Vững',
    description:
      'Phân biệt hai câu hỏi hoàn toàn tách bạch khi đánh giá một lập luận: cách nối có chặt không (valid), và các tiền đề có thật không (sound).',
    category: 'Bách khoa triết học — Logic',
    icon: 'scale',
    content: {
      sections: [
        {
          heading: 'Nguồn',
          paragraphs: [
            'Internet Encyclopedia of Philosophy, mục từ "Validity and Soundness".',
            'https://iep.utm.edu/val-snd/',
          ],
        },
        {
          heading: 'Đúng cấu trúc (valid)',
          paragraphs: [
            'Nguyên văn: một lập luận suy diễn là valid "khi và chỉ khi nó có dạng khiến cho việc các tiền đề đều đúng mà kết luận vẫn sai là điều bất khả".',
            'Điểm dễ nhầm nhất: valid KHÔNG nói gì về việc các tiền đề có thật hay không. Nó chỉ nói về cách nối. Một lập luận với tiền đề hoàn toàn bịa đặt vẫn có thể valid, miễn là nếu các tiền đề đó đúng thì kết luận buộc phải đúng theo.',
          ],
        },
        {
          heading: 'Vững (sound)',
          paragraphs: [
            'Một lập luận là sound khi nó vừa valid VỪA có mọi tiền đề đều đúng thật. Đây mới là thứ đáng để gật đầu.',
            'Ứng dụng cho mẫu quảng cáo giá gạch ngang: sau khi viết tiền đề ẩn ra ("món này từng được bán thật ở 2.000.000đ"), lập luận trở nên valid — nếu cả ba tiền đề đúng thì bạn lợi 1.401.000đ thật. Nhưng nó không sound, vì đúng cái tiền đề vừa viết ra mới là cái sai.',
            'Nghịch lý hữu ích: làm cho lập luận chặt hơn lại chính là cách phơi ra chỗ nó hỏng.',
          ],
        },
      ],
    },
    sortOrder: 0,
  },
  {
    slug: 'toulmin-model-lap-luan',
    title: 'Mô hình Toulmin — Ground, Claim, Warrant',
    description:
      'Stephen Toulmin (1958) tách một lập luận thành căn cứ, tuyên bố và nhịp cầu nối giữa hai cái đó. "Warrant" chính là tiền đề ẩn — mảnh thường không ai phát biểu.',
    category: 'Mô hình phân tích lập luận',
    icon: 'git-merge',
    content: {
      sections: [
        {
          heading: 'Nguồn',
          paragraphs: [
            'Stephen Toulmin, "The Uses of Argument" (1958).',
            'https://en.wikipedia.org/wiki/Stephen_Toulmin',
          ],
        },
        {
          heading: 'Ba thành phần cốt lõi',
          paragraphs: [
            'Căn cứ (ground/data): sự kiện được viện đến làm nền cho tuyên bố — tương ứng với "tiền đề" trong bài.',
            'Tuyên bố (claim): điều cần được chứng minh — tương ứng với "kết luận".',
            'Nhịp cầu (warrant): câu cho phép đi từ căn cứ sang tuyên bố. Đây chính là tiền đề ẩn. Hai bên bờ thì ai cũng thấy; nhịp giữa thì trong suốt.',
          ],
        },
        {
          heading: 'Vì sao warrant hay bị bỏ trống',
          paragraphs: [
            'Toulmin chỉ ra rằng trong giao tiếp thật, warrant gần như luôn được để ngầm — người nói mặc định người nghe sẽ tự điền vào.',
            'Điều này không phải dấu hiệu của kẻ gian: "Trời đang mưa nên tôi mang ô" cũng giấu một warrant ("mang ô thì đỡ ướt"), và warrant đó đúng, không ai tranh cãi.',
            'Vấn đề chỉ phát sinh khi chính mảnh bị bỏ đi lại là mảnh sai. Thao tác phòng vệ vì thế rất đơn giản: viết warrant ra thành một câu tử tế, rồi hỏi nó có đúng không.',
          ],
        },
      ],
    },
    sortOrder: 0,
  },
  {
    slug: 'anchoring-neo-gia',
    title: 'Anchoring — Hiệu ứng neo giá',
    description:
      'Tversky & Kahneman (1974): con người ước lượng bằng cách bắt đầu từ một con số ban đầu rồi chỉnh dần — và phần chỉnh gần như luôn thiếu. Kể cả khi được trả thưởng cho độ chính xác.',
    category: 'Paper academic — Tâm lý học hành vi',
    icon: 'anchor',
    content: {
      sections: [
        {
          heading: 'Nguồn',
          paragraphs: [
            'Amos Tversky & Daniel Kahneman, "Judgment under Uncertainty: Heuristics and Biases", Science, 1974.',
            'https://www.jstor.org/stable/1738360',
          ],
        },
        {
          heading: 'Cơ chế',
          paragraphs: [
            'Khi phải ước lượng một đại lượng, người ta bắt đầu từ một giá trị khởi điểm có sẵn rồi điều chỉnh dần về phía đáp án. Vấn đề: phần điều chỉnh gần như luôn không đủ, nên ước lượng cuối cùng bị kéo lệch về phía con số ban đầu.',
            'Giá trị khởi điểm đó không cần phải đáng tin. Trong thí nghiệm gốc, ngay cả một con số được tạo ra ngẫu nhiên ngay trước mặt người tham gia vẫn kéo lệch được ước lượng của họ.',
          ],
        },
        {
          heading: 'Vì sao "cố gắng tỉnh táo hơn" không giải quyết được',
          paragraphs: [
            'Chi tiết quan trọng nhất cho bài học này: hiệu ứng neo KHÔNG giảm ngay cả khi người tham gia được trả thưởng cho độ chính xác. Nỗ lực nhiều hơn không phải là lời giải.',
            'Áp vào chuyện mua sắm: con số bị gạch ngang không được não xử lý như một tuyên bố cần kiểm tra, mà như một điểm xuất phát. Bạn không đang tin nó — bạn đang đứng lên nó mà đo.',
            'Hệ quả thực tiễn: thứ thay thế được "cảnh giác" chỉ có thể là một thao tác cố định, chạy được cả lúc đầu óc đang lười — chứ không phải một lời khuyên về thái độ.',
          ],
        },
      ],
    },
    sortOrder: 0,
  },
];
