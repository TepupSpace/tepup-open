<!--
Cho người bảo trì (không hiển thị cho người đóng góp):
- Bản này là nội dung để đưa vào trang /contributor-guide và tóm tắt ở /register-contributor.
- Thuật ngữ theo tepup/lib/terms.ts (quyết định 20.10.2026): mọi người ngoài nhóm nòng cốt là "người đóng góp";
  cấp truy cập là Người soạn thảo / Người soạn thảo tin cậy / Người duyệt / Quản trị viên; vai trò trong khóa là
  Trưởng khóa học / Người duyệt tin cậy; bút danh công khai là "Người đóng góp #<mã>". Không dùng "cộng tác viên".
  Tên tệp giữ nguyên để không gãy liên kết.
- 20.10.2026: các tính năng trước đây ghi "Sắp có" (đề xuất sửa bài và dàn bài, nhận làm góp ý, lịch sử và khôi phục,
  trưởng khóa học, người duyệt tin cậy, ghi công, tự xóa tài khoản) đã được xây trên nhánh feat/contributor-edits-pr1;
  đã bỏ nhãn "Sắp có". Nếu nhánh ấy chưa lên web khi đưa bản này lên trang, kiểm tra lại trước.
- Mục 4 (giấy phép CC BY-SA 4.0) đã được xác nhận ngày 13.10.2026. Câu chữ đồng ý chính thức do tổ chức soạn; khi có, thay đoạn "Khi gửi một đóng góp, bạn đồng ý rằng" cho khớp.
-->

# Người đóng góp cho Tepup: bạn đang đăng ký điều gì?

Đọc trong năm phút.

**Vài từ dùng trong trang này.** Ai viết, duyệt hay chăm sóc nội dung cho Tepup đều là **người đóng góp**, và khu bạn làm việc sau khi đăng nhập là **Khu đóng góp**. Quyền của mỗi người có hai lớp: **cấp truy cập** trên toàn trang (Người soạn thảo, Người soạn thảo tin cậy, Người duyệt, Quản trị viên) và **vai trò trong một khóa học** cụ thể (Trưởng khóa học, Người duyệt tin cậy).

## Tóm tắt trong sáu dòng

1. Bạn tạo tài khoản ẩn danh: chỉ cần tên đăng nhập và mật khẩu, không cần email hay số điện thoại.
2. Mọi thứ bạn gửi đều được một người khác đọc và duyệt trước khi người học thấy, và bạn không bao giờ tự duyệt bài của chính mình.
3. Nội dung bạn đóng góp được phát hành theo giấy phép mở **CC BY-SA 4.0**, giống Wikipedia: ai cũng được chia sẻ và chỉnh sửa, miễn là ghi công và giữ nguyên giấy phép.
4. Bạn chọn người học thấy tên đăng nhập của mình, hay một bút danh như "Người đóng góp #k7m2q".
5. Sau khi lên web, bài của bạn có thể được người khác đề xuất sửa, và mọi phiên bản cũ đều được giữ lại.
6. Nếu tài khoản bị xóa, bài đã đăng vẫn ở lại, giống Wikipedia. Nếu quên mật khẩu, bạn mất tài khoản, vì không có email để lấy lại.

---

## 1. Bạn có thể làm gì

- **Soạn một khóa học mới:** gồm các chương (cấp độ) và bài học, bằng trình soạn thảo trên web hoặc dán nội dung do AI tạo.
- **Lưu nháp:** chỉ bạn thấy bản nháp, và trình soạn tự lưu sau mỗi lần bạn ngừng gõ.
- **Gửi duyệt:** người duyệt đọc và chọn một trong ba việc: duyệt, yêu cầu chỉnh sửa (kèm góp ý cụ thể), hoặc từ chối (kèm lý do).
- **Sau khi duyệt:** khóa học được tạo ở trạng thái ẩn. Bạn xem được các bài đang ẩn trong khóa của mình; người học chưa thấy cho tới khi quản trị viên kích hoạt khóa.

