import { useState } from "react";
import "./searchProduct.css";
import { useDispatch, useSelector } from "react-redux";
import { setSearchProduct } from "../../store/reducers/home.reducer";

const SearchProducts = () => {
  // State to store the current search input
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const products = useSelector((store) => store.home.products);

  //  Handle search input and filter products based on title match
  const handleSearchText = (e) => {
    setSearchText(e.target.value);
    const searchProduct = products.filter((product) =>
      product.title.toLowerCase().includes(searchText.toLowerCase())
    );
    dispatch(setSearchProduct(searchProduct));
  };

  // Clear search input and reset search results
  const handleCross = () => {
    setSearchText("");
    dispatch(setSearchProduct([]));
  };
  return (
    <>
      <div id="search-input">
        {/* Search Input */}
        <input
          type="search"
          placeholder="Search By Name"
          value={searchText}
          onInput={handleSearchText}
        />
        {/* Clear button shown only when input is not empty */}
        {searchText && <i class="fa-solid fa-xmark" onClick={handleCross}></i>}
      </div>
    </>
  );
};

export default SearchProducts;
