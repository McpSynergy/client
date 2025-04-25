import { Card, Avatar, Tag, Row, Col, Button, List } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
} from "@ant-design/icons";

interface Skill {
  name: string;
  color?: string;
}

interface Stats {
  projects: number;
  followers: number;
  following: number;
}

export interface User {
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone?: string;
  skills: Skill[];
  stats: Stats;
}

export interface UserProfileProps {
  user: User;
}
const UserProfile = ({ user }: { user: User }) => {
  // 用户统计数据展示
  const statsData = [
    { title: "Projects", value: user.stats.projects },
    { title: "Followers", value: user.stats.followers },
    { title: "Following", value: user.stats.following },
  ];

  return (
    <Card
      title="User Profile"
      actions={[
        <Button key="edit" icon={<EditOutlined />} onClick={() => {}}>
          Edit Profile
        </Button>,
      ]}
      style={{ maxWidth: 800, margin: "20px auto" }}
    >
      <Row gutter={24}>
        {/* 左侧 - 头像区域 */}
        <Col xs={24} sm={8} style={{ textAlign: "center" }}>
          <Avatar
            size={128}
            src={user.avatar}
            icon={<UserOutlined />}
            style={{ marginBottom: 16 }}
          />
          <h3>{user.name}</h3>
          <p style={{ color: "#666" }}>{user.title}</p>

          <Button
            type="primary"
            shape="round"
            icon={<MailOutlined />}
            style={{ marginTop: 16 }}
            onClick={() => {}}
          >
            Contact
          </Button>
        </Col>

        {/* 右侧 - 详细信息 */}
        <Col xs={24} sm={16}>
          <List
            itemLayout="horizontal"
            dataSource={statsData}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.value} description={item.title} />
              </List.Item>
            )}
            style={{ marginBottom: 24 }}
          />

          <div style={{ marginBottom: 16 }}>
            <h4>Contact Information</h4>
            <p>
              <MailOutlined style={{ marginRight: 8 }} />
              {user.email}
            </p>
            <p>
              <PhoneOutlined style={{ marginRight: 8 }} />
              {user.phone || "Not provided"}
            </p>
          </div>

          <div>
            <h4>Skills</h4>
            {user.skills.map((skill, index) => (
              <Tag
                key={index}
                color={skill.color || "blue"}
                style={{ marginBottom: 8 }}
              >
                {skill.name}
              </Tag>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

// 默认 props 配置
UserProfile.defaultProps = {
  user: {
    name: "John Doe",
    title: "Senior Developer",
    avatar: "https://example.com/avatar.jpg",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    skills: [
      { name: "JavaScript", color: "gold" },
      { name: "React", color: "cyan" },
      { name: "Node.js", color: "green" },
    ],
    stats: {
      projects: 24,
      followers: 1489,
      following: 583,
    },
    onEdit: () => console.log("Edit clicked"),
    onContact: () => console.log("Contact clicked"),
  },
};

export default UserProfile;
