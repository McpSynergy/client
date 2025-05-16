import Search from "antd/es/input/Search";
import { Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useState } from "react";
import BookCard from "./BookCard";
import styled from "styled-components";

const ScrollableContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #111111;
  }

  &::-webkit-scrollbar-thumb {
    background: #333333;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #444444;
  }
`;

const Container = styled.div`
  height: calc(100vh - 64px - 48px);
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const SearchWrapper = styled.div`
  width: 100%;
  padding: 16px 24px;
  background-color: #111111;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #222222;

  .ant-input-affix-wrapper {
    background-color: #1a1a1a !important;
    border-color: #222222 !important;
    color: #ffffff !important;

    &:hover {
      border-color: #0070f3 !important;
    }

    &:focus {
      border-color: #0070f3 !important;
    }

    .ant-input {
      background-color: #1a1a1a !important;
      color: #ffffff !important;

      &::placeholder {
        color: #666666 !important;
      }
    }
  }

  .ant-btn {
    background-color: hsla(0, 0%, 93%, 1) !important;
    border-color: hsla(0, 0%, 93%, 1) !important;
    color: #000000 !important;

    &:hover {
      background-color: hsla(0, 0%, 85%, 1) !important;
      border-color: hsla(0, 0%, 85%, 1) !important;
    }

    &:active {
      background-color: hsla(0, 0%, 80%, 1) !important;
      border-color: hsla(0, 0%, 80%, 1) !important;
    }
  }
`;

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
      book.author.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Container>
      <SearchWrapper>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <Search
            placeholder="搜索书籍..."
            onSearch={(value) => setSearchTerm(value)}
            style={{ width: "calc(100% - 100px)" }}
            size="large"
          />
          <Badge
            count={count}
            style={{
              backgroundColor: "hsla(0, 0%, 93%, 1)",
              color: "#000000",
              cursor: "pointer",
            }}
            onClick={onViewCart}
          >
            <ShoppingCartOutlined
              style={{
                fontSize: "24px",
                color: "#FFFFFF",
              }}
            />
          </Badge>
        </div>
      </SearchWrapper>
      <ScrollableContainer>
        {filteredBooks.map((book) => (
          <BookCard
            key={book.title + book.author}
            book={book}
            addToCart={addToCart}
          />
        ))}
      </ScrollableContainer>
    </Container>
  );
};
export default Books;
