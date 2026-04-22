import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  message,
  Row,
  Col,
  Space,
  Divider,
  Spin,
  Alert,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BookOutlined,
  UserOutlined,
  NumberOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'umi';
import { courseService } from '@/services/courseService';
import { Course, CourseStatus, INSTRUCTORS } from '@/models/course';
import TinyEditor from '@/components/TinyEditor';

const CourseEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [originalCourse, setOriginalCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (id) {
      const course = courseService.getById(id);
      if (course) {
        setOriginalCourse(course);
        form.setFieldsValue({
          name: course.name,
          instructor: course.instructor,
          studentCount: course.studentCount,
          status: course.status,
        });
        setDescription(course.description);
      } else {
        message.error('❌ Không tìm thấy khóa học!');
        navigate('/courses/list');
      }
    }
    setInitialLoading(false);
  }, [id, form, navigate]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Kiểm tra tên trùng (bỏ qua chính nó)
      if (courseService.isNameDuplicate(values.name, id)) {
        message.error('❌ Tên khóa học đã tồn tại! Vui lòng chọn tên khác.');
        setLoading(false);
        return;
      }

      // Kiểm tra mô tả
      if (!description || description.trim() === '') {
        message.error('❌ Vui lòng nhập mô tả khóa học!');
        setLoading(false);
        return;
      }

      const updatedCourse = {
        name: values.name,
        instructor: values.instructor,
        studentCount: values.studentCount,
        status: values.status,
        description: description,
      };

      courseService.update(id!, updatedCourse);
      message.success('✅ Cập nhật khóa học thành công!');
      
      setTimeout(() => {
        navigate('/courses/list');
      }, 1500);
    } catch (error) {
      message.error('❌ Vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 100, background: '#f0f2f5', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang tải thông tin khóa học..." />
      </div>
    );
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
              style={{ marginRight: 8 }}
            >
              Quay lại
            </Button>
            <Divider type="vertical" />
            <BookOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Chỉnh sửa khóa học
            </span>
            <Tag color="blue" icon={<BookOutlined />}>
              ID: {id?.slice(-8)}
            </Tag>
          </Space>
        }
      >
        {originalCourse && originalCourse.studentCount > 0 && (
          <Alert
            message="⚠️ Lưu ý quan trọng"
            description={`Khóa học này đã có ${originalCourse.studentCount} học viên đăng ký. Việc thay đổi thông tin có thể ảnh hưởng đến trải nghiệm của học viên.`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={
                  <Space>
                    <BookOutlined />
                    <span>Tên khóa học</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khóa học' },
                  { max: 100, message: 'Tên khóa học không được vượt quá 100 ký tự' },
                  { min: 5, message: 'Tên khóa học phải có ít nhất 5 ký tự' },
                ]}
              >
                <Input 
                  placeholder="VD: Lập trình React nâng cao" 
                  showCount 
                  maxLength={100}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="instructor"
                label={
                  <Space>
                    <UserOutlined />
                    <span>Giảng viên</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
              >
                <Select 
                  size="large"
                  options={INSTRUCTORS.map(i => ({ label: i, value: i }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="studentCount"
                label={
                  <Space>
                    <NumberOutlined />
                    <span>Số lượng học viên</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng học viên' },
                  { type: 'number', min: 0, message: 'Số lượng học viên phải >= 0' },
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Trạng thái khóa học"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select size="large">
                  <Select.Option value={CourseStatus.OPEN}>
                    🟢 {CourseStatus.OPEN}
                  </Select.Option>
                  <Select.Option value={CourseStatus.CLOSED}>
                    🔴 {CourseStatus.CLOSED}
                  </Select.Option>
                  <Select.Option value={CourseStatus.PAUSED}>
                    🟠 {CourseStatus.PAUSED}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    <FileTextOutlined />
                    <span>Mô tả khóa học</span>
                  </Space>
                }
                required
              >
                <TinyEditor
                  value={description}
                  onEditorChange={(content: string) => setDescription(content)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space size="large">
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                loading={loading} 
                icon={<SaveOutlined />}
                size="large"
              >
                Cập nhật khóa học
              </Button>
              <Button 
                onClick={() => navigate('/courses/list')}
                size="large"
              >
                Hủy bỏ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CourseEditPage;