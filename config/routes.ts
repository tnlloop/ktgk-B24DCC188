export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/Login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },


  {
    path: '/dashboard',
    name: 'Dashboard',
    component: './TrangChu',
    icon: 'HomeOutlined',
  },

  {
    path: '/random-user',
    name: 'RandomUser',
    component: './RandomUser',
    icon: 'ArrowsAltOutlined',
  },

  {
    path: '/courses',
    name: 'Quản lý khóa học',
    icon: 'BookOutlined',
    routes: [
      {
        path: '/courses',
        redirect: '/courses/list',
      },
      {
        path: '/courses/list',
        name: 'Danh sách khóa học',
        component: './CourseList',
        icon: 'UnorderedListOutlined',
      },
      {
        path: '/courses/add',
        name: 'Thêm khóa học',
        component: './CourseAdd',
        icon: 'PlusOutlined',
      },
      {
        path: '/courses/edit/:id',
        name: 'Chỉnh sửa khóa học',
        component: './CourseEdit',
        hideInMenu: true, // Ẩn khỏi menu chính
      },
      {
        path: '/courses/detail/:id',
        name: 'Chi tiết khóa học',
        component: './CourseDetail',
        hideInMenu: true, // Ẩn khỏi menu chính
      },
    ],
  },

  {
    path: '/notification',
    routes: [
      {
        path: './subscribe',
        exact: true,
        component: './ThongBao/Subscribe',
      },
      {
        path: './check',
        exact: true,
        component: './ThongBao/Check',
      },
      {
        path: './',
        exact: true,
        component: './ThongBao/NotifOneSignal',
      },
    ],
    layout: false,
    hideInMenu: true,
  },

  {
    path: '/',
  },
  {
    path: '/403',
    component: './exception/403/403Page',
    layout: false,
  },
  {
    path: '/hold-on',
    component: './exception/DangCapNhat',
    layout: false,
  },
  {
    component: './exception/404',
  },
];