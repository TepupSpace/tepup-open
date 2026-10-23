import Link from '@/components/ui/AppLink';
import {
  UserPlus,
  FileEdit,
  Send,
  CheckCircle,
  Shield,
  Star,
  Eye,
  Crown,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Puzzle,
  Lightbulb,
} from 'lucide-react';

export const metadata = {
  title: 'Cách đóng góp cho Tepup',
  description:
    'Hướng dẫn cách đóng góp khóa học và kiến thức cho Tepup — hoàn toàn ẩn danh, không cần thông tin cá nhân.',
};

export default function ContributorGuidePage() {
  return (
    <div className="bg-gray-50">
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Hướng dẫn Đóng góp cho Tepup
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Mọi thứ bạn cần biết để bắt đầu đóng góp khóa học — hoàn toàn ẩn danh, không cần thông tin cá nhân.
          </p>
        </div>

        {/* Section 1: Tepup là gì */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">1</span>
            Tepup là gì & Tại sao cần bạn?
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-gray-700 mb-3">
              <strong>Tepup</strong> là nền tảng học kiến thức công dân thực dụng bằng tiếng Việt — thuế, tư duy, quyền số, và các chủ đề khác mà người Việt cần trong đời sống hằng ngày.
            </p>
            <p className="text-gray-700">
              Chúng tôi tin rằng <strong>bất kỳ ai cũng có thể đóng góp kiến thức</strong>. Giống như Wikipedia, Tepup cho phép mọi người tạo và chia sẻ nội dung giáo dục — hoàn toàn ẩn danh nếu bạn muốn.
            </p>
          </div>
        </section>

        {/* Section 2: Cách tạo tài khoản */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">2</span>
            Cách tạo tài khoản
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Chỉ cần Username + Mật khẩu</h3>
                <p className="text-gray-600 text-sm">
                  Không yêu cầu email, không tên thật, không thông tin cá nhân. Bạn tự chọn một username bất kỳ (ví dụ: <code className="bg-gray-100 px-1 rounded">nguoi_dong_gop_123</code>).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Hoàn toàn ẩn danh</h3>
                <p className="text-gray-600 text-sm">
                  Không ai biết bạn là ai — kể cả quản trị viên. Đóng góp của bạn chỉ hiển thị dưới username bạn chọn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Quy trình đóng góp */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">3</span>
            Quy trình đóng góp
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Flow steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Tạo bản nháp (Draft)</h3>
                  <p className="text-gray-600 text-sm">Viết khóa học, thêm bài học, chỉnh sửa nội dung. Chỉ bạn mới thấy bản nháp.</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Gửi duyệt (Submit for Review)</h3>
                  <p className="text-gray-600 text-sm">Khi hoàn thành, bạn gửi bản nháp để người duyệt kiểm tra.</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Duyệt (Review)</h3>
                  <p className="text-gray-600 text-sm">Người duyệt kiểm tra nội dung: chính xác, phù hợp, chất lượng. Thường trong vòng vài giờ đến vài ngày.</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Được duyệt → chờ kích hoạt → lên web</h3>
                  <p className="text-gray-600 text-sm">Khi được duyệt, khóa học mới được tạo ở trạng thái ẩn. Quản trị viên kiểm tra lần cuối rồi kích hoạt, lúc đó người học mới thấy. Trang &ldquo;Đã gửi&rdquo; cho biết khóa học đang chờ kích hoạt hay đã lên web. Nếu người duyệt yêu cầu chỉnh sửa, góp ý hiện ngay trong trình soạn để bạn sửa và gửi lại.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Access levels and course roles */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">4</span>
            Cấp truy cập và vai trò trong khóa học
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-gray-700 text-sm mb-3">
              Ai viết, duyệt hay chăm sóc nội dung cho TepUp đều là <strong>người đóng góp</strong>. Quyền của mỗi người được mô tả
              bằng hai lớp tách biệt:
            </p>
            <ul className="text-gray-700 text-sm list-disc pl-5 space-y-1 mb-4">
              <li>
                <strong>Cấp truy cập</strong>: áp dụng trên toàn trang. Bạn bắt đầu ở cấp <strong>Người soạn thảo</strong>; ban quản trị xem
                xét thăng cấp dựa trên các đóng góp đã được duyệt.
              </li>
              <li>
                <strong>Vai trò trong khóa học</strong>: chỉ áp dụng cho <strong>một khóa cụ thể</strong> và được giao thêm, độc lập với
                cấp truy cập.
              </li>
            </ul>

            <h3 className="font-semibold text-gray-900 mb-2">Cấp truy cập</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Star className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Người soạn thảo <span className="text-gray-600 font-normal">(Author, cấp 0)</span></h4>
                  <p className="text-gray-600 text-xs">Mới tạo tài khoản. Tạo bản nháp, gửi duyệt.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                <Star className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Người soạn thảo tin cậy <span className="text-gray-600 font-normal">(Trusted author, cấp 1)</span></h4>
                  <p className="text-gray-600 text-xs">Được ban quản trị xét duyệt, thường sau khoảng <strong>5 bài được duyệt</strong>. Là sự ghi nhận của ban quản trị: được mở nhiều đề xuất cùng lúc hơn (30 thay vì 10), đề xuất được xếp trước trong hàng chờ duyệt, và có thể được mời làm trưởng khóa học một khóa học.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Người duyệt <span className="text-gray-600 font-normal">(Reviewer, cấp 2)</span></h4>
                  <p className="text-gray-600 text-xs">Do quản trị viên chỉ định. Duyệt hoặc từ chối đóng góp của người khác cho mọi khóa học.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <Crown className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Quản trị viên <span className="text-gray-600 font-normal">(Admin, cấp 3)</span></h4>
                  <p className="text-gray-600 text-xs">Toàn quyền quản lý nội dung và người dùng.</p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">Vai trò trong một khóa học</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Star className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Trưởng khóa học <span className="text-gray-600 font-normal">(Course lead)</span></h4>
                  <p className="text-gray-600 text-xs">
                    Duyệt đề xuất cho khóa đó, nhận góp ý của người học, ẩn/hiện bài và khôi phục phiên bản cũ.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Star className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Người duyệt tin cậy <span className="text-gray-600 font-normal">(Trusted reviewer)</span></h4>
                  <p className="text-gray-600 text-xs">
                    Thường là chuyên gia được mời. Duyệt đề xuất cho khóa đó và cho ý kiến về bài nhóm TepUp gửi nhờ duyệt; họ tự chọn có
                    công khai thông tin chuyên môn với người học hay không.
                  </p>
                </div>
              </div>
              <p className="text-gray-600 text-xs">
                Quản trị viên giao vai trò trong khóa học. Không ai được tự duyệt đóng góp của mình.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Hướng dẫn viết nội dung */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">5</span>
            Hướng dẫn viết nội dung chất lượng
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Cấu trúc Mở - Thân - Kết */}
            <h3 className="font-semibold text-gray-900 mb-3">Cấu trúc một bài học</h3>
            <p className="text-gray-600 text-sm mb-4">Mỗi bài học nên theo cấu trúc 3 phần:</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">Mở</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Giới thiệu</h4>
                  <p className="text-gray-600 text-xs">Bài này sẽ học gì? Tại sao kiến thức này quan trọng? Giúp người học hiểu mục tiêu trước khi bắt đầu.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">Thân</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Nội dung chính</h4>
                  <p className="text-gray-600 text-xs">Trình bày kiến thức qua text, hình ảnh, callout, và đặc biệt là <strong>các công cụ tương tác</strong> để người học hiểu sâu hơn.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-sm font-bold">Kết</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Tổng hợp</h4>
                  <p className="text-gray-600 text-xs">Tóm tắt những gì vừa học, câu hỏi kiểm tra, và gợi ý đọc thêm.</p>
                </div>
              </div>
            </div>

            {/* Công cụ tương tác CTA */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <Puzzle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Sáng tạo với công cụ tương tác</h4>
                  <p className="text-gray-600 text-xs mb-3">
                    Một bài học tốt thường có nhiều tương tác để người học hiểu sâu. Tepup cung cấp hơn 20 loại block tương tác: quiz, mô phỏng, tranh luận, timeline, và nhiều hơn nữa.
                  </p>
                  <Link
                    href="/contributor-guide/block-demo"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Puzzle className="w-3.5 h-3.5" />
                    Xem demo công cụ tương tác
                  </Link>
                </div>
              </div>
            </div>

            {/* Bring-your-own-AI guide (signed-in area) */}
            <p className="text-sm text-gray-700 mb-6">
              Muốn soạn nhanh hơn?{' '}
              <Link href="/contributor/ai-guide" className="text-teal-800 underline font-medium">
                Dùng AI của bạn để soạn bài
              </Link>{' '}
              <span className="text-gray-600">(cần đăng nhập)</span>
            </p>

            {/* Nên / Tránh */}
            <h3 className="font-semibold text-gray-900 mb-2">Nên</h3>
            <ul className="text-gray-700 text-sm space-y-1 mb-4">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Viết dễ hiểu, tránh thuật ngữ phức tạp không cần thiết</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Trích dẫn nguồn rõ ràng khi nêu số liệu hoặc sự kiện</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Thêm hình ảnh minh họa và công cụ tương tác</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Giữ giọng văn khách quan, trung lập</li>
            </ul>

            <h3 className="font-semibold text-gray-900 mb-2">Tránh</h3>
            <ul className="text-gray-700 text-sm space-y-1 mb-6">
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /> Nội dung sai sự thật hoặc chưa được xác minh</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /> Spam, quảng cáo, nội dung không liên quan</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /> Vi phạm bản quyền (copy nguyên văn từ nguồn khác)</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /> Nội dung thiên vị, mang tính tuyên truyền một chiều</li>
            </ul>

            {/* Feature request CTA */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Thiếu tính năng bạn cần?</h4>
                  <p className="text-gray-600 text-xs mb-3">
                    Nếu bạn có ý tưởng về công cụ mới, tính năng cải thiện, hoặc bất kỳ đề xuất nào — hãy cho chúng tôi biết!
                  </p>
                  <Link
                    href="/feature-request"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 text-white text-xs font-medium rounded-lg hover:bg-amber-800 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Đề xuất tính năng mới
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Giấy phép, ghi công, lịch sử (the public footer links to #ghi-cong) */}
        <section id="ghi-cong" className="mb-10 scroll-mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">6</span>
            Giấy phép, ghi công và lịch sử
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 text-sm text-gray-700">
            <p>
              Nội dung trên TepUp được phát hành theo giấy phép{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.vi" className="text-teal-800 underline" rel="noopener noreferrer" target="_blank">
                CC BY-SA 4.0
              </a>
              : ai cũng được chia sẻ và chỉnh sửa, miễn là ghi công và giữ cùng giấy phép. Khi đăng ký, bạn đồng ý phát hành nội dung
              đóng góp theo giấy phép này.
            </p>
            <p>
              <strong>Ghi công:</strong> mỗi khóa học có mục &ldquo;Tác giả và người đóng góp&rdquo;. Bạn chọn trong Cài đặt cách được ghi
              công: tên tài khoản, hoặc bút danh ngẫu nhiên dạng &ldquo;Người đóng góp #k7m2q&rdquo; (mặc định). Bút danh không suy ra được
              từ tên tài khoản.
            </p>
            <p>
              <strong>Lịch sử:</strong> mọi thay đổi trên bài học, chương truyện, mục thư viện và mục lục khóa học đều được lưu lại. Trưởng
              khóa học và người duyệt có thể xem từng phiên bản và khôi phục khi cần.
            </p>
            <p>
              <strong>Xóa tài khoản:</strong> bạn có thể tự xóa tài khoản trong Cài đặt. Thông tin cá nhân bị xóa; nội dung đã xuất bản
              vẫn ở lại (như Wikipedia) và được ghi công bằng bút danh của bạn.
            </p>
          </div>
        </section>

        {/* Section 7: FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">7</span>
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Nếu bài bị từ chối thì sao?
              </h3>
              <p className="text-gray-600 text-sm">Bạn sẽ nhận góp ý cụ thể từ người duyệt về lý do từ chối. Sửa theo góp ý rồi gửi lại — không giới hạn số lần.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Có bị ban không?
              </h3>
              <p className="text-gray-600 text-sm">Chỉ khi vi phạm nghiêm trọng: spam liên tục, nội dung xúc phạm, hoặc cố tình phá hoại. Bài bị từ chối không phải là lý do ban.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Ai review bài của tôi?
              </h3>
              <p className="text-gray-600 text-sm">Người duyệt hoặc quản trị viên; với đề xuất sửa một khóa học, cả trưởng khóa học và người duyệt tin cậy của khóa đó. Họ kiểm tra tính chính xác và chất lượng nội dung. Bạn có thể trao đổi với họ trong mục Thảo luận của đề xuất.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Mất bao lâu để bài được duyệt?
              </h3>
              <p className="text-gray-600 text-sm">Tùy vào độ dài và số lượng bài chờ duyệt. Thường từ vài giờ đến vài ngày.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sẵn sàng đóng góp?</h2>
          <p className="text-gray-600 mb-6">Tạo tài khoản ẩn danh và bắt đầu chia sẻ kiến thức.</p>
          <Link
            href="/register-contributor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-800 transition-all"
          >
            Đăng ký ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
