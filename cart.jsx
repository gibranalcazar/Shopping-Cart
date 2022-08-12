////////////////////////////////////////////////////////////////////
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          /* console.log(result.data); */
          
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
////////////////////////////////////////////////////////////////////
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
////////////////////////////////////////////////////////////////////
const Products = () =>{
  const [items, setItems] = React.useState([]); 
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("products");
  //const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
/*   console.log(`Rendering Products ${JSON.stringify(data.data[0])}`);
  console.log(data.data);
  console.log(items); */
  
  useEffect(()=> {
    /* console.log(data.data); */
    setItems(data.data);
  }, [data.data]);

  const addToCart = (e) => {
    let prodName = e.target.name;
    console.log(items[0].attributes.name);
    let item = items.filter((objeto) => objeto.attributes.name == prodName);
    console.log(item[0].attributes.instock);
    if(item[0].attributes.instock ==0)return;
    item[0].attributes.instock = item[0].attributes.instock -1;
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    console.log(cart);
  };

  const deleteCartItem = (delIndex) => {
    console.log("in delete cart items");
    // this is the index in the cart not in the Product List
    let newCart = cart.filter((item, i) => delIndex != i);
    let target = cart.filter((item, index) => delIndex == index);
    let newItems = items.map((item, index) => {
      if (item.attributes.name == target[0].attributes.name) item.attributes.instock = item.attributes.instock + 1;
      return item;
    });
    setCart(newCart);
    setItems(newItems);
  };

  let list = data.data.map((item, index) => {
    let n = index + 1049;
    let uhit = "https://picsum.photos/" + n; //Random image = "uhit" instead of "image"
    //console.log(item.attributes.image);
    let image = item.attributes.image;
    return (
      <li key={index}>
        <Image src={image} width={100} roundedCircle></Image> 
        <div>
          <Button variant="primary" size="large">
          {item.attributes.name}:${item.attributes.cost} Stock={item.attributes.instock}
          </Button>
        </div>
        <div>
          <input name={item.attributes.name} type="submit" value="Add to cart" onClick={addToCart}></input>
        </div>
      </li>
    );
  });

  let cartList = cart.map((item, index) => {
    console.log(cart);
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.attributes.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          /* onClick={() => deleteCartItem(index)} */
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.attributes.cost} from {item.attributes.country}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="erase" onClick={() => deleteCartItem(index)}>[x]</span>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = calculateTotal();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.attributes.name}
        </div>
      );
    });
    return { final, total };
  };

  const calculateTotal = () => {
    console.log(cart);
    let costs = cart.map((item) => item.attributes.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    //cart.map((item, index) => deleteCartItem(index));
    return newTotal;
  };
  const checkOut = () => {
    console.log(cart);
    setCart([]);
  };

  const restockProducts = (url) => {
    console.log(url);
    doFetch(url);
    /* let newItems = data.data.map((item) => {
      let { name, country, cost, instock } = item;
      console.log("In restock products");
      return { name, country, cost, instock };
    }); */
    setItems([...items, ...newItems]);
  };

  return(
    <Container>
      <Row>
        <Col>
        <div className="center">
          <h1>Products</h1>
          <ul style={{ listStyleType: "none", paddingInlineStart: "0px"}}>{list}</ul>
        </div>
        </Col>
        <Col>
        <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
}

ReactDOM.render(<Products />, document.getElementById("root"));