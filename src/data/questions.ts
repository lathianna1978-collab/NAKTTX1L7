import { Question, RankInfo } from '../types';

export const MASTER_QUESTIONS: Question[] = [
  // --- PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN (10 CÂU - 5,0 ĐIỂM) ---
  {
    id: 1,
    stage: 1,
    type: 'multiple_choice',
    level: 'Nhận biết',
    lesson: 'Bài 1: Tự hào về truyền thống quê hương',
    questionText: 'Bác thợ gốm làng cổ dạy các bạn nhỏ cách nhào đất và vẽ hoa văn lên bình gốm. Hoạt động này thể hiện điều gì?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Sự lãng phí thời gian và sức lực của người già.' },
      { id: 'B', text: 'Việc trao truyền và giữ gìn nghề truyền thống quê hương.' },
      { id: 'C', text: 'Hành vi quảng cáo hàng hóa thương mại tự phát.' },
      { id: 'D', text: 'Sự bắt buộc của chính quyền địa phương đối với học sinh.' },
    ],
    correctOption: 'B',
    explanation: 'Việc truyền dạy cách làm gốm là biểu hiện tiêu biểu của sự trao truyền và gìn giữ nét đẹp nghề thủ công truyền thống của quê hương.',
  },
  {
    id: 2,
    stage: 1,
    type: 'multiple_choice',
    level: 'Nhận biết',
    lesson: 'Bài 1: Tự hào về truyền thống quê hương',
    questionText: 'Khi nghe tin làn điệu hát xoan của quê mình được ghi danh là Di sản văn hóa, bạn Minh rất tự hào. Minh nên làm gì để tiếp tục lan tỏa giá trị này?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Giữ kín bí mật không cho người ngoài biết.' },
      { id: 'B', text: 'Chỉ nghe nhạc hiện đại và bỏ qua dân ca truyền thống.' },
      { id: 'C', text: 'Tìm hiểu, học hỏi các câu hát xoan và giới thiệu đến bạn bè.' },
      { id: 'D', text: 'Yêu cầu chính quyền trả tiền cho người hát.' },
    ],
    correctOption: 'C',
    explanation: 'Học sinh lan tỏa di sản văn hóa bằng cách tích cực học hỏi, tìm hiểu và giới thiệu nét đẹp dân ca với bạn bè xung quanh.',
  },
  {
    id: 3,
    stage: 1,
    type: 'multiple_choice',
    level: 'Thông hiểu',
    lesson: 'Bài 1: Tự hào về truyền thống quê hương',
    questionText: 'Bạn An thấy du khách vứt rác tại di tích lịch sử của quê hương. Hành động nào sau đây thể hiện trách nhiệm bảo vệ truyền thống?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Thờ ơ đi qua coi như không phải việc của mình.' },
      { id: 'B', text: 'Nhắc nhở du khách nhẹ nhàng và chủ động nhặt rác bỏ vào thùng.' },
      { id: 'C', text: 'Đăng hình ảnh lên mạng xã hội để chửi bới gay gắt.' },
      { id: 'D', text: 'Rủ bạn bè vứt rác theo để trả thù.' },
    ],
    correctOption: 'B',
    explanation: 'Nhắc nhở văn minh, lịch sự và chủ động giữ gìn vệ sinh di tích là hành động thiết thực thể hiện trách nhiệm của học sinh.',
  },
  {
    id: 4,
    stage: 1,
    type: 'multiple_choice',
    level: 'Nhận biết',
    lesson: 'Bài 1: Tự hào về truyền thống quê hương',
    questionText: 'Hoạt động nào dưới đây là biểu hiện của việc tự hào về truyền thống yêu nước của quê hương?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Tham gia lễ dâng hương và chăm sóc di tích lịch sử địa phương.' },
      { id: 'B', text: 'Chỉ quan tâm đến các sự kiện giải trí nước ngoài.' },
      { id: 'C', text: 'Bỏ qua các buổi sinh hoạt truyền thống ở trường.' },
      { id: 'D', text: 'Chê bai các phong tục tập quán của làng xã.' },
    ],
    correctOption: 'A',
    explanation: 'Chăm sóc di tích và dâng hương tưởng niệm là biểu hiện sâu sắc của lòng biết ơn và niềm tự hào về truyền thống yêu nước của cha ông.',
  },
  {
    id: 5,
    stage: 1,
    type: 'multiple_choice',
    level: 'Nhận biết',
    lesson: 'Bài 2: Quan tâm, cảm thông và chia sẻ',
    questionText: 'Khi thấy bạn cùng lớp gục đầu xuống bàn rơm rớm nước mắt vì gặp chuyện buồn gia đình, em nên xử sự thế nào?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Lại gần lắng nghe, nhẹ nhàng hỏi thăm và an ủi bạn.' },
      { id: 'B', text: 'Cười đùa và rủ các bạn khác lại xem.' },
      { id: 'C', text: 'Bỏ đi chỗ khác để tránh liên lụy.' },
      { id: 'D', text: 'Đăng bài lên mạng xã hội hỏi lý do bạn khóc.' },
    ],
    correctOption: 'A',
    explanation: 'Sự quan tâm, cảm thông bắt đầu từ việc lắng nghe chân thành, nhẹ nhàng động viên khi bạn bè gặp khó khăn, chuyện buồn.',
  },
  {
    id: 6,
    stage: 1,
    type: 'multiple_choice',
    level: 'Thông hiểu',
    lesson: 'Bài 2: Quan tâm, cảm thông và chia sẻ',
    questionText: 'Việc các bạn học sinh quyên góp sách vở, quần áo cũ gửi tặng học sinh vùng lũ lụt thể hiện tình cảm gì?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Sự phô trương gia cảnh giàu có.' },
      { id: 'B', text: 'Sự quan tâm, cảm thông và chia sẻ với người khó khăn.' },
      { id: 'C', text: 'Việc làm bắt buộc để lấy điểm rèn luyện.' },
      { id: 'D', text: 'Sự lãng phí tài sản của gia đình.' },
    ],
    correctOption: 'B',
    explanation: 'Quyên góp ủng hộ đồng bào vùng lũ lụt thể hiện tình yêu thương, tinh thần tương thân tương ái, biết sẻ chia với hoàn cảnh khó khăn.',
  },
  {
    id: 7,
    stage: 1,
    type: 'multiple_choice',
    level: 'Nhận biết',
    lesson: 'Bài 2: Quan tâm, cảm thông và chia sẻ',
    questionText: 'Thái độ nào sau đây trái ngược với sự cảm thông và chia sẻ?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Biết đặt mình vào vị trí của người khác.' },
      { id: 'B', text: 'Sẵn sàng san sẻ khi bạn gặp gian khó.' },
      { id: 'C', text: 'Thờ ơ, lạnh nhạt trước nỗi đau của người khác.' },
      { id: 'D', text: 'Lắng nghe và động viên người gặp hoạn nạn.' },
    ],
    correctOption: 'C',
    explanation: 'Thờ ơ, vô cảm, dửng dưng trước nỗi đau của người khác là biểu hiện hoàn toàn trái ngược với sự cảm thông và chia sẻ.',
  },
  {
    id: 8,
    stage: 2,
    type: 'multiple_choice',
    level: 'Thông hiểu',
    lesson: 'Bài 2: Quan tâm, cảm thông và chia sẻ',
    questionText: 'Hành động nào thể hiện sự tôn trọng và chia sẻ tinh thần với bạn học kém hơn mình?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Giảng lại bài chu đáo cho bạn khi bạn chưa hiểu.' },
      { id: 'B', text: 'Chê bai bạn chậm hiểu trước mặt lớp.' },
      { id: 'C', text: 'Làm bài hộ để bạn có điểm cao.' },
      { id: 'D', text: 'Không chơi với bạn vì sợ ảnh hưởng kết quả.' },
    ],
    correctOption: 'A',
    explanation: 'Tận tình hỗ trợ, giảng lại kiến thức cho bạn cùng tiến bộ vừa giúp bạn hiểu bài vừa thể hiện sự tôn trọng, sẻ chia tri thức chân thành.',
  },
  {
    id: 9,
    stage: 2,
    type: 'multiple_choice',
    level: 'Nhận biết',
    lesson: 'Bài 3: Học tập tự giác, tích cực',
    questionText: 'Biểu hiện nào dưới đây chứng tỏ học sinh có tinh thần học tập tự giác, tích cực?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Chỉ học bài khi bố mẹ ngồi bên cạnh giám sát.' },
      { id: 'B', text: 'Chủ động lập thời gian biểu và hoàn thành bài tập trước khi đến lớp.' },
      { id: 'C', text: 'Chờ thầy cô nhắc nhở mới chép bài.' },
      { id: 'D', text: 'Mượn vở bạn chép chống đối khi đến giờ kiểm tra.' },
    ],
    correctOption: 'B',
    explanation: 'Tự giác là chủ động lên kế hoạch và hoàn thành bài vở nghiêm túc mà không cần người khác phải thúc giục, giám sát.',
  },
  {
    id: 10,
    stage: 2,
    type: 'multiple_choice',
    level: 'Thông hiểu',
    lesson: 'Bài 3: Học tập tự giác, tích cực',
    questionText: 'Khi gặp một bài toán khó chưa tìm ra lời giải, học sinh tự giác sẽ chọn cách làm nào?',
    points: 0.5,
    options: [
      { id: 'A', text: 'Bỏ qua không làm nữa để đi chơi điện tử.' },
      { id: 'B', text: 'Suy nghĩ, tra cứu tài liệu và nhờ thầy cô, bạn bè hướng dẫn cách giải.' },
      { id: 'C', text: 'Mở phần mềm giải bài tập chép nguyên đáp án vào vở.' },
      { id: 'D', text: 'Đổ lỗi cho đề bài quá khó và trách thầy cô.' },
    ],
    correctOption: 'B',
    explanation: 'Khi gặp thử thách học tập, học sinh tích cực sẽ nỗ lực tìm tòi, suy ngẫm và chủ động nhờ sự trợ giúp về phương pháp thay vì bỏ cuộc hoặc đối phó.',
  },

  // --- PHẦN II. ĐIỀN KHUYẾT (4 CÂU - 2,0 ĐIỂM) ---
  {
    id: 11,
    stage: 2,
    type: 'fill_in_blank',
    level: 'Nhận biết',
    lesson: 'Bài 1: Tự hào về truyền thống quê hương',
    questionText: 'Giữ gìn và phát huy truyền thống quê hương giúp chúng ta có thêm sức mạnh, niềm tự hào và góp phần làm phong phú thêm bản sắc .............. của dân tộc.',
    points: 0.5,
    acceptedAnswers: ['văn hóa', 'văn hoá', 'van hoa'],
    explanation: 'Giữ gìn truyền thống làm phong phú bản sắc văn hóa dân tộc.',
  },
  {
    id: 12,
    stage: 2,
    type: 'fill_in_blank',
    level: 'Nhận biết',
    lesson: 'Bài 2: Quan tâm, cảm thông và chia sẻ',
    questionText: 'Quan tâm, cảm thông và chia sẻ là sự chăm sóc bằng tình cảm chân thành, biết đặt mình vào .............. của người khác để thấu hiểu và giúp đỡ.',
    points: 0.5,
    acceptedAnswers: ['vị trí', 'vi tri'],
    explanation: 'Đặt mình vào vị trí của người khác để đồng cảm thấu hiểu.',
  },
  {
    id: 13,
    stage: 2,
    type: 'fill_in_blank',
    level: 'Nhận biết',
    lesson: 'Bài 3: Học tập tự giác, tích cực',
    questionText: 'Học tập tự giác, tích cực là sự chủ động, cố gắng tự mình thực hiện tốt nhiệm vụ học tập mà không cần ai .............. hay khuyên bảo.',
    points: 0.5,
    acceptedAnswers: ['nhắc nhở', 'nhac nho'],
    explanation: 'Tự giác là chủ động làm việc không cần ai nhắc nhở.',
  },
  {
    id: 14,
    stage: 2,
    type: 'fill_in_blank',
    level: 'Thông hiểu',
    lesson: 'Bài 3: Học tập tự giác, tích cực',
    questionText: 'Việc chủ động lập .............. học tập và rèn luyện hằng ngày giúp học sinh làm chủ thời gian, đạt kết quả cao và phát triển bản thân.',
    points: 0.5,
    acceptedAnswers: ['kế hoạch', 'ke hoach'],
    explanation: 'Lập kế hoạch học tập giúp chủ động quản lý thời gian.',
  },

  // --- PHẦN III. NỐI CỘT (3 CÂU - 1,5 ĐIỂM) ---
  {
    id: 15,
    stage: 3,
    type: 'matching',
    level: 'Thông hiểu',
    lesson: 'Bài 1: Tự hào về truyền thống quê hương',
    questionText: 'Ghép hành vi ở cột A với ý nghĩa tương ứng ở cột B:',
    points: 0.5,
    columnA: [
      { id: '1', text: 'Quảng bá làng nghề mây tre đan trên mạng.' },
      { id: '2', text: 'Tham gia tập xòe Thái cùng nghệ nhân.' },
      { id: '3', text: 'Quét dọn nghĩa trang liệt sĩ địa phương.' },
      { id: '4', text: 'Viết bài giới thiệu món ăn đặc sản vùng miền.' },
    ],
    columnB: [
      { id: 'a', text: 'Góp phần giữ gìn di sản phi vật thể quê hương.' },
      { id: 'b', text: 'Tôn trọng lịch sử và tri ấn thế hệ đi trước.' },
      { id: 'c', text: 'Đưa sản phẩm truyền thống đến gần du khách.' },
      { id: 'd', text: 'Lan tỏa nét văn hóa ẩm thực độc đáo.' },
    ],
    correctMatching: {
      '1': 'c',
      '2': 'a',
      '3': 'b',
      '4': 'd',
    },
    explanation: '1-c, 2-a, 3-b, 4-d: Nối đúng các biểu hiện giữ gìn truyền thống với ý nghĩa tương ứng.',
  },
  {
    id: 16,
    stage: 3,
    type: 'matching',
    level: 'Thông hiểu',
    lesson: 'Bài 2: Quan tâm, cảm thông và chia sẻ',
    questionText: 'Nối biểu hiện ở cột A với loại hình sẻ chia ở cột B:',
    points: 0.5,
    columnA: [
      { id: '1', text: 'Ủng hộ tiền tiết kiệm giúp bạn mổ tim.' },
      { id: '2', text: 'Lắng nghe bạn tâm sự về nỗi buồn ghen tị.' },
      { id: '3', text: 'Đến nhà giúp bạn chép bài khi bạn bị ốm.' },
      { id: '4', text: 'Hướng dẫn bạn phương pháp ghi nhớ bài.' },
    ],
    columnB: [
      { id: 'a', text: 'Chia sẻ về mặt tinh thần, cảm xúc.' },
      { id: 'b', text: 'Chia sẻ về thời gian và công sức.' },
      { id: 'c', text: 'Chia sẻ về vật chất.' },
      { id: 'd', text: 'Chia sẻ về kiến thức, kỹ năng học tập.' },
    ],
    correctMatching: {
      '1': 'c',
      '2': 'a',
      '3': 'b',
      '4': 'd',
    },
    explanation: '1-c, 2-a, 3-b, 4-d: Phân loại chuẩn xác các hình thức chia sẻ vật chất, tinh thần, thời gian.',
  },
  {
    id: 17,
    stage: 3,
    type: 'matching',
    level: 'Thông hiểu',
    lesson: 'Bài 3: Học tập tự giác, tích cực',
    questionText: 'Ghép thái độ học tập ở cột A với kết quả tương ứng ở cột B:',
    points: 0.5,
    columnA: [
      { id: '1', text: 'Chủ động đọc trước sách giáo khoa.' },
      { id: '2', text: 'Học dồn ép vào đêm trước kỳ thi.' },
      { id: '3', text: 'Tích cực làm việc nhóm cùng bạn.' },
      { id: '4', text: 'Tìm kiếm thêm tài liệu nâng cao.' },
    ],
    columnB: [
      { id: 'a', text: 'Nắm chắc kiến thức, hăng hái phát biểu.' },
      { id: 'b', text: 'Dễ quên bài, mệt mỏi và kết quả kém.' },
      { id: 'c', text: 'Mở rộng hiểu biết và phát triển kỹ năng.' },
      { id: 'd', text: 'Tăng cường tinh thần đồng đội và học hỏi.' },
    ],
    correctMatching: {
      '1': 'a',
      '2': 'b',
      '3': 'd',
      '4': 'c',
    },
    explanation: '1-a, 2-b, 3-d, 4-c: Thể hiện mối quan hệ giữa thái độ tích cực và kết quả học tập tốt.',
  },

  // --- PHẦN IV. SẮP XẾP THỨ TỰ (3 CÂU - 1,5 ĐIỂM) ---
  {
    id: 18,
    stage: 3,
    type: 'ordering',
    level: 'Vận dụng',
    lesson: 'Bài 1: Tự hào về truyền thống quê hương',
    questionText: 'Sắp xếp các bước tổ chức buổi giới thiệu truyền thống quê hương cho CLB trường theo đúng trình tự:',
    points: 0.5,
    orderItems: [
      { id: 'A', text: 'Phân công nhiệm vụ chuẩn bị tranh ảnh, hiện vật.' },
      { id: 'B', text: 'Lựa chọn chủ đề truyền thống (ví dụ: Nghề làm gốm cổ).' },
      { id: 'C', text: 'Lập danh sách khách mời và tổng duyệt chương trình.' },
      { id: 'D', text: 'Tiến hành thuyết trình và giao lưu trải nghiệm.' },
    ],
    correctOrder: ['B', 'A', 'C', 'D'],
    explanation: '(B) ➔ (A) ➔ (C) ➔ (D): Quy trình chuẩn gồm chọn chủ đề -> phân công -> tổng duyệt -> thực hiện.',
  },
  {
    id: 19,
    stage: 3,
    type: 'ordering',
    level: 'Vận dụng',
    lesson: 'Bài 2: Quan tâm, cảm thông và chia sẻ',
    questionText: 'Sắp xếp quy trình thực hiện dự án chia sẻ "Nụ cười cho em" giúp học sinh vùng cao:',
    points: 0.5,
    orderItems: [
      { id: 'A', text: 'Khảo sát nhu cầu thực tế của học sinh vùng khó khăn.' },
      { id: 'B', text: 'Tiếp nhận, phân loại và đóng gói quà tặng.' },
      { id: 'C', text: 'Phát động phong trào quyên góp sách vở trong toàn trường.' },
      { id: 'D', text: 'Tận tay trao tặng và tổ chức hoạt động giao lưu tại điểm trường.' },
    ],
    correctOrder: ['A', 'C', 'B', 'D'],
    explanation: '(A) ➔ (C) ➔ (B) ➔ (D): Khảo sát thực tế trước -> phát động quyên góp -> đóng gói -> trao tận tay.',
  },
  {
    id: 20,
    stage: 3,
    type: 'ordering',
    level: 'Vận dụng',
    lesson: 'Bài 3: Học tập tự giác, tích cực',
    questionText: 'Sắp xếp các bước lập kế hoạch học tập tự giác hiệu quả trong tuần:',
    points: 0.5,
    orderItems: [
      { id: 'A', text: 'Liệt kê toàn bộ nhiệm vụ học tập cần hoàn thành.' },
      { id: 'B', text: 'Đánh giá mức độ ưu tiên và thời gian dành cho từng môn.' },
      { id: 'C', text: 'Xây dựng bảng thời gian biểu chi tiết.' },
      { id: 'D', text: 'Theo dõi, kiểm tra và điều chỉnh thực tế cuối tuần.' },
    ],
    correctOrder: ['A', 'B', 'C', 'D'],
    explanation: '(A) ➔ (B) ➔ (C) ➔ (D): Liệt kê bài -> đánh giá ưu tiên -> làm thời gian biểu -> theo dõi kiểm tra.',
  },
];

