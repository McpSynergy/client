import { Avatar, Button, Flex, Layout, ConfigProvider, theme } from "antd";
import React, { useEffect, useState } from "react";
import Chat from "./components/Chat";
import UserProfile from "./components/UserProfile";
import { motion } from "framer-motion";
import { Header } from "antd/es/layout/layout";
import { UserOutlined } from "@ant-design/icons";
import Books from "./components/Books";
import Cart from "./components/Cart";

const { Content } = Layout;
const { darkAlgorithm } = theme;

const App: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [viewType, setViewType] = useState<"profile" | "books" | "cart">(
    "books",
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
        JSON.stringify([...cart, { ...book, id, count: 1 }]),
      );
    } else {
      const newCart = [...cart];
      newCart[index].count += 1;
      localStorage.setItem("cart", JSON.stringify(newCart));
      setCart(newCart);
    }
  };
  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        token: {
          colorBgContainer: "#000000",
          colorBgElevated: "#111111",
          colorText: "#FFFFFF",
          colorTextSecondary: "#888888",
          colorBorder: "#222222",
          colorPrimary: "hsla(0, 0%, 93%, 1)",
          borderRadius: 8,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        components: {
          Input: {
            colorBgContainer: "#111111",
            colorBorder: "#222222",
            colorText: "#FFFFFF",
            colorTextPlaceholder: "#666666",
            activeBorderColor: "#0070F3",
            hoverBorderColor: "#0070F3",
          },
          Button: {
            colorPrimary: "hsla(0, 0%, 93%, 1)",
            colorPrimaryHover: "hsla(0, 0%, 85%, 1)",
            colorPrimaryActive: "hsla(0, 0%, 80%, 1)",
            colorTextLightSolid: "#000000",
            colorBgContainer: "hsla(0, 0%, 93%, 1)",
            colorBorder: "hsla(0, 0%, 93%, 1)",
            colorText: "#000000",
            colorBgTextHover: "hsla(0, 0%, 85%, 1)",
            colorBgTextActive: "hsla(0, 0%, 80%, 1)",
          },
        },
      }}
    >
      <Layout
        style={{
          height: "100%",
          color: "#FFFFFF",
          background: "#000000",
        }}
      >
        <Header
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 1px 0 rgba(255, 255, 255, 0.1)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <Flex justify="space-between" align="center">
            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              MCP <cite>Render</cite>
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <span style={{ color: "#888888" }}>Hi</span>
              <Avatar
                src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
                icon={<UserOutlined />}
                style={{
                  marginRight: 8,
                  background: "#87d068",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                }}
              />
              <span style={{ color: "#FFFFFF" }}>John Doe, Welcome use. </span>
              {viewType !== "cart" && (
                <u
                  style={{
                    cursor: "pointer",
                    color: "#0070F3",
                    fontWeight: 600,
                    userSelect: "none",
                    textDecoration: "none",
                    borderBottom: "1px solid #0070F3",
                    transition: "all 0.2s ease",
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
                gap: "12px",
              }}
            >
              {/* <span style={{ color: "#888888" }}>Click use 👉</span> */}
              <Button
                type="primary"
                icon={
                  <img src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" />
                }
                style={{
                  marginLeft: 8,
                  background: "#fde3cf",
                  borderColor: "#0070F3",
                  boxShadow: "0 2px 8px rgba(0, 112, 243, 0.3)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                shape="circle"
                onClick={() => {
                  setShowChat(!showChat);
                }}
              ></Button>
            </div>
          </Flex>
        </Header>
        <Content
          style={{
            background: "#000000",
            padding: "24px",
          }}
        >
          <Flex
            style={{
              width: "100%",
              height: "100%",
            }}
            gap={24}
          >
            <div
              style={{
                minHeight: 380,
                flex: 1,
                width: "100%",
                background: "#111111",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
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
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  background: "#111111",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Chat />
              </motion.div>
            )}
          </Flex>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
