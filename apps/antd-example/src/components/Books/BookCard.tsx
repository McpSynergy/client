import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, Image, Space } from "antd";

const BookCard = ({
  book,
  addToCart,
}: {
  book: {
    title: string;
    author: string;
    cover: string;
    price: number;
  };
  addToCart: (book: {
    title: string;
    author: string;
    cover: string;
    price: number;
  }) => void;
}) => {
  return (
    <Card
      key={book?.title + book?.author}
      title={
        <div
          style={{ whiteSpace: "pre-wrap" }}
        >{`${book?.title} by ${book?.author}`}</div>
      }
      cover={
        <Image
          height={300}
          // width={100}
          src={book.cover}
        />
      }
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #eee",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxWidth: "400px",
      }}
      actions={[
        <Space key="price-buy">
          <span
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            ${book.price}
          </span>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              addToCart(book);
            }}
          >
            Buy
          </Button>
        </Space>,
      ]}
    />
  );
};

export default BookCard;
