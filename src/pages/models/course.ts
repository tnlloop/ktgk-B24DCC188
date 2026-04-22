export enum CourseStatus {
  OPEN = 'Đang mở',
  CLOSED = 'Đã kết thúc',
  PAUSED = 'Tạm dừng',
}

export interface Course {
  id: string;
  name: string;
  instructor: string;
  studentCount: number;
  description: string;
  status: CourseStatus;
}

export const INSTRUCTORS = [
  'Nguyễn Văn A',
  'Trần Thị B',
  'Lê Văn C',
  'Phạm Thị D',
  'Hoàng Thị E',
];