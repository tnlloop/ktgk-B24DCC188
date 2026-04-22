import { Course } from '@/models/course';

const STORAGE_KEY = 'online_courses';

// Seed dữ liệu mẫu nếu chưa có
const getInitialData = (): Course[] => [
  {
    id: '1',
    name: 'Lập trình React cơ bản',
    instructor: 'Nguyễn Văn A',
    studentCount: 45,
    description: '<p>Khóa học <strong>React</strong> từ A-Z</p>',
    status: CourseStatus.OPEN,
  },
  {
    id: '2',
    name: 'Python cho người mới bắt đầu',
    instructor: 'Trần Thị B',
    studentCount: 120,
    description: '<p>Học <em>Python</em> dễ hiểu</p>',
    status: CourseStatus.OPEN,
  },
  {
    id: '3',
    name: '高级 JavaScript',
    instructor: 'Lê Văn C',
    studentCount: 0,
    description: '<p>Chuyên sâu về JS</p>',
    status: CourseStatus.PAUSED,
  },
];

const getCourses = (): Course[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getInitialData()));
    return getInitialData();
  }
  return JSON.parse(data);
};

const saveCourses = (courses: Course[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
};

export const courseService = {
  getAll: (): Course[] => getCourses(),

  getById: (id: string): Course | undefined => {
    return getCourses().find(c => c.id === id);
  },

  add: (course: Omit<Course, 'id'>): Course => {
    const courses = getCourses();
    const newId = Date.now().toString();
    const newCourse = { ...course, id: newId };
    courses.push(newCourse);
    saveCourses(courses);
    return newCourse;
  },

  update: (id: string, updated: Omit<Course, 'id'>): Course | null => {
    const courses = getCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses[index] = { ...updated, id };
      saveCourses(courses);
      return courses[index];
    }
    return null;
  },

  delete: (id: string): void => {
    const courses = getCourses();
    const filtered = courses.filter(c => c.id !== id);
    saveCourses(filtered);
  },

  isNameDuplicate: (name: string, excludeId?: string): boolean => {
    const courses = getCourses();
    return courses.some(c => c.name === name && c.id !== excludeId);
  },
};