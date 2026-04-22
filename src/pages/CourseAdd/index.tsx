import React, { useState } from 'react';
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
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BookOutlined,
  UserOutlined,
  NumberOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'umi';
import { courseService } from '@/services/courseService';
import { CourseStatus, INSTRUCTORS } from '@/models/course';
import TinyEditor from '@/components/TinyEditor';

const CourseAddPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Kiểm tra tên khóa học trùng
      if (courseService.isNameDuplicate(values.name)) {
        message.error('❌ Tên khóa học đã tồn tại! Vui lòng chọn tên khác.');
        setLoading(false);
        return;
      }

      // Kiểm tra mô tả không được để trống
      if (!description || description.trim() === '') {
        message.error('❌ Vui lòng nhập mô tả khóa học!');
        setLoading(false);
        return;
      }

      const newCourse = {
        name: values.name,
        instructor: values.instructor,
        studentCount: values.studentCount,
        status: values.status,
        description: description,
      };

      courseService.add(newCourse);
      message.success('✅ Thêm khóa học thành công!');
      
      // Hỏi người dùng có muốn thêm tiếp không
      setTimeout(() => {
        form.resetFields();
        setDescription('');
        message.info('📝 Bạn có thể tiếp tục thêm khóa học mới');
      }, 500);
      
      // Chuyển hướng về danh sách sau 1.5 giây
      setTimeout(() => {
        navigate('/courses/list');
      }, 1500);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('❌ Vui lòng kiểm tra lại thông tin đã nhập');
    } finally {
      setLoading(false);
    }
  };

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
            <BookOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Thêm khóa học mới</span>
          </Space>
        }
      >
        <Alert
          message="Hướng dẫn"
          description="Vui lòng điền đầy đủ thông tin bên dưới. Tên khóa học không được trùng với khóa học đã có."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            studentCount: 0,
            status: CourseStatus.OPEN,
            instructor: INSTRUCTORS[0],
          }}
        >
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
                tooltip="Tên khóa học không được trùng với khóa học khác"
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
                  placeholder="Chọn giảng viên phụ trách"
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
                  { type: 'number', max: 9999, message: 'Số lượng học viên không được vượt quá 9999' },
                ]}
              >
                <InputNumber 
                  min={0} 
                  max={9999}
                  style={{ width: '100%' }} 
                  size="large"
                  placeholder="Nhập số lượng học viên"
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
                tooltip="Có thể định dạng nội dung bằng HTML"
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
                Lưu khóa học
              </Button>
              <Button 
                onClick={() => {
                  form.resetFields();
                  setDescription('');
                  message.info('Đã reset form');
                }}
                size="large"
              >
                Reset form
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

export default CourseAddPage;