// Helper to remove accents for robust comparison
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Check fill in the blank answer
export function isFillBlankCorrect(userInput: string | undefined, accepted: string[] = []): boolean {
  if (!userInput) return false;
  const cleanedInput = userInput.trim().toLowerCase();
  const unaccentedInput = removeVietnameseAccents(cleanedInput);

  for (const item of accepted) {
    const cleanedItem = item.trim().toLowerCase();
    const unaccentedItem = removeVietnameseAccents(cleanedItem);
    if (cleanedInput === cleanedItem || unaccentedInput === unaccentedItem) {
      return true;
    }
  }
  return false;
}

// Check matching answer
export function isMatchingCorrect(
  userMatching: Record<string, string> | undefined,
  correctMatching: Record<string, string> | undefined
): boolean {
  if (!userMatching || !correctMatching) return false;
  const keys = Object.keys(correctMatching);
  for (const k of keys) {
    if (userMatching[k] !== correctMatching[k]) {
      return false;
    }
  }
  return true;
}

// Check ordering answer
export function isOrderingCorrect(
  userOrder: string[] | undefined,
  correctOrder: string[] | undefined
): boolean {
  if (!userOrder || !correctOrder) return false;
  if (userOrder.length !== correctOrder.length) return false;
  for (let i = 0; i < correctOrder.length; i++) {
    if (userOrder[i] !== correctOrder[i]) {
      return false;
    }
  }
  return true;
}

