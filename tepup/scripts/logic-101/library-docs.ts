/**
 * LibraryDocument records referenced by Logic 101 B01.
 *
 * The first five are lifted verbatim from the staging DB, where they were authored
 * alongside `add-logic-101-v2-course.ts`. Production has none of them — its 12 existing
 * library documents are all tax/economics. The sixth (Lord/Ross/Lepper 1979) is new:
 * B01 cites it for attitude polarization but it was never seeded anywhere.
 *
 * Upserted by slug, so re-running is safe and will not duplicate.
 */

export interface LibraryDocSeed {
  slug: string;
  title: string;
  description: string;
  category: string | null;
  icon: string | null;
  content: { sections: { heading?: string; paragraphs: string[] }[] };
  sortOrder: number;
}

export const B01_LIBRARY_DOCS: LibraryDocSeed[] = [
  {
    "slug": "nickerson-1998-confirmation-bias",
    "title": "Confirmation Bias: A Ubiquitous Phenomenon in Many Guises",
    "description": "Bài review canonical của Raymond Nickerson (1998) tổng hợp toàn bộ nghiên cứu về thiên kiến xác nhận. Cover trọn 3 stage Input/Processing/Output.",
    "category": "Paper academic — Tâm lý học",
    "icon": "book-open",
    "content": {
      "sections": [
        {
          "heading": "Tác giả & xuất bản",
          "paragraphs": [
            "Raymond S. Nickerson, Tufts University.",
            "Review of General Psychology, 1998, Vol. 2, No. 2, 175-220."
          ]
        },
        {
          "heading": "Tóm tắt",
          "paragraphs": [
            "Nickerson định nghĩa confirmation bias là \"xu hướng tìm kiếm hoặc diễn giải bằng chứng theo cách thiên về niềm tin sẵn có, kỳ vọng, hoặc giả thuyết đang xem xét\".",
            "Ông gọi đây là \"ubiquitous phenomenon\" — hiện tượng có mặt khắp nơi, từ khoa học, chính trị, tôn giáo đến đầu tư và quan hệ cá nhân.",
            "Bài review tổng hợp các thí nghiệm classic (Wason 2-4-6, Lord/Ross/Lepper death penalty, Snyder/Swann hypothesis testing) và các sub-mechanism (selective exposure, biased interpretation, belief perseverance)."
          ]
        },
        {
          "heading": "Nguồn",
          "paragraphs": [
            "SAGE Journals: https://journals.sagepub.com/doi/abs/10.1037/1089-2680.2.2.175"
          ]
        }
      ]
    },
    "sortOrder": 1
  },
  {
    "slug": "wason-1960-2-4-6-task",
    "title": "On the failure to eliminate hypotheses in a conceptual task",
    "description": "Thí nghiệm 2-4-6 cổ điển của Peter Wason (1960). Sinh viên đoán quy tắc đằng sau dãy số \"2-4-6\" — đa số chỉ test các bộ ba khẳng định giả thuyết, hiếm khi test bộ phá giả thuyết.",
    "category": "Paper academic — Tâm lý học",
    "icon": "flask-conical",
    "content": {
      "sections": [
        {
          "heading": "Tác giả & xuất bản",
          "paragraphs": [
            "Peter C. Wason, University College London.",
            "Quarterly Journal of Experimental Psychology, 1960, Vol. 12, No. 3, 129-140."
          ]
        },
        {
          "heading": "Thí nghiệm",
          "paragraphs": [
            "Wason đưa cho mỗi sinh viên dãy \"2-4-6\" và bảo họ đoán quy tắc đằng sau. Sinh viên được test giả thuyết bằng cách đề xuất các bộ ba số mới và Wason sẽ nói \"đúng\" hoặc \"sai\".",
            "Đa số sinh viên đoán \"số chẵn tăng dần\" rồi test bằng các bộ \"4-6-8\", \"10-12-14\", \"20-22-24\" — đều khớp với giả thuyết của họ.",
            "Quy tắc thật chỉ là \"ba số tăng dần\" — bất kỳ ba số nào tăng. Sinh viên hiếm khi thử các bộ phá giả thuyết (vd. \"1-2-3\", \"5-7-100\"). Kết quả: chỉ 6/29 sinh viên ra quy tắc đúng ngay lần đầu."
          ]
        },
        {
          "heading": "Ý nghĩa",
          "paragraphs": [
            "Đây là phiên bản phòng thí nghiệm sạch nhất của confirmation bias — không cảm xúc, không chính trị, không stake. Não vẫn tự động tìm bằng chứng \"khớp\" và bỏ qua bằng chứng phủ định."
          ]
        },
        {
          "heading": "Nguồn",
          "paragraphs": [
            "SAGE Journals: https://journals.sagepub.com/doi/10.1080/17470216008416717"
          ]
        }
      ]
    },
    "sortOrder": 2
  },
  {
    "slug": "kahneman-thinking-fast-and-slow",
    "title": "Thinking, Fast and Slow",
    "description": "Sách của Daniel Kahneman (2011) — phân biệt System 1 (Hệ 1, tư duy nhanh, tự động) với System 2 (Hệ 2, tư duy chậm, có chủ ý). Nền tảng cơ chế giải thích vì sao confirmation bias chạy ngầm.",
    "category": "Sách — Tâm lý học hành vi",
    "icon": "book",
    "content": {
      "sections": [
        {
          "heading": "Tác giả & xuất bản",
          "paragraphs": [
            "Daniel Kahneman — Nobel Prize Economics 2002.",
            "Farrar, Straus and Giroux, 2011."
          ]
        },
        {
          "heading": "Khái niệm chính",
          "paragraphs": [
            "Hệ 1 (System 1): nhanh, tự động, không nỗ lực — dựa trên trực giác và pattern matching. Chạy mặc định trong não, không cần \"huy động\".",
            "Hệ 2 (System 2): chậm, có chủ ý, tốn năng lượng — dùng logic chính thức. Chỉ kích hoạt khi cần.",
            "Tin \"khớp\" thì Hệ 1 vẫy tay cho qua. Tin \"không khớp\" thì cần Hệ 2 xử lý — nhưng Hệ 2 lười, nên thường bypass. Đây là lý do confirmation bias chạy tự động."
          ]
        },
        {
          "heading": "Nguồn",
          "paragraphs": [
            "Wikipedia: https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow"
          ]
        }
      ]
    },
    "sortOrder": 3
  },
  {
    "slug": "kunda-1990-motivated-reasoning",
    "title": "The case for motivated reasoning",
    "description": "Bài 1990 của Ziva Kunda chỉ ra: người ta đi đến kết luận họ muốn đi, miễn là có thể xây được lý lẽ nghe có vẻ hợp lý để biện minh kết luận đó.",
    "category": "Paper academic — Tâm lý học",
    "icon": "brain-circuit",
    "content": {
      "sections": [
        {
          "heading": "Tác giả & xuất bản",
          "paragraphs": [
            "Ziva Kunda — nhà tâm lý học người Israel-Canada, University of Waterloo.",
            "Psychological Bulletin, 1990, Vol. 108, No. 3, 480-498."
          ]
        },
        {
          "heading": "Luận điểm chính",
          "paragraphs": [
            "Quote nguyên văn: \"people are more likely to arrive at conclusions that they want to arrive at, but their ability to do so is constrained by their ability to construct seemingly reasonable justifications for these conclusions.\"",
            "Cụm \"miễn là\" (constrained by) là điểm then chốt: motivated reasoning không phải \"tin bất chấp\" — bạn vẫn dùng logic, vẫn nghĩ mình suy luận hợp lý. Chỉ là logic được dùng theo kiểu công cụ phục vụ kết luận, chứ không phải để tìm kết luận."
          ]
        },
        {
          "heading": "Nguồn",
          "paragraphs": [
            "PubMed: https://pubmed.ncbi.nlm.nih.gov/2270237/"
          ]
        }
      ]
    },
    "sortOrder": 4
  },
  {
    "slug": "tienphong-cung-hoang-dao",
    "title": "Xét tính cách theo cung hoàng đạo không đáng tin",
    "description": "Bài báo Tienphong (2016) tổng hợp nghiên cứu phân tích dữ liệu hơn 15.000 người, không tìm thấy mối tương quan giữa ngày sinh và tính cách.",
    "category": "Báo VN — Tâm lý học đại chúng",
    "icon": "newspaper",
    "content": {
      "sections": [
        {
          "heading": "Tóm tắt",
          "paragraphs": [
            "Nghiên cứu dùng phương pháp thống kê và phân tích máy tính để kiểm tra dữ liệu chiêm tinh học của hơn 15.000 người. Kết quả: không tìm thấy mối tương quan nào giữa ngày sinh và tính cách của họ.",
            "Ý nghĩa: mô tả cung hoàng đạo về tính cách (vd. \"Bọ Cạp sâu sắc, đam mê\") không khớp với người sinh trong khoảng đó hơn một cách ngẫu nhiên."
          ]
        },
        {
          "heading": "Nguồn",
          "paragraphs": [
            "Tienphong: https://tienphong.vn/xet-tinh-cach-theo-cung-hoang-dao-khong-dang-tin-post45246.tpo"
          ]
        }
      ]
    },
    "sortOrder": 0
  },
  {
    "slug": "lord-ross-lepper-1979-attitude-polarization",
    "title": "Biased Assimilation and Attitude Polarization",
    "description": "Thí nghiệm kinh điển của Lord, Ross & Lepper (1979): hai phe đối lập đọc CÙNG một cặp nghiên cứu về án tử hình — và kết thúc còn cách xa nhau hơn trước. Nguồn gốc của khái niệm phân cực thái độ.",
    "category": "Paper academic — Tâm lý học",
    "icon": "git-fork",
    "content": {
      "sections": [
        {
          "heading": "Tác giả & xuất bản",
          "paragraphs": [
            "Charles G. Lord, Lee Ross, Mark R. Lepper — Stanford University.",
            "Journal of Personality and Social Psychology, 1979, Vol. 37, No. 11, 2098-2109."
          ]
        },
        {
          "heading": "Thiết kế thí nghiệm",
          "paragraphs": [
            "Nhóm nghiên cứu tuyển 48 sinh viên có quan điểm mạnh về án tử hình — một nửa tin án tử hình có tác dụng răn đe, một nửa tin ngược lại.",
            "Cả hai nhóm được đọc cùng một cặp nghiên cứu (thực ra do nhóm tác giả dựng nên): một nghiên cứu so sánh giữa các bang cho kết quả ủng hộ răn đe, một nghiên cứu so sánh trước-sau trong cùng một bang cho kết quả phủ định răn đe.",
            "Sau khi đọc, người tham gia được hỏi lại về quan điểm và được yêu cầu đánh giá chất lượng phương pháp của từng nghiên cứu."
          ]
        },
        {
          "heading": "Kết quả",
          "paragraphs": [
            "Mỗi nhóm đánh giá nghiên cứu khớp niềm tin của mình là \"được tiến hành tốt và có sức thuyết phục\", đồng thời chỉ ra rất chi tiết các lỗi phương pháp của nghiên cứu ngược chiều.",
            "Quan trọng nhất: sau khi đọc bằng chứng CÂN BẰNG cho cả hai phía, cả hai nhóm đều báo cáo niềm tin ban đầu MẠNH HƠN trước. Khoảng cách giữa hai phe rộng ra thay vì thu hẹp.",
            "Tác giả gọi hiện tượng này là \"biased assimilation\" (đồng hoá lệch) dẫn tới \"attitude polarization\" (phân cực thái độ). Hệ quả thực tiễn: đưa thêm bằng chứng cho hai phe đang bất đồng có thể làm bất đồng sâu hơn, không nông đi."
          ]
        },
        {
          "heading": "Nguồn",
          "paragraphs": [
            "Toàn văn (PDF): http://fbaum.unc.edu/teaching/articles/jpsp-1979-Lord-Ross-Lepper.pdf"
          ]
        }
      ]
    },
    "sortOrder": 0
  }
]
