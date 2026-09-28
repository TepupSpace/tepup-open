---
lesson_id: B02
title: Ngụy biện là gì?
generated_at: 2026-08-04T17:10:00+07:00
researcher_notes: High confidence — 7 anchor refs, tất cả tier A/B, mọi URL đều đã fetch thành công (Tversky & Kahneman 1974 đã trích được nguyên văn từ PDF full-text; Urbany 1988 xác nhận DOI 10.1086/209148). 7 VN examples từ VnExpress / Dân trí / VietnamNet / Thế giới Tiếp thị-Dân Việt / cổng Bộ Công Thương / văn bản Nghị định 81/2018 — tất cả ở dạng tổng hợp hoặc quy định, không quy kết đích danh. Gap còn lại — không tìm được số liệu tách riêng nhóm tuổi 22-35 mua sắm online do cơ quan nhà nước công bố (chỉ có số toàn thị trường của Bộ Công Thương, dùng cho §0 là đủ); và không trích được nguyên văn định nghĩa "warrant" từ chính bản in Toulmin 1958 (dùng Wikipedia tier B cho định nghĩa + Habernal 2018 tier A cho luận điểm "warrant thường bị để ngầm").
---

# Research Notes — B02

## 1. Anchor refs (academic / framework foundation)

### c1
- type: paper
- title: Fallacies (Stanford Encyclopedia of Philosophy)
- author: Hansen, Hans
- year: 2015 (first published 29/5/2015; substantive revision 30/8/2024)
- url: https://plato.stanford.edu/entries/fallacies/
- tier: A
- key_quote: "Two competing conceptions of fallacies are that they are false but popular beliefs and that they are deceptively bad arguments." / "As an initial working definition of the subject matter, we may take a fallacy to be an argument that seems to be better than it really is." / standard definition of fallacy (SDF): an argument "that seems to be valid but is not so" (Hamblin 1970). Điều kiện tần suất, dẫn Johnson & Blair trong bài: "any argument that violates one of the criteria of good argument … and is committed frequently in argumentative discourse".
- relevance_to_lesson: Nguồn chuẩn cho định nghĩa lõi của bài — ngụy biện là một LẬP LUẬN trông có vẻ tốt hơn thực tế, tức lỗi nằm ở CÁCH SUY. Đồng thời SEP tách rõ hai quan niệm: "niềm tin sai nhưng phổ biến" (belief conception) vs "lập luận tồi có tính đánh lừa" (argument conception) — đây chính là nền học thuật cho PHÂN BIỆT BẮT BUỘC ở §1 giữa "nói sai sự thật" và "ngụy biện". Chữ "committed frequently" hậu thuẫn ý "lỗi có hệ thống, lặp theo khuôn", không phải sai sót ngẫu nhiên. Dùng cho LO1.

### c2
- type: textbook
- title: Validity and Soundness (Internet Encyclopedia of Philosophy)
- author: Internet Encyclopedia of Philosophy (bài không ghi tên tác giả cá nhân)
- year: n.d. (bài thường trực của IEP, peer-reviewed encyclopedia)
- url: https://iep.utm.edu/val-snd/
- tier: A
- key_quote: "A deductive argument is said to be valid if and only if it takes a form that makes it impossible for the premises to be true and the conclusion nevertheless to be false." / "A deductive argument is sound if and only if it is both valid, and all of its premises are actually true."
- relevance_to_lesson: Nguồn ĐỊNH NGHĨA duy nhất cho cặp "đúng cấu trúc (valid)" vs "vững (sound)" ở §2. Chỉ lấy định nghĩa — KHÔNG bê ví dụ tam đoạn luận của IEP vào bài (term_handling::forbidden_devices). Điểm khớp hoàn hảo với ANCHOR: quảng cáo giá gạch ngang, sau khi viết tiền đề ẩn ra, là valid (nếu mọi căn cứ đúng thì kết luận buộc phải đúng) nhưng không sound (một căn cứ — tiền đề ẩn — không đúng). Dùng cho LO2.

