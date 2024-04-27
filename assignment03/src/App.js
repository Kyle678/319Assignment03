import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {

  const [viewer, setViewer] = useState(0);

  const getProducts = async () => {
    let response = await fetch("http://localhost:8081/listProducts");
    let data = await response.json();
    return data;
  }

  const getProductById = async (product_id) => {
    let response = await fetch("http://localhost:8081/getProduct/" + product_id);
    let data = await response.json();
    return data;
  }

  const editProduct = async (product_id, new_price) => {
    const new_data = {
      "price": new_price
    }
    const requestOptions = {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(new_data)
    }
    await fetch("http://localhost:8081/editProduct/"+product_id, requestOptions);
  }

  const deleteProduct = async(product_id) => {
    const requestOptions = {
      method: "DELETE"
    };
    await fetch("http://localhost:8081/deleteProduct/"+product_id, requestOptions);
  }

  const addProduct = async(new_product) => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(new_product)
    }

    await fetch("http://localhost:8081/addProduct", requestOptions);
  }

  const numToPrice = (num) => {
    return "$"+Number(num).toFixed(2);
  }

  const getCardForProduct = (el) => {
    let card = (
      <Card style={{ width: "20rem", height: "100%", backgroundColor: "#505050", color: "#000000" }}>
        <Card.Img className="card-img-top" src={el.image} alt="Card image cap" style={{ scale: "85%", minHeight: "250px", maxHeight: "250px", width: "auto", objectFit: "contain" }} />
        <Card.Body className="d-flex flex-column card-content" style={{ height: "100%" }}>
          <Card.Title className="card-title" style={{ height: "20%" }}>{el.title}</Card.Title>
          <Card.Text className="card-text" style={{ height: "5%" }}>Product Id: {el.id}</Card.Text>
          <Card.Text className="card-text" style={{ height: "5%" }}>Price: {numToPrice(el.price)}</Card.Text>
          <Card.Text className="card-text" style={{ height: "50%" }}>Description: {el.description}</Card.Text>
          <Card.Text className="card-text" style={{ height: "10%" }}>Product Rating: {el.rating.rate}</Card.Text>
          <Card.Text className="card-text" style={{ height: "10%" }}>Rating Count: {el.rating.count}</Card.Text>
        </Card.Body>
      </Card>
    );
    return card;
  }

  function Browse(){
    const [displayProducts, setDisplayProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idInput, setIdInput] = useState("");

    useEffect(() => {
      async function fetchData(){
        let data = await getProducts();
        setDisplayProducts(data);
        setLoading(false);
      }
      fetchData();
    }, []);

    if (loading) {
      return <p>Loading...</p>;
    }
    let listItems = displayProducts.map((el) => (
      <Col key={el.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
        {(idInput==="" || el.id==idInput) && getCardForProduct(el)}
      </Col>
    ));

    const handleIdInputChange = (event) => {
      setIdInput(event.target.value);
    }

    const searchbar = (
      <div>
        <input type="search" onChange={handleIdInputChange} placeholder='Enter Product Id' />
      </div>
    );

    return(
      <div>
        {searchbar}
        <div>
          <Container>
            <Row>
              {listItems}
            </Row>
          </Container>
        </div>
      </div>
    );
  }

  function Edit() {
    const [input1, setInput1] = useState(null);
    const [priceInput, setPriceInput] = useState(null);
    const [displayCard, setDisplayCard] = useState(null);

    const handleInput1Change = (event) => {
      setInput1(event.target.value);
      console.log(event.target.value);
    }

    const handleInput1Click = async () => {
      let data = await getProductById(input1);
      let card = getCardForProduct(data);
      setDisplayCard(card);
    }

    const handlePriceInputChange = (event) => {
      setPriceInput(event.target.value);
    }

    const handlePriceChange = async () => {
      await editProduct(input1, priceInput);
      await handleInput1Click();
    }

    const priceInputBox = (
      <div>
        <input onChange={handlePriceInputChange} type="text" />
        <Button onClick={handlePriceChange}>Confirm</Button>
      </div>
    )

    return(
      <div>
        <div>
          <input onChange={handleInput1Change} type="text" />
          <Button onClick={handleInput1Click}>Click</Button>
        </div>
        <div>
          {displayCard}
        </div>
        <div>
          {displayCard!=null && priceInputBox}
        </div>
      </div>
    );
  }

  function Add(){
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data) => {
      console.log(data);
      const new_product = {
        "id": Number(data.id),
        "title": data.title,
        "price": Number(data.price),
        "description": data.description,
        "category": data.category,
        "image": data.image,
        "rating": {
                  "rate": Number(data.ratingScore),
                  "count": Number(data.ratingCount)
                  }
      }
      addProduct(new_product);
      reset();
    };

    const form = (
      <form onSubmit={handleSubmit(onSubmit)} className="container mt-5">
        <div className="form-group">
          <input {...register("id", { required: true })} placeholder="Product Id" className="form-control" />
        </div>
        <div className="form-group">
          <input {...register("title", {required: true })} placeholder="Product Title" className="form-control" />
        </div>
        <div className="form-group">
          <input {...register("price", {required: true})} placeholder="Product Price" className="form-control" />
        </div>
        <div className="form-group">
          <input {...register("description", {required: true})} placeholder="Product Description" className="form-control" />
        </div>
        <div className="form-group">
          <input {...register("category", {required: true})} placeholder="Product Category" className="form-control" />
        </div>
        <div className="form-group">
          <input {...register("image", {required: true})} placeholder="Product Image Url" className="form-control" />
        </div>
        <div className="form-group">
          <input {...register("ratingScore", {required: true})} placeholder="Product Rating" className="form-control" />
        </div>
        <div className="form-group">
          <input {...register("ratingCount", {required: true})} placeholder="# of Ratings" className="form-control" />
        </div>
        <div className="form-group" style={{ marginTop: "10px" }}>
          <button onClick={handleSubmit} style={{ width: "100%" }} type="submit" className="btn btn-primary">Add Product</button>
        </div>
      </form>
    );

    return (
      <div>
        {form}
      </div>
    );
  }

  function Delete(){
    const [idInput, setIdInput] = useState(null);
    const [displayCard, setDisplayCard] = useState(null);

    const handleIdInputChange = (event) => {
      setIdInput(event.target.value);
    }

    const handleIdInputClick = async () => {
      let data = await getProductById(idInput);
      let card = getCardForProduct(data);
      setDisplayCard(card);
    }

    const handleDeleteProduct = async () => {
      await deleteProduct(idInput);
      setDisplayCard(null);
    }

    const confirmButton = (
      <div>
        <Button onClick={handleDeleteProduct}>Delete</Button>
      </div>
    );

    return (
      <div>
        <div>
          <input onChange={handleIdInputChange} type="text" />
          <Button onClick={handleIdInputClick}>Search</Button>
        </div>
        <div>
          {displayCard}
        </div>
        <div>
          {displayCard!=null && confirmButton}
        </div>
      </div>
    );
  }

  function About(){

    return (
      <div>
        Hello
      </div>
    );
  }

  return (
    <div>
      <div class="button-area">
        <div class="button-display">
          <Button onClick={() => setViewer(0)}>Browse</Button>
          <Button onClick={() => setViewer(1)}>Edit</Button>
          <Button onClick={() => setViewer(2)}>Add</Button>
          <Button onClick={() => setViewer(3)}>Delete</Button>
          <Button onClick={() => setViewer(4)}>About Us</Button>
        </div>
      </div>
      <div>
        {viewer===0 && <Browse />}
        {viewer===1 && <Edit />}
        {viewer===2 && <Add />}
        {viewer===3 && <Delete />}
        {viewer===4 && <About />}
      </div>
    </div>
  );
}

export default App;
