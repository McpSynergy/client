import { Avatar, Button, Flex, Layout } from "antd";
import React, { useEffect, useState } from "react";
import Chat from "./components/Chat";
// import UserProfile from './components/UserProfile';
// import { ChatComponent } from "@mcp-synergy/react";
import UserProfile from "./components/UserProfile";
import { motion } from "framer-motion";
import { Header } from "antd/es/layout/layout";
import { UserOutlined } from "@ant-design/icons";
import Books from "./components/Books";
import Cart from "./components/Cart";

const { Content } = Layout;

const App: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [viewType, setViewType] = useState<"profile" | "books" | "cart">(
    "books"
  );
  const [cart, setCart] = useState<
    {
      id: string;
      title: string;
      author: string;
      cover: string;
      price: number;
      count: number;
    }[]
  >([]);
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
  }, []);

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      setCart(JSON.parse(cart));
    }
  }, []);

  const addToCart = (book: {
    title: string;
    author: string;
    cover: string;
    price: number;
  }) => {
    const id = book.title + book.author;
    const index = cart.findIndex((item) => item.id === id);
    if (index === -1) {
      setCart([...cart, { ...book, id, count: 1 }]);
      localStorage.setItem(
        "cart",
        JSON.stringify([...cart, { ...book, id, count: 1 }])
      );
    } else {
      const newCart = [...cart];
      newCart[index].count += 1;
      localStorage.setItem("cart", JSON.stringify(newCart));
      setCart(newCart);
    }
  };
  return (
    <Layout
      style={{
        height: "100%",
        color: "white",
      }}
    >
      <Header
        style={{
          // 莫兰迪色
          backgroundColor: "#009688",
          // 底部阴影
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          color: "white",
        }}
      >
        <Flex justify="space-between" align="center">
          <h1>MCP'R</h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <span>Hi</span>
            <Avatar
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
              icon={<UserOutlined />}
              style={{ marginRight: 8 }}
            />
            <span>John Doe, welcome use. </span>
            {viewType !== "cart" && (
              <u
                style={{
                  cursor: "pointer",
                  color: "black",
                  fontWeight: "bold",
                  userSelect: "none",
                }}
                onClick={() => {
                  setViewType(viewType === "profile" ? "books" : "profile");
                }}
              >
                {viewType === "profile" ? "View books" : "View profile"}
              </u>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>Click use 👉</span>
            <Button
              type="primary"
              icon={
                <img src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" />
              }
              style={{ marginLeft: 8 }}
              shape="circle"
              onClick={() => {
                setShowChat(!showChat);
              }}
            ></Button>
          </div>
        </Flex>
      </Header>
      <Content>
        <Flex
          style={{
            width: "100%",
            height: "100%",
          }}
          gap={0}
        >
          <div
            style={{
              minHeight: 380,
              flex: 1,
              width: "100%",
            }}
          >
            {viewType === "cart" && (
              <Cart
                books={cart}
                handleGoBack={() => {
                  setViewType("books");
                }}
                onRemove={(id) => {
                  const newCart = cart.filter((item) => item.id !== id);
                  setCart(newCart);
                  localStorage.setItem("cart", JSON.stringify(newCart));
                }}
              />
            )}
            {viewType === "books" && (
              <Books
                count={cart.reduce((c, o) => {
                  return c + o.count;
                }, 0)}
                addToCart={addToCart}
                onViewCart={() => {
                  setViewType("cart");
                }}
              />
            )}
            {viewType === "profile" && (
              <UserProfile
                user={{
                  company: "Example Corp",
                  name: "John Doe",
                  title: "Senior Developer",
                  avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
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
                }}
              />
            )}
          </div>
          {isMounted && (
            <motion.div
              initial={{
                opacity: 0,
                width: 0,
              }}
              animate={{
                opacity: showChat ? 1 : 0,
                width: showChat ? 500 : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <Chat />
            </motion.div>
          )}
        </Flex>
      </Content>
    </Layout>
  );
};

export default App;
