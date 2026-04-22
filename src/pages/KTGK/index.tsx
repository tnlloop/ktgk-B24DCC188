import React, { useState, useMemo, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Card,
  Tooltip,
  Badge,
  InputNumber,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Enums & Types ────────────────────────────────────────────────────────────

enum CourseStatus {
  OPEN = 'OPEN',
  ENDED = 'ENDED',
  PAUSED = 'PAUSED',
}

const STATUS_LABEL: Record<CourseStatus, string> = {
  [CourseStatus.OPEN]: 'Đang mở',
  [CourseStatus.ENDED]: 'Đã kết thúc',
  [CourseStatus.PAUSED]: 'Tạm dừng',
};

const STATUS_COLOR: Record<CourseStatus, string> = {
  [CourseStatus.OPEN]: 'success',
  [CourseStatus.ENDED]: 'default',
  [CourseStatus.PAUSED]: 'warning',
};

interface Course {
  id: string;
  name: string;
  instructor: string;
  studentCount: number;
  status: CourseStatus;
  description: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const INSTRUCTORS = [
  'Nguyễn Văn An',
  'Trần Thị Bình',
  'Lê Minh Cường',
  'Phạm Thị Dung',
  'Hoàng Văn Em',
  'Vũ Thị Phương',
];

const initialCourses: Course[] = [
  {
    id: '001',
    name: 'Lập trình React từ cơ bản đến nâng cao',
    instructor: 'Nguyễn Văn An',
    studentCount: 320,
    status: CourseStatus.OPEN,
    description: '<p>Khóa học <b>React</b> toàn diện cho người mới bắt đầu.</p>',
  },
  {
    id: '002',
    name: 'Python cho Data Science',
    instructor: 'Trần Thị Bình',
    studentCount: 0,
    status: CourseStatus.PAUSED,
    description: '<p>Học <em>Python</em> và các thư viện phân tích dữ liệu.</p>',
  },
  {
    id: '003',
    name: 'NodeJS & Express API',
    instructor: 'Lê Minh Cường',
    studentCount: 180,
    status: CourseStatus.OPEN,
    description: '<p>Xây dựng REST API với <b>NodeJS</b> và Express.</p>',
  },
  {
    id: '004',
    name: 'Thiết kế UI/UX với Figma',
    instructor: 'Phạm Thị Dung',
    studentCount: 95,
    status: CourseStatus.ENDED,
    description: '<p>Khóa học thiết kế giao diện người dùng chuyên nghiệp.</p>',
  },
  {
    id: '005',
    name: 'Docker & Kubernetes DevOps',
    instructor: 'Hoàng Văn Em',
    studentCount: 0,
    status: CourseStatus.OPEN,
    description: '<p>Triển khai ứng dụng với <b>Docker</b> và Kubernetes.</p>',
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const generateId = () => String(Date.now()).slice(-6).padStart(3, '0');

// ─── Main Component ───────────────────────────────────────────────────────────

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterInstructor, setFilterInstructor] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<CourseStatus | undefined>();
  const [form] = Form.useForm();
  const descRef = useRef<HTMLTextAreaElement>(null);

  // ─── Filtered & Sorted Data ────────────────────────────────────────────────

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchName = c.name.toLowerCase().includes(searchText.toLowerCase());
      const matchInstructor = filterInstructor ? c.instructor === filterInstructor : true;
      const matchStatus = filterStatus ? c.status === filterStatus : true;
      return matchName && matchInstructor && matchStatus;
    });
  }, [courses, searchText, filterInstructor, filterStatus]);

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: courses.length,
    open: courses.filter((c) => c.status === CourseStatus.OPEN).length,
    paused: courses.filter((c) => c.status === CourseStatus.PAUSED).length,
    ended: courses.filter((c) => c.status === CourseStatus.ENDED).length,
    totalStudents: courses.reduce((s, c) => s + c.studentCount, 0),
  }), [courses]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (record: Course) => {
    setEditingCourse(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record: Course) => {
    if (record.studentCount > 0) {
      message.error(
        `Không thể xóa! Khóa học "${record.name}" đang có ${record.studentCount} học viên.`,
      );
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== record.id));
    message.success(`Đã xóa khóa học "${record.name}" thành công.`);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const isDuplicate = courses.some(
        (c) =>
          c.name.trim().toLowerCase() === values.name.trim().toLowerCase() &&
          c.id !== editingCourse?.id,
      );
      if (isDuplicate) {
        form.setFields([{ name: 'name', errors: ['Tên khóa học đã tồn tại!'] }]);
        return;
      }

      if (editingCourse) {
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? { ...c, ...values } : c)),
        );
        message.success('Cập nhật khóa học thành công!');
      } else {
        const newCourse: Course = { id: generateId(), ...values };
        setCourses((prev) => [newCourse, ...prev]);
        message.success('Thêm khóa học mới thành công!');
      }

      setModalVisible(false);
      form.resetFields();
    });
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────

  const columns: ColumnsType<Course> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (id) => <Text code style={{ fontSize: 12 }}>#{id}</Text>,
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description.replace(/<[^>]+>/g, '').slice(0, 60)}...
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <UserOutlined />
          Giảng viên
        </Space>
      ),
      dataIndex: 'instructor',
      key: 'instructor',
      width: 170,
    },
    {
      title: (
        <Space>
          <TeamOutlined />
          Học viên
        </Space>
      ),
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 120,
      sorter: (a, b) => a.studentCount - b.studentCount,
      defaultSortOrder: 'descend',
      render: (count) => (
        <Badge
          count={count}
          showZero
          style={{
            backgroundColor: count === 0 ? '#d9d9d9' : '#1890ff',
            fontSize: 12,
          }}
          overflowCount={9999}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: CourseStatus) => (
        <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Popconfirm
            title={
              record.studentCount > 0
                ? `Khóa học có ${record.studentCount} học viên, không thể xóa!`
                : `Xác nhận xóa khóa học "${record.name}"?`
            }
            okText={record.studentCount > 0 ? 'Đã hiểu' : 'Xóa'}
            cancelText="Hủy"
            okButtonProps={{
              danger: record.studentCount === 0,
              disabled: record.studentCount > 0,
            }}
            onConfirm={() => handleDelete(record)}
            icon={<DeleteOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title={record.studentCount > 0 ? 'Không thể xóa (có học viên)' : 'Xóa'}>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger={record.studentCount === 0}
                disabled={record.studentCount > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center">
            <BookOutlined style={{ fontSize: 28, color: '#1890ff' }} />
            <div>
              <Title level={3} style={{ margin: 0, color: '#1d1d1d' }}>
                Quản lý khóa học Online
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Hệ thống quản lý khóa học trực tuyến
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={openAdd}
            style={{ borderRadius: 8 }}
          >
            Thêm khóa học
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng khóa học', value: stats.total, color: '#1890ff', icon: '📚' },
          { label: 'Đang mở', value: stats.open, color: '#52c41a', icon: '✅' },
          { label: 'Tạm dừng', value: stats.paused, color: '#faad14', icon: '⏸️' },
          { label: 'Đã kết thúc', value: stats.ended, color: '#8c8c8c', icon: '🏁' },
          { label: 'Tổng học viên', value: stats.totalStudents, color: '#722ed1', icon: '👨‍🎓' },
        ].map((s) => (
          <Col key={s.label} xs={24} sm={12} md={12} lg={6} xl={4} style={{ marginBottom: 8 }}>
            <Card
              size="small"
              bordered={false}
              style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Bar */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={12} align="middle">
          <Col flex="1">
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Tìm kiếm theo tên khóa học..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Select
              style={{ width: 200 }}
              placeholder={
                <Space>
                  <FilterOutlined />
                  Giảng viên
                </Space>
              }
              allowClear
              value={filterInstructor}
              onChange={setFilterInstructor}
            >
              {INSTRUCTORS.map((i) => (
                <Option key={i} value={i}>{i}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              style={{ width: 170 }}
              placeholder={
                <Space>
                  <FilterOutlined />
                  Trạng thái
                </Space>
              }
              allowClear
              value={filterStatus}
              onChange={setFilterStatus}
            >
              {Object.values(CourseStatus).map((s) => (
                <Option key={s} value={s}>
                  <Tag color={STATUS_COLOR[s]} style={{ margin: 0 }}>{STATUS_LABEL[s]}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {filteredCourses.length} / {courses.length} khóa học
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Table<Course>
          columns={columns}
          dataSource={filteredCourses}
          rowKey="id"
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khóa học`,
            pageSizeOptions: ['5', '8', '15', '30'],
          }}
          style={{ borderRadius: 12 }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <Space>
            {editingCourse ? <EditOutlined /> : <PlusOutlined />}
            {editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
          </Space>
        }
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={editingCourse ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={680}
        destroyOnClose
        style={{ top: 40 }}
        bodyStyle={{ padding: '24px 32px' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: CourseStatus.OPEN, studentCount: 0 }}
        >
          <Row gutter={16}>
            {/* Course Name */}
            <Col span={24}>
              <Form.Item
                label="Tên khóa học"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khóa học!' },
                  { max: 100, message: 'Tên khóa học không được vượt quá 100 ký tự!' },
                  { whitespace: true, message: 'Tên khóa học không được chỉ là khoảng trắng!' },
                ]}
              >
                <Input
                  placeholder="Nhập tên khóa học (tối đa 100 ký tự)"
                  showCount
                  maxLength={100}
                />
              </Form.Item>
            </Col>

            {/* Instructor */}
            <Col span={12}>
              <Form.Item
                label="Giảng viên"
                name="instructor"
                rules={[{ required: true, message: 'Vui lòng chọn giảng viên!' }]}
              >
                <Select placeholder="Chọn giảng viên" showSearch>
                  {INSTRUCTORS.map((i) => (
                    <Option key={i} value={i}>
                      <Space>
                        <UserOutlined />
                        {i}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Student Count */}
            <Col span={12}>
              <Form.Item
                label="Số lượng học viên"
                name="studentCount"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng học viên!' },
                  {
                    type: 'number',
                    min: 0,
                    message: 'Số lượng học viên phải >= 0!',
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            {/* Status */}
            <Col span={24}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  {Object.values(CourseStatus).map((s) => (
                    <Option key={s} value={s}>
                      <Tag color={STATUS_COLOR[s]} style={{ margin: 0, marginRight: 6 }}>
                        {STATUS_LABEL[s]}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Description */}
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    Mô tả khóa học
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                      (Hỗ trợ HTML)
                    </Text>
                  </Space>
                }
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học!' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập mô tả khóa học (có thể dùng HTML, vd: <p>Nội dung <b>in đậm</b></p>)"
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              </Form.Item>

              {/* HTML Preview */}
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const desc = getFieldValue('description');
                  return desc ? (
                    <div
                      style={{
                        border: '1px dashed #d9d9d9',
                        borderRadius: 8,
                        padding: '10px 14px',
                        marginTop: -16,
                        marginBottom: 8,
                        background: '#fafafa',
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                        👁 Xem trước HTML:
                      </Text>
                      {/* eslint-disable-next-line react/no-danger */}
                      <div dangerouslySetInnerHTML={{ __html: desc }} style={{ fontSize: 13 }} />
                    </div>
                  ) : null;
                }}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Inline styles for zebra rows */}
      <style>{`
        .table-row-light { background: #ffffff; }
        .table-row-dark  { background: #fafafa; }
        .ant-table-tbody > tr.table-row-light:hover > td,
        .ant-table-tbody > tr.table-row-dark:hover > td {
          background: #e6f7ff !important;
        }
        .ant-table-thead > tr > th {
          background: #f0f5ff;
          font-weight: 600;
          font-size: 13px;
        }
        .ant-badge-count { font-weight: 600; }
      `}</style>
    </div>
  );
};

export default CourseManagement;