import React, { useContext, Fragment, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { AmplifyS3Image } from "@aws-amplify/ui-react";
import { centesToDollar, dollarToCents } from "../utils/index";

import { updateProduct, deleteProduct } from "../graphql/mutations";
import UserContext from "../UserContext";
import PayButton from "../components/PayButton";
import "./Product.css";

const Product = ({ product, user }) => {
  const [formData, setFormdata] = useState({
    description: product.description,
    price: centesToDollar(product.price),
    shipped: product.shipped,
  });
  const { description, price, shipped } = formData;
  const value = useContext(UserContext);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const input = {
      id: product.id,
      description,
      price: dollarToCents(price),
      shipped,
    };
    try {
      const res = await API.graphql(graphqlOperation(updateProduct, { input }));
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    const input = {
      id: product.id,
    };
    try {
      await API.graphql(graphqlOperation(deleteProduct, { input }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="card card-body d-flex flex-column align-items-center m-3"
      style={{ maxWidth: "15rem" }}
    >
      <AmplifyS3Image imgKey={product.file.key} className="s3img" />
      <h3>{product.description}</h3>
      <p className="mb-1">
        {product.shipped ? "Shipping Delivery" : "Email Delivery"}
      </p>
      <p className="mb-1">${centesToDollar(product.price)}</p>
      {value.user.attributes.sub !== product.owner && (
        <PayButton product={product} user={user} />
      )}
      {value.user.attributes.sub === product.owner && (
        <Fragment>
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            data-toggle="modal"
            data-target={`#updateModal-${product.id}`}
          >
            Update
          </button>
          <div
            className="modal fade"
            id={`updateModal-${product.id}`}
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    Update Product
                  </h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form
                    onSubmit={(evt) => {
                      evt.preventDefault();
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="description">
                        Set product description
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="description"
                        onChange={handleChange}
                        name="description"
                        value={description}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="price">Set product price</label>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        onChange={handleChange}
                        name="price"
                        value={price}
                      />
                    </div>
                    <p className="mb-0">
                      Is the product shipped or emailed to the customer
                    </p>
                    <div className="form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="deliveryMethod2"
                        id="exampleRadios3"
                        value="shipped"
                        checked={shipped}
                        onChange={() =>
                          setFormdata((prev) => ({ ...prev, shipped: true }))
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios3"
                      >
                        Shipped
                      </label>
                    </div>
                    <div className="form-check-inline mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="deliveryMethod2"
                        id="exampleRadios4"
                        value="emailed"
                        checked={!shipped}
                        onChange={() =>
                          setFormdata((prev) => ({ ...prev, shipped: false }))
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios4"
                      >
                        Emailed
                      </label>
                    </div>
                    <div className="">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        disabled={!(description && price)}
                        type="button"
                        data-dismiss="modal"
                        className="btn btn-primary ml-2"
                        onClick={handleSubmit}
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="btn btn-outline-danger btn-sm"
          >
            Delete
          </button>
        </Fragment>
      )}
    </div>
  );
};

export default Product;
