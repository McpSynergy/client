import Search from "antd/es/input/Search";
import { Card, Space, Image, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import React, { useState } from "react";

const Books = ({
  count,
  addToCart,
  onViewCart,
}: {
  count: number;
  addToCart: (book: {
    title: string;
    author: string;
    cover: string;
    price: number;
  }) => void;
  onViewCart: VoidFunction;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const books = [
    {
      title: "Computing and Technology Ethics",
      author: "Emanuelle Burton, Judy Goldsmith, Nicholas Mattei",
      cover:
        "\thttps://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 45.99,
    },
    {
      title:
        "More than a Glitch: Confronting Race, Gender, and Ability Bias in Tech",
      author: "Meredith Broussard",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0262547260.01.L.jpg",
      price: 29.99,
    },
    {
      title: "Working with AI: Real Stories of Human-Machine Collaboration",
      author: "Thomas H. Davenport & Steven M. Miller",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0262047519.01.L.jpg",
      price: 32.99,
    },
    {
      title:
        "Quantum Supremacy: How the Quantum Computer Revolution Will Change Everything",
      author: "Michio Kaku",
      cover:
        "https://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 28.99,
    },
    {
      title: "Business Success with Open Source",
      author: "VM (Vicky) Brasseur",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1680509551.01.L.jpg",
      price: 39.99,
    },
    {
      title: "The Internet Con: How to Seize the Means of Computation",
      author: "Cory Doctorow",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1804291277.01.L.jpg",
      price: 24.99,
    },
    {
      title:
        "How Infrastructure Works: Inside the Systems That Shape Our World",
      author: "Deb Chachra",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0593086430.01.L.jpg",
      price: 27.99,
    },
    {
      title: "Extremely Online: The Untold Story of Fame, Influence, and Power",
      author: "Taylor Lorenz",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1982146745.01.L.jpg",
      price: 26.99,
    },
    {
      title: "The Apple II Age: How the Computer Became Personal",
      author: "Laine Nooney",
      cover:
        "https://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 35.99,
    },
    {
      title:
        "Fancy Bear Goes Phishing: The Dark History of the Information Age",
      author: "Scott J. Shapiro",
      cover:
        "https://i.pinimg.com/736x/5b/0d/80/5b0d809c4c6a3cfb5f6f87562f98bf16.jpg",
      price: 29.99,
    },
  ];
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        overflowY: "auto",
      }}
    >
      <Space
        direction="vertical"
        size={24}
        style={{ width: "100%", padding: "16px 24px 0" }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search
            placeholder="Enter search term"
            onSearch={(value) => setSearchTerm(value)}
            style={{ width: "calc(100% - 100px)" }}
            size="large"
          />
          <Badge
            count={count}
            // 蓝色
            style={{ backgroundColor: "#1890ff" }}
            onClick={onViewCart}
          >
            <ShoppingCartOutlined style={{ fontSize: "24px" }} />
          </Badge>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            overflowY: "auto",
            flex: 1,
            width: "100%",
            padding: "0 24px 24px",
          }}
        >
          {filteredBooks.map((book, index) => (
            <Card
              key={index}
              title={
                <div
                  style={{ whiteSpace: "pre-wrap" }}
                >{`${book.title} by ${book.author}`}</div>
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
          ))}
        </div>
      </Space>
    </div>
  );
};
export default Books;