- **Đề xuất sửa một bài đang có trên web,** của bất kỳ ai, kể cả khóa không phải của bạn. Bạn bắt đầu từ đúng bản đang chạy, sửa, rồi gửi duyệt như mọi đóng góp khác.
- **Đề xuất sửa dàn bài của một khóa:** đổi tên bài, đổi thứ tự, thêm bài mới vào giữa, đổi tên chương. Bài mới thêm vào sẽ ẩn cho tới khi có nội dung.
- **Nhận làm một góp ý của người học.** Khi người học góp ý sửa một bài và góp ý ấy được chấp nhận, bạn có thể bấm "Nhận làm" để biến nó thành một đề xuất sửa. Khi đề xuất được duyệt, góp ý được đánh dấu là đã áp dụng.

Mỗi người có tối đa 10 đề xuất sửa đang mở cùng lúc (Người soạn thảo tin cậy: 30), và mỗi bài chỉ một đề xuất của bạn tại một thời điểm.

## 2. Ai duyệt bài của bạn

|Loại đóng góp|Ai duyệt được|
|---|---|
|Khóa học mới|Người duyệt hoặc quản trị viên|
|Sửa một bài, hoặc sửa dàn bài của khóa X|Trưởng khóa học hoặc người duyệt tin cậy của khóa X, người duyệt, hoặc quản trị viên|

Không ai duyệt được đóng góp của chính mình. Nếu bạn là trưởng khóa học duy nhất của một khóa thì đề xuất của bạn cho khóa ấy sẽ do người khác (người duyệt tin cậy của khóa, người duyệt hoặc quản trị viên) xử lý. Bạn trao đổi với người duyệt trong mục Thảo luận của đề xuất.

Người duyệt kiểm tra ba điều: nội dung có đúng và có nguồn không, có theo [cấu trúc một bài học](<(key-doc)-cấu-trúc-một-bài-học.md>) không, và giọng văn có khách quan không. Thời gian chờ thường từ vài giờ đến vài ngày.

**Khi sửa một bài,** người duyệt thấy đúng những chỗ bạn thay đổi so với bản đang chạy. Nếu bài đã được người khác sửa trong lúc bạn đang làm, cả bạn và người duyệt đều được báo. Khi ấy bạn bấm "Cập nhật theo bản mới" để làm tiếp trên bản mới nhất, và không ai vô tình xóa mất công của người khác.

## 3. Cấp truy cập và vai trò trong khóa học

### Cấp truy cập (toàn trang)

Bạn bắt đầu ở cấp **Người soạn thảo**. Thăng cấp do ban quản trị quyết định, dựa trên các đóng góp đã được duyệt; không có thăng cấp tự động.

|Cấp|Ý nghĩa|
|---|---|
|**Người soạn thảo**|Soạn và gửi duyệt khóa mới, đề xuất sửa bài và dàn bài, nhận làm góp ý của người học.|
|**Người soạn thảo tin cậy**|Như trên, cộng thêm: đề xuất được xếp lên đầu hàng chờ duyệt, được mở tới 30 đề xuất cùng lúc, và có thể được mời làm trưởng khóa học một khóa.|
|**Người duyệt**|Do quản trị viên chỉ định. Duyệt mọi loại đóng góp của người khác, trên mọi khóa.|
|**Quản trị viên**|Kích hoạt hoặc ẩn cả một khóa học, xóa nội dung, quản lý và xóa tài khoản, giao vai trò trong khóa học, khôi phục phiên bản cũ.|

### Vai trò trong một khóa học

Vai trò này không phải một cấp: nó gắn với từng khóa, do quản trị viên giao, và không đổi cấp truy cập của bạn. Một người có thể giữ vai trò ở nhiều khóa. Bạn có thể tự rút khỏi vai trò bất cứ lúc nào (Cài đặt → Vai trò trong khóa học).

