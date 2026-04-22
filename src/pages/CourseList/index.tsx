import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Popconfirm,
  message,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  BookOutlined,
  UserOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'umi';
import { courseService } from '@/services/courseService';
import { Course, CourseStatus, INSTRUCTORS } from '@/models/course';

const { Search } = Input;

const CourseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [searchName, setSearchName] = useState('');
  const [filterInstructor, setFilterInstructor] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<CourseStatus | undefined>();
  const [loading, setLoading] = useState(false);

  // Tải dữ liệu từ localStorage
  const loadData = () => {
    setLoading(true);
    try {
      const data = courseService.getAll();
      setCourses(data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lọc dữ liệu theo tên, giảng viên, trạng thái
  useEffect(() => {
    let result = [...courses];
    
    if (searchName) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    if (filterInstructor) {
      result = result.filter(c => c.instructor === filterInstructor);
    }
    
    if (filterStatus) {
      result = result.filter(c => c.status === filterStatus);
    }
    
    setFiltered(result);
  }, [searchName, filterInstructor, filterStatus, courses]);

  // Xóa khóa học (chỉ cho phép xóa khi chưa có học viên)
  const handleDelete = (record: Course) => {
    if (record.studentCount > 0) {
      message.error(
        `Không thể xóa khóa học "${record.name}" vì đã có ${record.studentCount} học viên!`,
        4
      );
      return;
    }
    
    try {
      courseService.delete(record.id);
      message.success(`✅ Đã xóa khóa học "${record.name}" thành công!`);
      loadData(); // Tải lại dữ liệu
    } catch (error) {
      message.error('Lỗi khi xóa khóa học!');
      console.error(error);
    }
  };

  // Reset tất cả bộ lọc
  const handleResetFilters = () => {
    setSearchName('');
    setFilterInstructor(undefined);
    setFilterStatus(undefined);
    message.info('Đã reset bộ lọc');
  };

  // Lấy màu sắc cho trạng thái
  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.OPEN:
        return 'green';
      case CourseStatus.CLOSED:
        return 'red';
      case CourseStatus.PAUSED:
        return 'orange';
      default:
        return 'default';
    }
  };

  // Lấy icon cho trạng thái
  const getStatusIcon = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.OPEN:
        return <CheckCircleOutlined />;
      case CourseStatus.CLOSED:
        return <CheckCircleOutlined />;
      case CourseStatus.PAUSED:
        return <PauseCircleOutlined />;
      default:
        return null;
    }
  };

  // Thống kê số liệu
  const getStatistics = () => {
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
    const openCourses = courses.filter(c => c.status === CourseStatus.OPEN).length;
    const closedCourses = courses.filter(c => c.status === CourseStatus.CLOSED).length;
    
    return { totalCourses, totalStudents, openCourses, closedCourses };
  };

  const stats = getStatistics();

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left' as const,
      render: (id: string) => (
        <Tooltip title={id}>
          <Tag color="blue">{id.slice(-6)}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      sorter: (a: Course, b: Course) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <strong>{name}</strong>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'instructor',
      key: 'instructor',
      width: 180,
      sorter: (a: Course, b: Course) => a.instructor.localeCompare(b.instructor),
      render: (instructor: string) => (
        <Space>
          <UserOutlined />
          {instructor}
        </Space>
      ),
    },
    {
      title: 'Số lượng HV',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 130,
      sorter: (a: Course, b: Course) => a.studentCount - b.studentCount,
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'} style={{ fontSize: '14px' }}>
          {count} học viên
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: Object.values(CourseStatus).map(status => ({
        text: status,
        value: status,
      })),
      onFilter: (value: any, record: Course) => record.status === value,
      render: (status: CourseStatus) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)} style={{ fontSize: '13px' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: Course) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/courses/detail/${record.id}`)}
            >
              Xem
            </Button>
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/courses/edit/${record.id}`)}
            >
              Sửa
            </Button>
          </Tooltip>
          
          <Tooltip title={record.studentCount > 0 ? 'Không thể xóa vì đã có học viên' : 'Xóa khóa học'}>
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc chắn muốn xóa khóa học "${record.name}"?`}
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              disabled={record.studentCount > 0}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={record.studentCount > 0}
              >
                Xóa
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        title={
          <Space>
            <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Quản lý khóa học Online</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/courses/add')}
            size="large"
          >
            Thêm khóa học mới
          </Button>
        }
      >
        {/* Thống kê nhanh */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số khóa học"
                value={stats.totalCourses}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số học viên"
                value={stats.totalStudents}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Khóa học đang mở"
                value={stats.openCourses}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Khóa học đã kết thúc"
                value={stats.closedCourses}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap size="middle">
            <Search
              placeholder="Tìm kiếm theo tên khóa học"
              allowClear
              onSearch={setSearchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 280 }}
              size="large"
              prefix={<SearchOutlined />}
            />
            
            <Select
              placeholder="Lọc theo giảng viên"
              allowClear
              style={{ width: 200 }}
              size="large"
              options={INSTRUCTORS.map(i => ({ label: i, value: i }))}
              onChange={setFilterInstructor}
              value={filterInstructor}
            />
            
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 160 }}
              size="large"
              options={Object.values(CourseStatus).map(s => ({ label: s, value: s }))}
              onChange={setFilterStatus}
              value={filterStatus}
            />
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleResetFilters}
              size="large"
            >
              Reset bộ lọc
            </Button>
          </Space>
        </Card>

        {/* Bảng danh sách khóa học */}
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 8,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khóa học`,
            showSizeChanger: true,
            pageSizeOptions: ['8', '12', '20', '50'],
            showQuickJumper: true,
          }}
          bordered
          rowClassName={(record) => 
            record.studentCount === 0 ? 'course-empty' : 'course-has-students'
          }
        />
      </Card>

      {/* Style tùy chỉnh */}
      <style>{`
        .course-empty {
          background-color: #fffbf0;
        }
        .course-has-students {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default CourseListPage;