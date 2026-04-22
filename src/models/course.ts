export interface Course {
  id: string;
  name: string;
  instructor: string;
  studentCount: number;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  description: string;
}

export default {
  namespace: 'course',

  state: {
    list: [] as Course[],
  },

  reducers: {
    setCourses(state, { payload }) {
      return { ...state, list: payload };
    },
  },
};