import React from "react";
import { List, Button, Image, Typography, Space, Card } from "antd";
import { ShoppingCartOutlined, StarOutlined } from "@ant-design/icons";
import { useGlobalContext } from "../../context/GlobalContext";

const { Text, Title } = Typography;

/**
 * @mcp-comp RecommendBook
 * @mcp-prop-path recommendedBooks
 */
export interface IncludeBook {
  id: string;
  /**
   * @mcp-input-optional book title
   */
  title: string;
  /**
   * @mcp-input-optional book author
   */
  author: string;
  cover: string;
  price: number;
}
/**
 * @mcp-comp RecommendBook
 * @mcp-description recommend book for user
 * @mcp-server-name mcp-component-render
 */
interface RecommendListProps {
  recommendedBooks: IncludeBook[];
}

const RecommendList: React.FC<RecommendListProps> = ({ recommendedBooks }) => {
  const { addToCart } = useGlobalContext();

  const handleAddToCart = (book: IncludeBook) => {
    addToCart(book);
  };

  return (
    <Card
      title={
        <Space>
          <StarOutlined style={{ color: "#faad14" }} />
          <Title level={4} style={{ margin: 0 }}>
            Recommend Books
          </Title>
        </Space>
      }
      size="small"
      style={{
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: 8,
      }}
    >
      <List
        size="small"
        dataSource={recommendedBooks}
        renderItem={(book) => (
          <List.Item
            style={{
              padding: "8px 0",
              border: "none",
            }}
            actions={[
              <Button
                key="add"
                type="text"
                size="small"
                icon={<ShoppingCartOutlined />}
                onClick={() => handleAddToCart(book)}
                style={{
                  color: "#1890ff",
                  fontSize: "12px",
                  padding: "4px 8px",
                  height: "auto",
                }}
              >
                ${book.price}
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Image
                  width={60}
                  height={80}
                  src={book.cover}
                  alt={book.title}
                  style={{
                    borderRadius: 4,
                    objectFit: "cover",
                  }}
                  preview={false}
                />
              }
              title={<Text strong>{book.title}</Text>}
              description={
                <Text
                  type="secondary"
                  style={{
                    fontSize: "11px",
                    lineHeight: "14px",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {book.author}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecommendList;