|Vai trò|Ý nghĩa|
|---|---|
|**Trưởng khóa học**|Tác giả của khóa tự động là trưởng khóa học khi khóa được duyệt; quản trị viên có thể thêm người khác. Trưởng khóa học duyệt các đề xuất sửa cho khóa đó (trừ đề xuất của chính mình), xử lý góp ý của người học về khóa đó, ẩn hoặc hiện từng bài khi khóa đã được kích hoạt, xem lịch sử và khôi phục phiên bản cũ.|
|**Người duyệt tin cậy**|Thường là chuyên gia được mời (xem mục 3a). Duyệt đề xuất sửa cho khóa đó (trừ của chính mình) và cho ý kiến về bài nhóm Tepup gửi nhờ duyệt. Không ẩn/hiện bài, không nhận góp ý của người học, không khôi phục phiên bản: các việc ấy thuộc trưởng khóa học.|

## 3a. Dành cho người duyệt tin cậy

Bạn được mời vì chuyên môn của bạn về chủ đề của một khóa. Cấp truy cập của bạn thường vẫn là Người soạn thảo; quyền thêm chỉ áp dụng cho khóa bạn được giao, và hết ngay khi quản trị viên gỡ vai trò.

**Bạn thấy gì:**

- các bài đang ẩn của khóa ấy (người học chưa thấy);
- hàng chờ đề xuất sửa cho khóa ấy;
- các **yêu cầu nhờ duyệt** do nhóm Tepup gửi cho bạn (trong Khu đóng góp), mỗi yêu cầu có ba phần: chỗ thay đổi so với bản đang chạy, bản nháp như người học sẽ thấy, và bản đang chạy;
- lịch sử sửa đổi và các thay đổi gần đây của khóa.

**Bạn làm gì:**

- duyệt, yêu cầu chỉnh sửa hoặc từ chối đề xuất sửa của người khác cho khóa ấy;
- cho ý kiến về bài nhóm gửi nhờ duyệt: **Đồng ý xuất bản** hoặc **Cần sửa**, kèm ghi chú. Ý kiến của bạn là tư vấn; quản trị viên quyết định việc xuất bản. Bạn đổi được ý kiến cho tới khi yêu cầu đóng;
- trao đổi trong mục Thảo luận, đánh dấu bài cần chú ý, chuyển việc lên quản trị viên khi cần, và đánh dấu một thay đổi gần đây là đã kiểm tra.

**Người học thấy gì về bạn: bạn tự chọn.** Trong Cài đặt → Hồ sơ người duyệt tin cậy, bạn chọn một trong bốn mức, áp dụng cho mọi khóa và đổi riêng được cho từng khóa:

|Mức|Người học thấy|
|---|---|
|**Không hiển thị** (`NONE`, mặc định)|Không gì cả. Người học không biết có người duyệt.|
|**Ẩn danh** (`ANONYMOUS`)|"Bài này đã được người duyệt tin cậy kiểm tra".|
|**Chuyên môn, không tên** (`CREDENTIAL`)|Ví dụ: "Đã được một luật sư (đã xác minh) kiểm tra". Lưu ý: chuyên môn quá hẹp vẫn có thể giúp người khác đoán ra bạn.|
|**Tên và chuyên môn** (`FULL`)|Ví dụ: "Kiểm tra bởi TS. Nguyễn Văn A, luật sư". Tên bạn hiện công khai cho bất kỳ ai.|

- **Hai mức `CREDENTIAL` và `FULL` cần quản trị viên xác minh** chuyên môn của bạn trước (ví dụ gặp trực tiếp, xem bằng cấp; Tepup không lưu bản sao giấy tờ). Trong lúc chờ, người học thấy nhiều nhất là mức ẩn danh. Nếu bạn sửa thông tin đã xác minh, việc xác minh bị gỡ và cần làm lại.
- **Tên công khai do bạn tự gõ**, không bao giờ lấy từ tên đăng nhập.
- Dòng ghi nhận hiện dưới tiêu đề bài mà bản đang chạy được bạn đồng ý xuất bản, và trong danh sách người thẩm định trên trang khóa học.
- **Bạn rút lại được bất cứ lúc nào;** trang Tepup cập nhật trong khoảng 10 phút. Nhưng những bản sao người khác đã tạo (bản lưu trữ, trang sao chép, ảnh chụp màn hình) thì không thu hồi được.

