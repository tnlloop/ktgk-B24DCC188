import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Spin,
  message,
  Divider,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'umi';
import { courseService } from '@/services/courseService';
import { Course, CourseStatus } from '@/models/course';

const { Title, Paragraph } = Typography;

const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = courseService.getById(id);
      if (found) {
        setCourse(found);
      } else {
        message.error('❌ Không tìm thấy khóa học!');
        navigate('/courses/list');
      }
    }
    setLoading(false);
  }, [id, navigate]);

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.OPEN: return 'green';
      case CourseStatus.CLOSED: return 'red';
      case CourseStatus.PAUSED: return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.OPEN: return '🟢';
      case CourseStatus.CLOSED: return '🔴';
      case CourseStatus.PAUSED: return '🟠';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100, background: '#f0f2f5', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang tải thông tin khóa học..." />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/courses/list')}
            >
              Quay lại danh sách
            </Button>
            <Divider type="vertical" />
            <BookOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết khóa học</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/courses/edit/${course.id}`)}
            >
              Chỉnh sửa
            </Button>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Title level={2}>
              {course.name}
              <Tag 
                icon={getStatusIcon(course.status)} 
                color={getStatusColor(course.status)} 
                style={{ marginLeft: 12, fontSize: '14px' }}
              >
                {course.status}
              </Tag>
            </Title>
          </Col>

          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Mã khóa học"
                value={course.id.slice(-8)}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Giảng viên"
                value={course.instructor}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Số lượng học viên"
                value={course.studentCount}
                prefix={<TeamOutlined />}
                suffix="học viên"
                valueStyle={{ color: course.studentCount > 0 ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">
          <Space>
            <FileTextOutlined />
            Mô tả khóa học
          </Space>
        </Divider>

        <Card style={{ marginTop: 16, background: '#fafafa' }}>
          <div
            dangerouslySetInnerHTML={{ __html: course.description }}
            style={{ lineHeight: 1.8, fontSize: '16px' }}
          />
        </Card>

        <Divider orientation="left">
          <Space>
            <CalendarOutlined />
            Thông tin bổ sung
          </Space>
        </Divider>

        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="ID đầy đủ">{course.id}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(course.status)}>{course.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng học viên tối đa">
            {course.studentCount} / 9999
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(parseInt(course.id)).toLocaleDateString('vi-VN')}
          </Descriptions.Item>
          <Descriptions.Item label="Giảng viên chính">
            {course.instructor}
          </Descriptions.Item>
          <Descriptions.Item label="Tình trạng tuyển sinh">
            {course.studentCount > 0 ? 'Đã có học viên' : 'Chưa có học viên'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space size="large">
            <Button onClick={() => navigate('/courses/list')}>
              Quay lại danh sách
            </Button>
            <Button type="primary" onClick={() => navigate(`/courses/edit/${course.id}`)}>
              Chỉnh sửa khóa học
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CourseDetailPage;