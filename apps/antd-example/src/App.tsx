import { Avatar, Button, Flex, Layout, ConfigProvider, theme } from "antd";
import React, { useEffect, useState } from "react";
import Chat from "./components/Chat";
import UserProfile from "./components/UserProfile";
import { motion } from "framer-motion";
import { Header } from "antd/es/layout/layout";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Books from "./components/Books";
import Cart from "./components/Cart";
import { useMediaQuery } from "react-responsive";

const { Content } = Layout;
const { darkAlgorithm } = theme;

// 抽离主题配置
const themeConfig = {
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
};

// 抽离头部组件
const AppHeader: React.FC<{
  viewType: "profile" | "books" | "cart";
  setViewType: (type: "profile" | "books" | "cart") => void;
}> = ({ viewType, setViewType }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <Header
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 rgba(255, 255, 255, 0.1)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        padding: isMobile ? "12px 16px" : "0 24px",
      }}
    >
      <Flex justify="space-between" align="center" style={{ width: "100%" }}>
        <Flex align="center" gap={12}>
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: isMobile ? "1.2rem" : "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            MCP <cite>Render</cite>
          </h1>
        </Flex>
        <Avatar
          src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
          icon={<UserOutlined />}
          style={{
            background: "#87d068",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onClick={() => {
            setViewType("profile");
          }}
        />
      </Flex>
    </Header>
  );
};

// 定义类型
interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  price: number;
  count: number;
}

interface BookInput {
  title: string;
  author: string;
  cover: string;
  price: number;
}

// 抽离主内容区域组件
const MainContent: React.FC<{
  viewType: "profile" | "books" | "cart";
  cart: Book[];
  setCart: (cart: Book[]) => void;
  addToCart: (book: BookInput) => void;
  setViewType: (type: "profile" | "books" | "cart") => void;
}> = ({ viewType, cart, setCart, addToCart, setViewType }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div
      style={{
        minHeight: 380,
        flex: 1,
        width: "100%",
        background: "#111111",
        borderRadius: "12px",
        padding: isMobile ? "16px" : "24px",
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
          onGoBack={() => setViewType("books")}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [viewType, setViewType] = useState<"profile" | "books" | "cart">(
    "books",
  );
  const [cart, setCart] = useState<Book[]>([]);
  const isMounted = React.useRef(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

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

  const addToCart = (book: BookInput) => {
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
    <ConfigProvider theme={themeConfig}>
      <Layout
        style={{
          height: "100vh",
          color: "#FFFFFF",
          background: "rgb(0, 0, 0)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <AppHeader viewType={viewType} setViewType={setViewType} />
        <Content
          style={{
            background: "#000000",
            padding: isMobile ? "16px" : "24px",
            position: "relative",
            marginTop: isMobile ? "8px" : 0,
            height: "calc(100vh - 64px)",
            overflow: "auto",
          }}
        >
          <Flex
            style={{
              width: "100%",
              // minHeight: "100%",
              position: "relative",
              height: "100%",
            }}
            gap={24}
            wrap={isMobile ? "wrap" : "nowrap"}
          >
            <MainContent
              viewType={viewType}
              cart={cart}
              setCart={setCart}
              addToCart={addToCart}
              setViewType={setViewType}
            />
            {isMounted.current && (
              <motion.div
                initial={{
                  opacity: 0,
                  width: 0,
                  position: isMobile ? "fixed" : "relative",
                  top: isMobile ? 0 : "auto",
                  right: isMobile ? 0 : "auto",
                  bottom: isMobile ? 0 : "auto",
                  left: isMobile ? 0 : "auto",
                  zIndex: isMobile ? 1000 : "auto",
                  height: isMobile ? "100%" : "auto",
                }}
                animate={{
                  opacity: showChat ? 1 : 0,
                  width: showChat ? (isMobile ? "100%" : 500) : 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  background: "#111111",
                  borderRadius: isMobile ? 0 : "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                {showChat && (
                  <>
                    {isMobile && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          padding: "16px",
                          background: "rgba(0, 0, 0, 0.8)",
                          backdropFilter: "blur(20px)",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          zIndex: 1,
                        }}
                      >
                        <Button
                          type="text"
                          icon={<ArrowLeftOutlined />}
                          onClick={() => setShowChat(false)}
                          style={{
                            color: "#FFFFFF",
                            fontSize: "16px",
                            padding: "4px 8px",
                          }}
                        >
                          Go Back
                        </Button>
                      </div>
                    )}
                    <div
                      style={{
                        height: "100%",
                        paddingTop: isMobile ? "56px" : 0,
                      }}
                    >
                      <Chat />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </Flex>
        </Content>
        {!(isMobile && showChat) && (
          <Button
            type="primary"
            icon={
              <img src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" />
            }
            style={{
              position: "fixed",
              bottom: "100px",
              right: "24px",
              width: "48px",
              height: "48px",
              background: "#fde3cf",
              borderColor: "#0070F3",
              boxShadow: "0 2px 8px rgba(0, 112, 243, 0.3)",
              transition: "all 0.2s ease",
              cursor: "pointer",
              zIndex: 1000,
            }}
            shape="circle"
            onClick={() => {
              setShowChat(!showChat);
            }}
          />
        )}
      </Layout>
    </ConfigProvider>
  );
};

export default App;
