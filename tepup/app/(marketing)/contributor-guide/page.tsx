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
      <main className="max-w-3xl mx-auto px-4 py-12">
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
                  Không ai biết bạn là ai — kể cả Admin. Đóng góp của bạn chỉ hiển thị dưới username bạn chọn.
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
                  <p className="text-gray-600 text-sm">Khi hoàn thành, bạn gửi bản nháp để Reviewer kiểm tra.</p>
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
                  <h3 className="font-semibold text-gray-900">Review</h3>
                  <p className="text-gray-600 text-sm">Reviewer kiểm tra nội dung: chính xác, phù hợp, chất lượng. Thường trong vòng vài giờ đến vài ngày.</p>
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
                  <p className="text-gray-600 text-sm">Khi được duyệt, khóa học mới được tạo ở trạng thái ẩn. Quản trị viên kiểm tra lần cuối rồi kích hoạt, lúc đó người học mới thấy. Trang &ldquo;Đã gửi&rdquo; cho biết khóa học đang chờ kích hoạt hay đã lên web. Nếu Reviewer yêu cầu chỉnh sửa, góp ý hiện ngay trong trình soạn để bạn sửa và gửi lại.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Trust Levels */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">4</span>
            Cấp độ tin cậy (Trust Levels)
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-gray-600 text-sm mb-4">Bạn bắt đầu ở cấp Contributor. Ban quản trị xem xét thăng cấp dựa trên các đóng góp đã được duyệt.</p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Star className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Contributor <span className="text-gray-400 font-normal">(Cấp 0)</span></h3>
                  <p className="text-gray-600 text-xs">Mới tạo tài khoản. Tạo bản nháp, gửi duyệt.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                <Star className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Trusted Contributor <span className="text-gray-400 font-normal">(Cấp 1)</span></h3>
                  <p className="text-gray-600 text-xs">Được ban quản trị xét duyệt, thường sau khoảng <strong>5 bài được duyệt</strong>. Là sự ghi nhận của ban quản trị. Hiện quyền soạn và gửi duyệt giống Contributor; việc đề xuất chỉnh sửa bài đã có trên web đang được phát triển, chưa có trên giao diện.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Reviewer <span className="text-gray-400 font-normal">(Cấp 2)</span></h3>
                  <p className="text-gray-600 text-xs">Do Admin chỉ định. Duyệt hoặc từ chối đóng góp của người khác.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <Crown className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Admin <span className="text-gray-400 font-normal">(Cấp 3)</span></h3>
                  <p className="text-gray-600 text-xs">Toàn quyền quản lý nội dung và người dùng.</p>
                </div>
              </div>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Đề xuất tính năng mới
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">6</span>
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Nếu bài bị từ chối thì sao?
              </h3>
              <p className="text-gray-600 text-sm">Bạn sẽ nhận feedback cụ thể từ Reviewer về lý do từ chối. Sửa theo feedback rồi gửi lại — không giới hạn số lần.</p>
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
              <p className="text-gray-600 text-sm">Reviewer (contributor đã được Admin tin tưởng giao quyền) hoặc Admin. Họ kiểm tra tính chính xác và chất lượng nội dung.</p>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all"
          >
            Đăng ký ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
