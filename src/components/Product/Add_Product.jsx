import { useContext, useEffect, useState } from "react";
import "./addProduct.css";
import { toast } from "react-toastify";
import { createProduct, updateProduct } from "../../store/reducers/home.reducer";
import { useDispatch } from "react-redux";
import { UserContext } from "../../context";
import { useNavigate } from "react-router-dom";

const Add_Product = ({ product, hideUpdateForm, fetchAdminProduct }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const { userId, setUserId } = useContext(UserContext);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleCategory = (e) => {
    setCategory(e.target.value);
  };

  const handleTitle = (e) => {
    setTitle(e.target.value);
  };
  const handleDesc = (e) => {
    setDesc(e.target.value);
  };
  const handlePrice = (e) => {
    setPrice(e.target.value);
  };
  const handleStock = (e) => {
    setStock(e.target.value);
  };

  const reset = () => {
    setTitle("");
    setDesc("");
    setPrice("");
    setCategory("");
  };

  const handleAddProduct = () => {
    const image =
      "https://www.bogentandler.at/cache/images/d/dummypng.image.800x800.jpg";
    if (!title || !desc || !price || !category || !stock) {
      toast.error("Please fill all the fields.");
      return;
    }

    const obj = {
      title:title.trim(),
      adminId: userId,
      description: desc.trim(),
      stock,
      price,
      category,
      image,
    };
    dispatch(createProduct(obj));
    toast.success("Product Added Successfully!");
    reset();
  };

  const handleUpdate = () => {
    if (!title || !desc || !price || !category || !stock)  {
      toast.error("Please fill all the fields.");
      return;
    }
    const obj = {
      title:title.trim(),
      description: desc.trim(),
      stock,
      price,
      category,
    };
    dispatch(
      updateProduct({
        id: product.id, // product doc id
        changes: obj,
      })
    );
    reset();
    toast.success("Product Updated Successfully!");
    if(fetchAdminProduct){
      fetchAdminProduct();
    }else{
      navigate("/")
    }
    hideUpdateForm();
  };

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDesc(product.description);
      setPrice(product.price);
      setCategory(product.category);
      setStock(product.stock);
    }
  }, []);

  return (
    <div className="add_product-container">
      {product && <span onClick={hideUpdateForm}>X</span>}
      <h1>{product ? "Update a Product" : "Add a Product"}</h1>
      <input
        type="text"
        placeholder="Title..."
        value={title}
        onChange={handleTitle}
      />
      <input
        type="text"
        placeholder="Description..."
        value={desc}
        onChange={handleDesc}
      />
      <input
        type="number"
        placeholder="Price..."
        value={price}
        onChange={handlePrice}
      />
      <input
        type="number"
        placeholder="Stock..."
        value={stock}
        onChange={handleStock}
      />
      <select name="" value={category} onChange={handleCategory}>
        <option value="">Select Category</option>
        <option value="men's clothing">Men's Clothing</option>
        <option value="women's clothing">Woman's Clothing</option>
        <option value="jewelery">Jewellery</option>
        <option value="electronics">Electronics</option>
      </select>
      {product ? (
        <button onClick={handleUpdate}>Update Product</button>
      ) : (
        <button onClick={handleAddProduct}>Add Product</button>
      )}
    </div>
  );
};

export default Add_Product;
