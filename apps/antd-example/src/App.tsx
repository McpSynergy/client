import { Flex, Layout } from 'antd';
import React from 'react';
import Chat from './components/Chat';
// import UserProfile from './components/UserProfile';
import { ChatComponent } from '@mcp-synergy/react';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout
      style={{
        height: '100%',
        // backgroundColor: " #121212",
        color: 'white',
      }}
    >
      <Content>
        <Flex
          style={{
            width: '100%',
            height: '100%',
          }}
          gap={16}
        >
          <div
            style={{
              padding: 24,
              minHeight: 380,
              // background: colorBgContainer,
              flex: 1,
              // backgroundColor: " #121212",
              // borderRadius: borderRadiusLG,
            }}
          >
            <ChatComponent
              name='UserProfile'
              props={{
                user: {
                  name: 'John Do123123e',
                  title: 'Senior Developer',
                  avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
                  email: 'john.doe@example.com',
                  phone: '+1 234 567 890',
                  skills: [
                    { name: 'JavaScript', color: 'gold' },
                    { name: 'React', color: 'cyan' },
                    { name: 'Node.js', color: 'green' },
                  ],
                  stats: {
                    projects: 24,
                    followers: 1489,
                    following: 583,
                  },
                },
              }}
            />
            {/* <UserProfile
              user={{
                name: 'John Doe',
                title: 'Senior Developer',
                avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
                email: 'john.doe@example.com',
                phone: '+1 234 567 890',
                skills: [
                  { name: 'JavaScript', color: 'gold' },
                  { name: 'React', color: 'cyan' },
                  { name: 'Node.js', color: 'green' },
                ],
                stats: {
                  projects: 24,
                  followers: 1489,
                  following: 583,
                },
              }}
            /> */}
          </div>
          <div
            style={{
              width: 500,
            }}
          >
            <Chat />
          </div>
        </Flex>
      </Content>
    </Layout>
  );
};

export default App;