### c3
- type: framework
- title: The Uses of Argument (mô hình lập luận Toulmin — claim / ground / warrant / backing / rebuttal / qualifier)
- author: Toulmin, Stephen E. (trang tổng hợp: Wikipedia, "Stephen Toulmin")
- year: 1958
- url: https://en.wikipedia.org/wiki/Stephen_Toulmin
- tier: B
- key_quote: Warrant — "A statement authorizing movement from the ground to the claim." Ground — "A fact one appeals to as a foundation for the claim." Claim — "A conclusion whose merit must be established." (Ví dụ minh hoạ của Toulmin: ground "I was born in Bermuda" → claim "I am a British citizen", warrant "A man born in Bermuda will legally be a British citizen".)
- relevance_to_lesson: Khung lý thuyết mạnh nhất cho §2. "Warrant" chính là TIỀN ĐỀ ẨN của bài: câu nối ngầm cho phép đi từ căn cứ sang kết luận, và nó là thứ người nói gần như không bao giờ phát biểu ra. Map thẳng vào ANCHOR: ground = "trang ghi 2.000.000đ" + "bạn trả 599.000đ"; claim = "bạn lợi 1.401.000đ"; warrant = "món này TỪNG được bán thật ở 2.000.000đ". Dùng cho LO1 (bộ từ vựng căn cứ/kết luận) và LO2 (tiền đề ẩn). LƯU Ý: tier B — phải đi kèm c4 (tier A) khi cần chống lưng học thuật.

### c4
- type: paper
- title: The Argument Reasoning Comprehension Task — Identification and Reconstruction of Implicit Warrants
- author: Habernal, Ivan; Wachsmuth, Henning; Gurevych, Iryna; Stein, Benno
- year: 2018 (NAACL-HLT 2018, long paper)
- url: https://arxiv.org/abs/1708.01425
- tier: A
- key_quote: "To comprehend an argument, one must analyze its warrant, which explains why its claim follows from its premises. As arguments are highly contextualized, warrants are usually presupposed and left implicit. Thus, the comprehension does not only require language understanding and logic skills, but also depends on common sense."
- relevance_to_lesson: Bằng chứng học thuật tier A cho mệnh đề trung tâm của §2 — tiền đề ẩn không phải chuyện hiếm hay chuyện của kẻ gian, mà là TRẠNG THÁI MẶC ĐỊNH của lập luận đời thường ("usually presupposed and left implicit"). Cũng giải thích vì sao câu hỏi số (3) trong target_takeaway ("căn cứ nào bị giấu?") khó: nó đòi common sense chứ không chỉ đòi logic. Bổ trợ c3. Dùng cho LO2 và LO3.