// Calculate Title and Feedback based on Section X
export function getRankInfo(score: number): RankInfo {
  if (score >= 9.0) {
    return {
      tier: 1,
      title: 'SIÊU SAO TRI THỨC',
      feedback: 'Chúc mừng em! Em đã thể hiện kiến thức vững vàng, sự tập trung và tinh thần học tập tự giác. Hãy tiếp tục phát huy nhé!',
      badgeColor: 'from-amber-400 via-yellow-300 to-amber-500',
      textColor: 'text-amber-300',
      icon: '🏆',
    };
  } else if (score >= 8.0) {
    return {
      tier: 2,
      title: 'NHÀ CHINH PHỤC XUẤT SẮC',
      feedback: 'Em đã hoàn thành rất tốt hành trình. Hãy tiếp tục rèn luyện để hiểu sâu hơn và vận dụng kiến thức linh hoạt hơn.',
      badgeColor: 'from-blue-500 via-indigo-400 to-cyan-400',
      textColor: 'text-cyan-300',
      icon: '⭐',
    };
  } else if (score >= 6.5) {
    return {
      tier: 3,
      title: 'CHIẾN BINH TIẾN BỘ',
      feedback: 'Em đã có những bước tiến đáng ghi nhận. Hãy xem lại nội dung đã học, rút kinh nghiệm và tiếp tục cố gắng.',
      badgeColor: 'from-purple-500 via-pink-400 to-purple-600',
      textColor: 'text-purple-300',
      icon: '🛡️',
    };
  } else if (score >= 5.0) {
    return {
      tier: 4,
      title: 'NHÀ THÁM HIỂM KIÊN TRÌ',
      feedback: 'Em đã hoàn thành thử thách. Hãy dành thêm thời gian ôn tập những kiến thức còn chưa chắc chắn. Mỗi lần cố gắng đều giúp em tiến bộ.',
      badgeColor: 'from-teal-500 via-emerald-400 to-cyan-600',
      textColor: 'text-emerald-300',
      icon: '🧭',
    };
  } else {
    return {
      tier: 5,
      title: 'MẦM NON TRI THỨC',
      feedback: 'Đừng nản lòng nhé! Kết quả hôm nay giúp em biết mình cần học thêm nội dung nào. Hãy kiên trì ôn tập và tiếp tục phát triển từng ngày.',
      badgeColor: 'from-emerald-400 via-lime-400 to-green-600',
      textColor: 'text-lime-300',
      icon: '🌱',
    };
  }
}

