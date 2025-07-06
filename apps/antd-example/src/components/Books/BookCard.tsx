import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Image, Space, Tooltip } from "antd";
import "./BookCard.css";
import { Book } from "../../context/GlobalContext";

const BookCard = ({
  book,
  addToCart,
}: {
  book: Book;
  addToCart: () => void;
}) => {
  return (
    <Card
      key={book.id}
      className="book-card"
      title={
        <Tooltip title={`${book.title} by ${book.author}`}>
          <div className="book-title" title={`${book.title} by ${book.author}`}>
            {book.title}
          </div>
          {/* 作者 换行*/}
          <div
            style={{
              fontSize: "12px",
              color: "#999",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            title={book.author}
          >
            {book.author}
          </div>
        </Tooltip>
      }
      cover={
        <div style={{ padding: "16px" }}>
          <Image
            height={200}
            src={book.cover}
            style={{
              borderRadius: "8px",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            preview={false}
          />
        </div>
      }
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "none",
        borderRadius: "12px",
        padding: "16px",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxWidth: "400px",
        transition: "all 0.3s ease",
        background: "#ffffff",
        cursor: "pointer",
      }}
      actions={[
        <Space
          key="price-buy"
          className="card-footer"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "12px 0",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            margin: "0 -16px -16px -16px",
          }}
        >
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#ffffff",
              marginRight: "12px",
            }}
          >
            ${book.price}
          </span>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={addToCart}
            className="buy-button"
            style={{
              borderRadius: "6px",
              padding: "0 20px",
              height: "36px",
              fontSize: "0.9rem",
              background: "#1890ff",
              border: "none",
              boxShadow: "0 2px 8px rgba(24,144,255,0.2)",
              transition: "all 0.3s ease",
            }}
          >
            Buy Now
          </Button>
        </Space>,
      ]}
    />
  );
};
export default BookCard;