### c5
- type: paper
- title: Aristotle's Rhetoric (Stanford Encyclopedia of Philosophy) — mục enthymeme + supplement "The Brevity of the Enthymeme"
- author: Rapp, Christof
- year: 2002 (first published 2/5/2002; substantive revision 15/3/2022)
- url: https://plato.stanford.edu/entries/aristotle-rhetoric/
- tier: A
- key_quote: "an enthymeme is what has the function of a proof or demonstration in the domain of public speech. Since a demonstration is a kind of sullogismos, the enthymeme is said to be a sullogismos too." / "the enthymeme often has few or even fewer premises than some other deductions (sullogismoi)" / cách hiểu phổ biến: "the enthymeme [is] a sullogismos in which one of two premises has been suppressed" — nhưng SEP lưu ý cách đọc này gây tranh cãi, và giải thích việc rút gọn là "adjustment to the intellectual capacities of the public audience", vì "one cannot expect the audience of a public speech to follow such long arguments". (Supplement: https://plato.stanford.edu/entries/aristotle-rhetoric/brevity-enthymeme.html)
- relevance_to_lesson: Trả lời câu hỏi "VÌ SAO tiền đề ẩn phổ biến đến thế?" — vì lập luận nói trước đám đông vốn được thiết kế để NGẮN, người nói tin rằng người nghe tự điền phần thiếu. Quảng cáo là ca cực đoan của enthymeme: chỉ 12 chữ, người mua tự điền phần còn lại. CẢNH BÁO CHO WRITER — không được viết "Aristotle định nghĩa enthymeme là tam đoạn luận thiếu một tiền đề" như một sự thật đã chốt; SEP nói rõ đó là "widespread understanding" đang bị tranh cãi. Viết an toàn: "từ thời Aristotle người ta đã nhận ra lập luận trước đám đông thường được nói ngắn hơn số bước thực sự cần". Dùng cho LO2.

### c6
- type: paper
- title: The Effect of Plausible and Exaggerated Reference Prices on Consumer Perceptions and Price Search
- author: Urbany, Joel E.; Bearden, William O.; Weilbaker, Dan C.
- year: 1988 (Journal of Consumer Research, Vol. 15, No. 1, pp. 95-110; DOI 10.1086/209148)
- url: https://academic.oup.com/jcr/article-abstract/15/1/95/1840979
- tier: A
- key_quote: Theo phần mô tả kết quả của bài: so với quảng cáo không có giá tham chiếu, quảng cáo có giá tham chiếu HỢP LÝ làm tăng ước lượng của người mua về "giá thường" của người bán và tăng cảm nhận về giá trị của ưu đãi; và giá tham chiếu PHÓNG ĐẠI (exaggerated) tạo ra tác động tích cực về cảm nhận gần như y hệt giá tham chiếu hợp lý — "even for the more skeptical subjects". Khi giá sale nằm trên mức giá thấp nhất mà người mua dự kiến, giá tham chiếu phóng đại khiến nhiều người mua thẳng của bên quảng cáo thay vì đi dò giá nơi khác.
- relevance_to_lesson: Đây là bằng chứng thực nghiệm tier A cho ĐÚNG cơ chế của ANCHOR — con số gạch ngang ("giá gốc") có tác dụng ngay cả khi nó bị thổi phồng, và ngay cả với người tự nhận là đa nghi. Dùng ở §3 để chốt: biết bẫy chưa đủ, phải có THAO TÁC kiểm tra (3 câu hỏi), vì "cảnh giác" không miễn nhiễm. Cũng hậu thuẫn việc bài KHÔNG mắng người mua là ngốc. Dùng cho LO3.

### c7
- type: paper
- title: Judgment under Uncertainty — Heuristics and Biases
- author: Tversky, Amos; Kahneman, Daniel
- year: 1974 (Science, New Series, Vol. 185, No. 4157, 27/9/1974, pp. 1124-1131)
- url: https://www.jstor.org/stable/1738360
- tier: A
- key_quote: "In many situations, people make estimates by starting from an initial value that is adjusted to yield the final answer. The initial value, or starting point, may be suggested by the formulation of the problem, or it may be the result of a partial computation. In either case, adjustments are typically insufficient. That is, different starting points yield different estimates, which are biased toward the initial values. We call this phenomenon anchoring." (Thí nghiệm bánh xe may rủi: nhóm nhận số khởi điểm 10 ước lượng trung vị 25%, nhóm nhận 65 ước lượng 45% — "Payoffs for accuracy did not reduce the anchoring effect.")
- relevance_to_lesson: Nguồn gốc của khái niệm "neo giá". Giải thích cơ chế tâm lý phía sau ANCHOR — con số 2.000.000đ, dù chỉ là con số hiển thị, kéo mọi ước lượng về giá trị món hàng về phía nó. Chi tiết "trả thưởng cho độ chính xác cũng không làm giảm hiệu ứng" là chốt mạnh cho §3: cố gắng tỉnh táo không đủ, phải có công cụ. Toàn văn open access đã kiểm chứng (đã tải và trích nguyên văn): https://sites.socsci.uci.edu/~bskyrms/bio/readings/tversky_k_heuristics_biases.pdf — dùng cho LO3 và §0 Hook. LƯU Ý: thí nghiệm gốc dùng ví dụ "tỷ lệ nước châu Phi trong Liên Hợp Quốc" — writer chỉ lấy CƠ CHẾ, kể lại bằng bối cảnh mua sắm, không bê nguyên ví dụ chính trị quốc tế vào bài.

## 2. VN examples

### v1
- citation_id: v1
- source_type: bao_vn
- url: https://vnexpress.net/black-friday-o-viet-nam-e-am-vi-sao-san-sale-black-friday-iphone-promax-17-san-sale-4987438.html
- raw_quote: "Nhiều cửa hàng nâng giá lên gấp đôi rồi thông báo giảm 70%, khiến mức giá sau giảm vẫn chẳng khác gì ngày thường." — và — "Người tiêu dùng đọc thì choáng ngợp với mức giảm, nhưng khi bước vào xem thì nhận ra giá bị 'thổi' lên, sản phẩm giảm giá chỉ là đồ tồn kho, lỗi mốt hoặc không còn đủ size."
- date_or_context: VnExpress Kinh doanh, 28/11/2025, tác giả PT — bài tổng hợp về mùa Black Friday tại VN. Đã kiểm tra: bài KHÔNG nêu đích danh cửa hàng/nhãn hàng nào.
- why_this_example_works: Hậu thuẫn TRỰC TIẾP tiền đề ẩn của ANCHOR bằng nguồn báo lớn: "giá gốc" gạch ngang có thể là con số vừa được nâng lên vài ngày trước, chứ không phải giá thật từng bán. Quan trọng hơn — câu "mức giá sau giảm vẫn chẳng khác gì ngày thường" cho thấy kết luận "bạn lợi 1.401.000đ" sai mà KHÔNG cần ai nói dối câu nào: cả hai con số hiển thị đều đúng như hiển thị.
- which_concept_it_illustrates: tiền đề ẩn; "vững (sound)" — lập luận đúng cấu trúc nhưng một tiền đề (ẩn) sai nên không vững; ANCHOR §1-§2

### v2
- citation_id: v2
- source_type: quy_dinh
- url: https://vanban.vcci.com.vn/nghi-dinh-812018nd-cp-huong-dan-luat-thuong-mai-ve-hoat-dong-xuc-tien-thuong-mai
- raw_quote: Nghị định 81/2018/NĐ-CP, Điều 7 khoản 1: "Mức giảm giá tối đa đối với hàng hóa, dịch vụ được khuyến mại không được vượt quá 50% giá hàng hóa, dịch vụ đó ngay trước thời gian khuyến mại." (Khoản 2 cho phép mức tối đa 100% trong chương trình khuyến mại tập trung.)
- date_or_context: Nghị định 81/2018/NĐ-CP, ban hành 22/5/2018, hiệu lực 15/7/2018 — hướng dẫn Luật Thương mại về hoạt động xúc tiến thương mại.
- why_this_example_works: Đây là mảnh ghép biến tiền đề ẩn từ "cảm giác nghi ngờ" thành thứ KIỂM CHỨNG ĐƯỢC. Pháp luật VN định nghĩa mốc so sánh hợp lệ là "giá ngay trước thời gian khuyến mại" — tức tiền đề ẩn "món này TỪNG được bán thật ở 2.000.000đ" là một mệnh đề có thể đúng hoặc sai, có tiêu chí rõ ràng, không phải chuyện cảm tính. Dùng ở §2 để chống lại phản ứng "biết đâu đó là ý kiến chủ quan của bạn".
- which_concept_it_illustrates: tiền đề ẩn (nêu ra được thì kiểm chứng được); "vững (sound)" — điều kiện "mọi tiền đề phải đúng thật"

### v3
- citation_id: v3
- source_type: bao_vn
- url: https://dantri.com.vn/kinh-doanh/cuoi-nam-coi-chung-bay-giam-gia-ao-nang-khong-roi-ha-gia-20251213153540249.htm
- raw_quote: "nâng giá gốc lên cao rồi mới áp dụng mức giảm sâu 50-70%, tạo cảm giác ưu đãi lớn nhưng giá sau giảm thực chất không rẻ hơn thị trường"
- date_or_context: Báo Dân trí, mục Kinh doanh > Tiêu dùng, 13/12/2025, tác giả Minh Huyền — dẫn cảnh báo chung của Ủy ban Cạnh tranh Quốc gia (Bộ Công Thương), gắn với Luật Bảo vệ quyền lợi người tiêu dùng 2023. Đã kiểm tra: KHÔNG nêu tên nhãn hàng/shop cụ thể.
- why_this_example_works: Nguồn có thẩm quyền nhà nước (Ủy ban Cạnh tranh Quốc gia) xác nhận đây là khuôn mẫu phổ biến, không phải suy đoán của người viết bài học. Cụm "tạo cảm giác ưu đãi lớn" mô tả đúng chỗ lập luận gãy: cái được tạo ra là CẢM GIÁC lợi, không phải khoản lợi. Dùng ở §2 hoặc §3 làm bằng chứng cấp hệ thống.
- which_concept_it_illustrates: ngụy biện = lỗi ở CÁCH SUY (căn cứ hiển thị đúng, kết luận "tôi lợi" sai); tiền đề ẩn

### v4
- citation_id: v4
- source_type: bao_vn
- url: https://thegioitiepthi.danviet.vn/khi-viec-gai-bay-nguoi-mua-tro-thanh-cuoc-dua-tang-truong-cua-san-tmdt-d1428112.html
- raw_quote: "Chỉ còn 2 sản phẩm trong kho" / "1.000 người đang xem" — và về giá: mức giá bị gạch bỏ rồi giảm 50-70%, nhưng giá gốc "có thể chưa từng tồn tại". Bài định nghĩa dark patterns là "giao diện được cố tình thiết kế nhằm lừa gạt hoặc thao túng người dùng".
- date_or_context: Thế giới Tiếp thị (Dân Việt), 20/5/2026, tác giả Hồng Minh.
- why_this_example_works: Cụm "giá gốc có thể chưa từng tồn tại" là cách phát biểu gọn nhất của TIỀN ĐỀ ẨN trong ANCHOR — dùng làm câu chốt §2. Bài đồng thời cấp nguồn cho SECONDARY #1 ("chỉ còn 3 suất cuối"): cùng một khuôn — thứ hiển thị trên màn hình là thật, nhưng con số nền phía sau nó là do bên bán dựng.
- which_concept_it_illustrates: tiền đề ẩn (ANCHOR §2 + SECONDARY #1 §3); phân biệt "cái mình nhìn thấy" vs "cái mình phải tin thêm"
- CẢNH BÁO SỬ DỤNG: bài này CÓ nêu đích danh một sàn TMĐT bị phạt trong một vụ việc riêng. Writer chỉ được dùng phần mô tả dark patterns ở dạng tổng hợp trích trên; TUYỆT ĐỐI không đưa tên sàn/nhãn hàng đó vào bài (forbidden_examples).

### v5
- citation_id: v5
- source_type: bao_vn
- url: https://vietnamnet.vn/tinh-tao-truoc-bay-tam-ly-khi-mua-sam-tren-cac-trang-thuong-mai-dien-tu-2095153.html
- raw_quote: "thông báo giả về số lượng hàng sắp hết hoặc đặt đồng hồ đếm ngược lặp đi lặp lại" — ví dụ minh hoạ: "một cửa hàng thời trang nổi tiếng cho biết bạn chỉ còn 15 phút để mua chiếc váy phiên bản giới hạn" — và: "Làm giả giá cả là bất hợp pháp, nhưng làm giả sự khan hiếm của món hàng thì không vi phạm pháp luật."
- date_or_context: VietnamNet, 28/12/2022 (theo Phụ nữ Việt Nam). Đã kiểm tra: không nêu tên sàn/shop VN cụ thể.
- why_this_example_works: Câu cuối là món quà cho §3 — nó cho thấy chính xác vì sao bài học này cần thiết: có những chiêu KHÔNG phạm luật, nên không thể trông chờ cơ quan quản lý bắt hộ; công cụ duy nhất là tự tách tiền đề ẩn. Nó cũng tách bạch hai loại lỗi giống hệt cách bài tách: "làm giả giá cả" = nói sai sự thật (bắt được, bị phạt), "làm giả khan hiếm" = để người mua tự suy ra kết luận sai (không bắt được) — chính là ranh giới NÓI DỐI vs NGỤY BIỆN ở §1.
- which_concept_it_illustrates: PHÂN BIỆT BẮT BUỘC §1 (nói sai sự thật ≠ ngụy biện); SECONDARY #1 và #2 ở §3; tiền đề ẩn

### v6
- citation_id: v6
- source_type: bao_vn
- url: https://moit.gov.vn/tin-tuc/hoat-dong/hoat-dong-cua-cac-don-vi/cuc-thuong-mai-dien-tu-va-kinh-te-so-to-chuc-hoi-nghi-tong-ket-cong-tac-nam-2024-va-trien-khai-nhiem-vu-nam-2025.html
- raw_quote: "Quy mô thị trường TMĐT sớm vượt mốc 25 tỷ USD, tăng 20% so với năm 2023" — "TMĐT Việt Nam tiếp tục duy trì tốc độ tăng trưởng ấn tượng, đạt mức 18 - 25% mỗi năm" — "Tỷ trọng về TMĐT chiếm 2/3 giá trị của nền kinh tế số Việt Nam"; TMĐT chiếm khoảng 9% tổng mức bán lẻ hàng hóa và dịch vụ tiêu dùng.
- date_or_context: Cổng thông tin điện tử Bộ Công Thương, 3/1/2025 — số liệu do Cục Thương mại điện tử và Kinh tế số công bố tại hội nghị tổng kết năm 2024.
- why_this_example_works: Số liệu chính thống cho §0 Hook — mua sắm online không phải chuyện thỉnh thoảng mà là 25 tỷ USD/năm và 9% toàn bộ bán lẻ. Đủ để nói "khuôn lập luận trong bài này chạy qua mắt bạn mỗi tuần" mà không cần phóng đại. Ưu tiên nguồn này thay vì các báo cáo thương mại của công ty tư nhân (tier thấp hơn, số liệu vênh nhau).
- which_concept_it_illustrates: §0 Hook — tần suất tiếp xúc; bối cảnh cho ANCHOR

### v7
- citation_id: v7
- source_type: bao_vn
- url: https://dantri.com.vn/kinh-doanh/canh-bao-chi-phi-an-khi-mua-hang-tren-san-thuong-mai-dien-tu-20260406230557898.htm
- raw_quote: "một sản phẩm quảng bá giá 300.000 đồng nhưng khi thanh toán phát sinh thêm phí vận chuyển, phụ phí khiến tổng chi tăng đáng kể" — người tiêu dùng "có thể phải chi trả thêm nhiều khoản chi phí khác" ngoài giá hiển thị ban đầu.
- date_or_context: Báo Dân trí, 7/4/2026, tác giả Minh Huyền — dẫn cảnh báo chung của Ủy ban Cạnh tranh Quốc gia. Không nêu đích danh sàn nào trong phần này.
- why_this_example_works: Cấp bối cảnh có thật cho PHẢN VÍ DỤ VỮNG bắt buộc ở §1 (phí giao hàng 25.000đ): phí vận chuyển là con số công khai, có mốc miễn phí rõ ràng, nên lập luận "đơn không đạt mốc → tôi bị tính phí" là VỮNG — căn cứ thật, suy chặt, không cần tin thêm điều gì. Đặt cạnh ANCHOR, nó dạy đúng bài học phân biệt: chỗ nào tiền đề ẩn tồn tại và chỗ nào không. Đồng thời chốt thông điệp chống hoài nghi cực đoan ở §5 — công cụ này để KIỂM TRA, không phải để bác bỏ mọi thứ.
- which_concept_it_illustrates: PHẢN VÍ DỤ VỮNG §1 — "vững (sound)"; "đúng cấu trúc (valid)"; chống hyper-skepticism

## 3. Concept clarifications

### concept: tiền đề (premise)
- definition_plain_vn: Là cái người ta đưa ra làm bằng chứng, để bạn tin theo. Trong câu "giá gốc 2.000.000đ, nay còn 599.000đ, nên bạn lợi 1.401.000đ" thì hai con số đầu là tiền đề — chúng là cái được dùng để chống đỡ cho phần sau.
- cited_from: [c3] Toulmin 1958 (ground/data — "A fact one appeals to as a foundation for the claim"); [c2] IEP Validity and Soundness
- common_misconception: Nhiều người nghĩ tiền đề luôn là câu đứng trước "cho nên". Thực tế trong nói chuyện hàng ngày thứ tự bị đảo liên tục ("Mua đi, đang giảm 70% đấy") — nhận diện phải dựa vào vai trò (cái nào chống đỡ cái nào), không dựa vào vị trí trong câu.
- counter_example: Một câu mô tả đơn thuần không có tiền đề nào cả — "Hôm nay trời mưa" chỉ là một phát biểu, không phải lập luận, nên không có gì để tách. Chỉ khi xuất hiện quan hệ "vì cái này nên cái kia" mới có tiền đề.

### concept: kết luận (conclusion)
- definition_plain_vn: Là điều người nói muốn bạn tin sau khi nghe xong. Trong quảng cáo, kết luận thường không được nói thẳng thành câu mà nằm trong một lời kêu gọi — "Mua ngay!" thực chất là "bạn nên mua món này vì mua là lợi".
- cited_from: [c3] Toulmin 1958 (claim — "A conclusion whose merit must be established"); [c1] Hansen, SEP Fallacies
- common_misconception: Tưởng kết luận luôn là câu cuối, hoặc luôn có chữ "vì vậy". Thực tế trong quảng cáo, kết luận hay được giấu dưới dạng mệnh lệnh hoặc con số ("tiết kiệm 1.401.000đ" chính là kết luận đội lốt một dữ kiện).
- counter_example: "Sản phẩm này nặng 1,2kg" — thông tin thuần tuý, không đòi bạn tin thêm điều gì, nên không có kết luận. Không phải câu nào trong quảng cáo cũng là một lập luận.

### concept: đúng cấu trúc (valid)
- definition_plain_vn: Cách suy chặt — nếu mọi căn cứ đưa ra đều đúng thì kết luận BUỘC phải đúng, không còn đường thoát. Nó chỉ nói về cách nối các mảnh với nhau, hoàn toàn không nói gì về việc các mảnh đó có thật hay không.
- cited_from: [c2] IEP Validity and Soundness — "impossible for the premises to be true and the conclusion nevertheless to be false"
- common_misconception: Nhầm "đúng cấu trúc" với "đúng". Một lập luận có thể đúng cấu trúc hoàn hảo mà kết luận vẫn sai bét, chỉ cần một căn cứ sai là đủ. Ngược lại, một câu nói ra kết luận đúng vẫn có thể có cách suy hỏng.
- counter_example: "Mọi món có giá gốc gạch ngang đều là hời. Món này có giá gốc gạch ngang. → Món này hời." Đúng cấu trúc (nối chặt), nhưng câu đầu sai nên kết luận vô giá trị. Đây là ca cho thấy "đúng cấu trúc" một mình không cứu được ai.

### concept: vững (sound)
- definition_plain_vn: Vừa suy chặt, vừa mọi căn cứ đều có thật. Đây mới là thứ đáng để bạn gật đầu. Một lập luận vững thì bạn không cãi được — không phải vì nó nói hay, mà vì không còn chỗ nào để bám vào mà cãi.
- cited_from: [c2] IEP Validity and Soundness — "sound if and only if it is both valid, and all of its premises are actually true"
- common_misconception: Tưởng "nghe rất thuyết phục" = vững. Ngược lại là chuyện thường: quảng cáo giá gạch ngang nghe cực thuyết phục chính vì nó đúng cấu trúc và mọi thứ HIỂN THỊ đều đúng — cái sai nằm ở căn cứ không được hiển thị.
- counter_example: "Sàn ghi phí giao hàng 25.000đ. Đơn của tôi không đạt mốc miễn phí giao hàng. → Tôi sẽ bị tính 25.000đ." Suy chặt, hai căn cứ kiểm tra được ngay trên màn hình, không phải tin thêm điều gì → vững. Nguồn bối cảnh: [v7].

### concept: tiền đề ẩn (hidden premise / warrant / enthymeme)
- definition_plain_vn: Điều bạn phải tin thêm — mà không ai nói ra — thì mấy căn cứ kia mới dẫn tới kết luận được. Nó không bị giấu bằng cách nói dối, nó bị giấu bằng cách không nhắc tới. Với quảng cáo giá gạch ngang, tiền đề ẩn là: "món này TỪNG được bán thật ở 2.000.000đ".
- cited_from: [c3] Toulmin 1958 (warrant — "A statement authorizing movement from the ground to the claim"); [c4] Habernal et al. 2018 — "warrants are usually presupposed and left implicit"; [c5] Rapp, SEP Aristotle's Rhetoric (enthymeme)
- common_misconception: Tưởng tiền đề ẩn là dấu hiệu của kẻ gian. Sai — bỏ bớt tiền đề là trạng thái MẶC ĐỊNH của mọi lời nói bình thường [c4]; nếu phải phát biểu hết thì không ai nói chuyện được với ai. Vấn đề chỉ phát sinh khi cái bị bỏ đi lại chính là cái sai. Bài phải giữ giọng này, nếu không sẽ đẻ ra người hoài nghi cực đoan.
- counter_example: "Trời đang mưa nên tôi mang ô." Tiền đề ẩn ("mang ô thì đỡ ướt") có tồn tại, nhưng đúng và ai cũng đồng ý — nêu ra chỉ tốn thời gian. Có tiền đề ẩn KHÔNG đồng nghĩa với có bẫy.

### concept: "ngụy biện = lỗi ở CÁCH SUY, không phải ở sự thật"
- definition_plain_vn: Ngụy biện là khi cách đi từ căn cứ sang kết luận bị hỏng — chứ không phải khi ai đó nói sai một dữ kiện. Nói sai sự thật thì đi kiểm tra là bắt được. Ngụy biện thì mọi thứ kiểm tra đều khớp, mà kết luận vẫn sai. Loại thứ hai nguy hiểm hơn vì không có gì để bắt quả tang.
- cited_from: [c1] Hansen, SEP Fallacies — "a fallacy [is] an argument that seems to be better than it really is"; SEP tách "belief conception" (niềm tin sai) khỏi "argument conception" (lập luận tồi có tính đánh lừa); tiêu chí tần suất: "committed frequently in argumentative discourse"
- common_misconception: Đồng nhất "ngụy biện" với "nói dối" hoặc với "tôi không đồng ý". Cả hai đều sai. "Sản phẩm này được NASA chứng nhận" trong khi không có → đó là nói sai sự thật, không phải ngụy biện. Và chuyện bạn không thích kết luận cũng chẳng làm lập luận thành ngụy biện.
- counter_example: Một lập luận có cách suy hoàn hảo nhưng dựa trên một con số bị bịa → đó là vấn đề sự thật, xử lý bằng cách đi tra nguồn, không phải bằng bài học logic này. Nguồn minh hoạ ranh giới: [v5] — "Làm giả giá cả là bất hợp pháp, nhưng làm giả sự khan hiếm của món hàng thì không vi phạm pháp luật."

## 4. Counter-examples / edge cases

- Lập luận VỮNG trong đúng bối cảnh mua sắm (BẮT BUỘC có ở §1). "Sàn ghi phí giao hàng 25.000đ. Đơn của tôi không đạt mốc miễn phí. → Tôi bị tính 25.000đ." Không có tiền đề ẩn nào cần tin thêm; cả hai căn cứ hiển thị và kiểm tra được ngay. Thiếu đoạn này bài sẽ đẻ ra người hoài nghi cực đoan (forbidden_examples). Bối cảnh nguồn: [v7].

- Tiền đề ẩn VÔ HẠI. "Trời mưa nên tôi mang ô." Warrant bị để ngầm nhưng đúng và không tranh cãi. Dùng để dạy: mục tiêu của §2 không phải "phát hiện tiền đề ẩn" mà là "nêu nó ra rồi hỏi nó có đúng không".

- Giảm giá THẬT. Không phải mọi giá gạch ngang đều dựng. Nghị định 81/2018 Điều 7 [v2] tồn tại chính vì có mốc "giá ngay trước thời gian khuyến mại" hợp lệ để so. Bài phải nói rõ điều này, nếu không sẽ trượt thành "quảng cáo toàn lừa đảo".

- Nói sai sự thật KHÔNG phải ngụy biện. "Được NASA chứng nhận" khi không hề có → sai dữ kiện, bắt được bằng cách đi tra. Đây là nhiễu bắt buộc trong {!CHECK#1} (LO1). Ranh giới pháp lý minh hoạ ở [v5]: làm giả giá thì phạm luật, làm giả khan hiếm thì không.

- "Đúng cấu trúc" mà kết luận sai. Viết tiền đề ẩn ra giấy khiến ANCHOR trở nên valid — và chính lúc đó mới thấy rõ nó không sound. Đây là edge case dạy sạch nhất cặp valid/sound: làm cho lập luận chặt hơn lại là cách phơi ra chỗ nó hỏng.

- Biết bẫy vẫn dính. [c6] cho thấy giá tham chiếu phóng đại vẫn tác động lên cả nhóm đa nghi; [c7] cho thấy trả thưởng cho độ chính xác cũng không xoá được hiệu ứng neo. Suy ra: §5 không được kết bằng "hãy tỉnh táo hơn" — phải kết bằng một THAO TÁC cụ thể (3 câu hỏi).

- Kết luận ĐÚNG qua cách suy HỎNG. Có thể mua đúng món hời thật, nhưng lý do bạn tin là hời lại sai. Kết luận đúng không chứng minh lập luận tốt — chốt lại thông điệp "lỗi ở CÁCH SUY".

## 5. Forbidden zones detected

- Quy kết đích danh nhãn hàng / shop / sàn TMĐT. Nguồn [v4] (Thế giới Tiếp thị – Dân Việt) CÓ nêu tên một sàn TMĐT bị xử phạt trong một vụ việc cụ thể. Đã cố ý loại tên đó khỏi raw_quote. Writer chỉ dùng phần mô tả dark patterns ở dạng tổng hợp. Toàn bộ ví dụ trong bài phải là mẫu chung ("2.000.000đ → 599.000đ"), không gắn thương hiệu. Chạm forbidden_examples + tinh thần forbidden_zone #3.

- Chính trị / chính sách nhà nước. Nguồn [c7] Tversky & Kahneman 1974 dùng ví dụ gốc "tỷ lệ nước châu Phi trong Liên Hợp Quốc"; [c3] Toulmin dùng ví dụ quốc tịch Bermuda/Anh. CHỈ lấy cơ chế, kể lại bằng bối cảnh mua sắm VN. Chạm forbidden_zone #1, #2 nếu bê nguyên.

- Tam đoạn luận sách giáo khoa. [c2] IEP và [c5] SEP đều minh hoạ bằng syllogism. Đã cố ý không trích ví dụ của họ — chỉ lấy định nghĩa. term_handling::forbidden_devices cấm cả tam đoạn luận, bảng chân trị và ký hiệu hình thức.

- Trượt sang bài khác. Nguồn [v1] có nhắc "sản phẩm giảm giá chỉ là đồ tồn kho, lỗi mốt" — nếu khai thác sâu sẽ thành chuyện chất lượng hàng, không phải chuyện tiền đề ẩn. Nguồn [v4]/[v5] có phần "1.000 người đang xem" — dùng quá tay dễ trượt sang bandwagon/appeal to popularity, thuộc Level 2. Giữ mọi ví dụ ở đúng khuôn "căn cứ hiển thị đúng + mốc so sánh do bên bán dựng".

- Giọng "quảng cáo toàn lừa đảo". Rủi ro cao vì 5/7 VN example đều là bài cảnh báo tiêu cực. Bắt buộc cân bằng bằng phản ví dụ VỮNG ở §1 ([v7]) và bằng [v2] (tồn tại mốc giá khuyến mại hợp lệ theo luật). §5 phải nói rõ công cụ này để kiểm tra, không phải để bác bỏ mọi thứ.

- KOL / celebrity VN. Không xuất hiện trong nguồn nào đã chọn. Nếu writer muốn thêm ví dụ livestream bán hàng, mô tả chung ("một phiên livestream bán hàng"), không nêu tên người.
