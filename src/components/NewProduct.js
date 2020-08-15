import React, { useState } from "react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import awsExports from "../aws-exports";

import { createProduct } from "../graphql/mutations";
import { dollarToCents } from "../utils/index";

const INITIAL_FORM_STATE = {
  description: "",
  price: 0,
  shipped: false,
};

const NewProduct = ({ marketId }) => {
  const [formData, setFormdata] = useState(INITIAL_FORM_STATE);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pct, setPct] = useState(0);

  const { description, price, shipped } = formData;

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setUploading(true);
    const visibility = "public";
    try {
      const {
        attributes: { sub },
      } = await Auth.currentAuthenticatedUser();

      // UPLOAD IMAGE TO S3
      const fileName = `/${visibility}/${sub}/${Date.now()}-${file.name}`;
      const uploadedFile = await Storage.put(fileName, file, {
        contentType: file.type,
        progressCallback: (progress) => {
          console.log(progress.loaded, progress.total);
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setPct(percent);
        },
      });

      /*
      console.log(uploadedFile);
      {key: "/public/34e9ef7c-71ad-4ba5-8395-f89f88e5ce88/1597475640381-WRLDS.png"}
      */

      const fileObject = {
        key: uploadedFile.key,
        bucket: awsExports.aws_user_files_s3_bucket,
        region: awsExports.aws_user_files_s3_bucket_region,
      };
      const input = {
        description,
        price: dollarToCents(price),
        shipped,
        productMarketId: marketId,
        file: fileObject,
      };
      const res = await API.graphql(graphqlOperation(createProduct, { input }));
      console.log(res.data);
      setFormdata(INITIAL_FORM_STATE);
      setFile(null);
    } catch (error) {
      console.error(error);
    }
    setPct(0);
    setUploading(false);
  };

  return (
    <div className="">
      <h2>Add new product</h2>
      <div className="row">
        <div className="col-6 offset-3">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="description">Set product description</label>
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
                name="deliveryMethod"
                id="exampleRadios1"
                value="shipped"
                checked={shipped}
                onChange={() =>
                  setFormdata((prev) => ({ ...prev, shipped: true }))
                }
              />
              <label className="form-check-label" htmlFor="exampleRadios1">
                Shipped
              </label>
            </div>
            <div className="form-check-inline mb-3">
              <input
                className="form-check-input"
                type="radio"
                name="deliveryMethod"
                id="exampleRadios2"
                value="emailed"
                checked={!shipped}
                onChange={() =>
                  setFormdata((prev) => ({ ...prev, shipped: false }))
                }
              />
              <label className="form-check-label" htmlFor="exampleRadios2">
                Emailed
              </label>
            </div>
            {pct > 0 && (
              <div className="progress mb-3">
                <div
                  className="progress-bar progress-bar-striped"
                  role="progressbar"
                  style={{ width: `${pct}%` }}
                  aria-valuenow="10"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            )}
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroupFileAddon01">
                  Product Image
                </span>
              </div>
              <div className="custom-file">
                <input
                  type="file"
                  className="custom-file-input"
                  id="inputGroupFile01"
                  aria-describedby="inputGroupFileAddon01"
                  onChange={(evt) => setFile(evt.target.files[0])}
                />
                <label className="custom-file-label" htmlFor="inputGroupFile01">
                  {file ? file.name : "Choose file"}
                </label>
              </div>
            </div>
            <button
              disabled={!(description && price && file) || uploading}
              type="submit"
              className="btn btn-primary"
            >
              {uploading ? "Uploading..." : "Add product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;