// Generate a customized, anti-copy shuffled version of the 20 questions based on Exam Code
export function getCustomShuffledQuestions(examCode: string = 'MÃ ĐỀ 701'): Question[] {
  let seed = 0;
  for (let i = 0; i < examCode.length; i++) {
    seed = (seed << 5) - seed + examCode.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed);

  return MASTER_QUESTIONS.map((origQ, qIdx) => {
    const q: Question = JSON.parse(JSON.stringify(origQ));

    if (q.type === 'multiple_choice' && q.options) {
      const shift = (seed + qIdx) % q.options.length;
      if (shift > 0) {
        const correctOptObj = q.options.find((o) => o.id === q.correctOption);
        const correctText = correctOptObj ? correctOptObj.text : '';

        const rotatedTexts = q.options.map((o) => o.text);
        for (let s = 0; s < shift; s++) {
          const first = rotatedTexts.shift();
          if (first) rotatedTexts.push(first);
        }

        const letters = ['A', 'B', 'C', 'D'];
        q.options = letters.map((letter, idx) => ({
          id: letter,
          text: rotatedTexts[idx] || '',
        }));

        const newCorrect = q.options.find((o) => o.text === correctText);
        if (newCorrect) {
          q.correctOption = newCorrect.id;
        }
      }
    } else if (q.type === 'ordering' && q.orderItems) {
      const shift = (seed + qIdx) % q.orderItems.length;
      for (let s = 0; s < shift; s++) {
        const item = q.orderItems.shift();
        if (item) q.orderItems.push(item);
      }
    } else if (q.type === 'matching' && q.columnB) {
      const shift = (seed + qIdx) % q.columnB.length;
      for (let s = 0; s < shift; s++) {
        const item = q.columnB.shift();
        if (item) q.columnB.push(item);
      }
    }

    return q;
  });
}