## 4. Giấy phép: điều bạn đồng ý khi đóng góp

Tepup muốn kiến thức công dân là của chung: ai cũng học được, chia sẻ được, và không ai khóa nó lại được, kể cả khi trang web bị chặn hay ngừng hoạt động. Vì thế, mọi nội dung đóng góp được phát hành theo giấy phép **[Creative Commons Ghi công – Chia sẻ tương tự 4.0 (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/deed.vi)**, đúng giấy phép mà Wikipedia dùng.

**Khi gửi một đóng góp, bạn đồng ý rằng:**

- **Bất kỳ ai cũng được** sao chép, chia sẻ và chỉnh sửa nội dung ấy, ở Tepup hay ở nơi khác, kể cả vì mục đích thương mại.
- **Đổi lại, người dùng lại phải:**
  - ghi công ("Những người đóng góp cho TepUp", kèm đường dẫn);
  - nói rõ họ đã sửa gì;
  - phát hành bản sửa của họ theo đúng giấy phép này.

  Nhờ vậy, một bản cải tiến không thể bị khóa lại làm của riêng.
- **Bạn có quyền đăng nội dung ấy:** bạn tự viết, hoặc dùng nguồn có giấy phép tương thích (chẳng hạn Wikipedia), hoặc chỉ trích dẫn ngắn và ghi rõ nguồn.
- **Người khác có thể đề xuất sửa nội dung của bạn trên Tepup,** và mọi đề xuất ấy đều phải qua duyệt.

**Vì sao chọn giấy phép này:**

- **Giữ cho kho bài là của chung:** không ai lấy về rồi khóa lại được.
- **Ai cũng được dựng bản sao của toàn bộ nội dung** mà không cần xin phép, nên nội dung vẫn còn dù Tepup bị chặn.
- **Dùng được nội dung Wikipedia,** và đóng góp ngược lại cho Wikipedia tiếng Việt.

Bạn đánh dấu đồng ý một lần khi tạo tài khoản, và mỗi lần gửi duyệt sẽ có một dòng nhắc lại giấy phép.

## 5. Tên của bạn trên trang

Mỗi khóa học có mục "Tác giả và người đóng góp". Trong phần Cài đặt, bạn chọn cách tên mình hiện ra ở đó, và đổi được bất cứ lúc nào:

- **Bút danh (mặc định):** "Người đóng góp #k7m2q". Mã này được tạo ngẫu nhiên khi bạn đăng ký và không bao giờ đổi. Không ai đoán ra được tên đăng nhập của bạn từ mã ấy.
- **Tên đăng nhập của bạn.**

Bất kể bạn chọn gì, người duyệt và quản trị viên vẫn thấy tên đăng nhập của bạn khi xử lý đóng góp. Ngược lại, bạn thấy tên đăng nhập của người đã duyệt bài mình.

## 6. Tepup lưu gì về bạn

- **Tài khoản:** tên đăng nhập và mật khẩu đã được mã hóa một chiều. Không có ai, kể cả quản trị viên, đọc được mật khẩu của bạn.
- **Đóng góp:** các đóng góp của bạn, các lần duyệt và góp ý kèm theo, và ngày giờ của từng việc.
- **Không lưu:** email, số điện thoại hay tên thật, trừ khi bạn tự viết vào nội dung. Cơ sở dữ liệu cũng không có chỗ nào lưu địa chỉ IP của bạn. Tuy vậy, như mọi trang web, nhà cung cấp hạ tầng (máy chủ, mạng phân phối) có thể ghi nhật ký truy cập tạm thời.
- **Nếu quên mật khẩu,** bạn mất tài khoản này. Không có email nên không có cách gửi đường dẫn đặt lại. Hãy lưu tên đăng nhập và mật khẩu ở nơi an toàn, ví dụ trong một trình quản lý mật khẩu.

## 7. Khi tài khoản bị khóa, và khi tài khoản bị xóa

|Điều gì xảy ra|Bị khóa|Bị xóa|
|---|---|---|
|Đăng nhập lại|Không, trừ khi quản trị viên mở khóa|Không bao giờ|
|Tên đăng nhập|Vẫn giữ cho bạn|Được giải phóng; người khác có thể đăng ký lại tên ấy|
|Thông tin tài khoản|Vẫn giữ|Bị xóa (tên, mật khẩu, phiên đăng nhập)|
|Bài đã đăng|Vẫn ở lại|Vẫn ở lại, ghi công dưới bút danh "Người đóng góp #…"|
|Bản nháp chưa gửi|Vẫn giữ|Bị xóa|
|Đề xuất đang chờ duyệt|Vẫn giữ|Bị đóng|

**Vì sao bài đã đăng vẫn ở lại:** giống Wikipedia, mỗi bài là công sức chung của nhiều người. Người khác đã sửa, đã dựa vào, đã trích dẫn nó, và giấy phép bạn đồng ý cho phép bài tiếp tục được dùng.

**Nếu ai đó đăng ký lại tên đăng nhập cũ của bạn,** đó là một người khác hoàn toàn. Họ không thấy gì của bạn, và bài của bạn không bao giờ được ghi công cho họ, vì việc ghi công gắn với tài khoản chứ không gắn với cái tên.

**Muốn xóa tài khoản của mình:** vào Cài đặt → "Xóa tài khoản", nhập mật khẩu hiện tại và gõ lại tên đăng nhập để xác nhận. Việc xóa không hoàn tác được. Tài khoản quản trị viên không tự xóa được; một quản trị viên khác sẽ xử lý.

## 8. Những điều sẽ khiến đóng góp bị từ chối, và những điều có thể khiến tài khoản bị khóa

**Bị từ chối:**

- nội dung sai sự thật hoặc chưa được kiểm chứng;
- thiếu nguồn cho số liệu và sự kiện;
- thiên vị, tuyên truyền một chiều;
- chép nguyên văn từ nguồn không cho phép;
- quảng cáo hay nội dung không liên quan.

Bị từ chối không phải là bị phạt. Bạn sửa theo góp ý rồi gửi lại, không giới hạn số lần.

**Bị khóa tài khoản:** chỉ khi vi phạm nghiêm trọng, như spam liên tục, nội dung xúc phạm, cố tình phá hoại, hoặc cố dùng đề xuất sửa để làm hỏng bài của người khác. Khi bị khóa, bạn bị đăng xuất trong vòng một phút.

## 9. Câu hỏi thường gặp

**Tôi có thể sửa bài của người khác mà họ không biết không?**
Không. Mọi đề xuất sửa đều qua duyệt, trưởng khóa học khóa thấy nó trong hàng chờ của mình, và bản cũ luôn được giữ lại.

**Người khác sửa bài của tôi theo hướng tôi không đồng ý thì sao?**
Nếu bạn là trưởng khóa học khóa, đề xuất ấy đến tay bạn hoặc một trưởng khóa học khác trước khi lên web, trừ khi bạn chính là người đề xuất. Nếu bản sửa đã lên web, trưởng khóa học của khóa hoặc quản trị viên có thể khôi phục bản trước từ lịch sử.

**Một trang khác chép bài của tôi về dùng thì có được không?**
Được, nếu họ ghi công, nói rõ đã sửa gì, và phát hành theo cùng giấy phép CC BY-SA 4.0. Đó chính là mục đích của giấy phép này.

**Tôi có cần biết lập trình không?**
Không. Trình soạn thảo là trình soạn trên web, có sẵn các khối tương tác như câu hỏi, ghép cặp, lật thẻ. Xem mọi loại khối ở trang [Bản demo khối tương tác](/contributor-guide/block-demo).

**Tôi có được trả tiền không?**
Không. Tepup là dự án miễn phí cho người học, và việc đóng góp là tự nguyện.

**Bao lâu thì bài của tôi lên web?**
Duyệt thường mất vài giờ đến vài ngày. Riêng khóa học mới còn chờ quản trị viên kích hoạt sau khi duyệt.
