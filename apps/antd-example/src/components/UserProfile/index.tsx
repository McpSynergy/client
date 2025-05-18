import {
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Col, List, Row, Tag } from "antd";

/**
 * @mcp-comp UserProfile
 * @mcp-prop-path user.skills
 */
interface Skill {
  name: string;
  color?: string;
}

/**
 * @mcp-comp UserProfile
 * @mcp-prop-path user.stats
 */
interface Stats {
  projects: number;
  followers: number;
  following: number;
}

/**
 * @mcp-comp UserProfile
 * @mcp-prop-path user
 */
export interface User {
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone?: string;
  skills: Skill[];
  stats: Stats;
  company: string;
}

/**
 * @mcp-comp UserProfile
 * @mcp-description Show user profile
 * @mcp-server-name mcp-component-render
 */
export interface UserProfileProps {
  user: User;
}

const UserProfile = ({
  user = {
    stats: {
      projects: 0,
      followers: 0,
      following: 0,
    },
    skills: [],
    avatar: "",
    email: "",
    phone: "",
    name: "",
    title: "",
    company: "",
  },
  onGoBack,
}: UserProfileProps & { onGoBack?: () => void }) => {
  // 用户统计数据展示
  const statsData = [
    { title: "Projects", value: user.stats.projects },
    { title: "Followers", value: user.stats.followers },
    { title: "Following", value: user.stats.following },
  ];

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {onGoBack && (
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={onGoBack}
                style={{
                  color: "#0070F3",
                  padding: "4px 8px",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Go Back
              </Button>
            )}
            <span>{user.name}'s Profile</span>
          </div>
        }
        actions={[
          <Button key="edit" icon={<EditOutlined />} onClick={() => {}}>
            Edit Profile
          </Button>,
        ]}
        style={{
          maxWidth: 800,
          margin: "20px auto",
          background: "#111111",
          border: "1px solid #222222",
        }}
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
              <p>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                {user.company || "Not provided"}
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
    </div>
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
