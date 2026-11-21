import React, { useEffect, useState } from "react";

import {
  Package,
  Plus,
  RefreshCw,
  AlertTriangle,
  Search,
  Edit,
  X,
  Save,
  Boxes,
} from "lucide-react";

import "./Inventory.css";

const API_URL = "http://localhost:5000/api/inventory";

function Inventory() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    quantity: "",
    price: "",
    low_stock_limit: "5",
  });

  // Fetch products from MySQL through backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to fetch products");
      }

      const productList = Array.isArray(result)
        ? result
        : result.products || result.data || [];

      setProducts(productList);

    } catch (err) {
      console.error("Inventory loading error:", err);
      setError(
        "Unable to load inventory. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      product_name: "",
      category: "",
      quantity: "",
      price: "",
      low_stock_limit: "5",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Open add product form
  const handleAddProduct = () => {
    setError("");
    setSuccess("");
    setEditingId(null);

    setFormData({
      product_name: "",
      category: "",
      quantity: "",
      price: "",
      low_stock_limit: "5",
    });

    setShowForm(true);
  };

  // Open edit product form
  const handleEditProduct = (product) => {
    setError("");
    setSuccess("");

    setEditingId(product.product_id);

    setFormData({
      product_name: product.product_name || "",
      category: product.category || "",
      quantity: String(product.quantity ?? 0),
      price: String(product.price ?? 0),
      low_stock_limit: String(product.low_stock_limit ?? 5),
    });

    setShowForm(true);
  };

  // Save new or updated product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const quantity = Number(formData.quantity);
    const price = Number(formData.price);
    const lowStockLimit = Number(formData.low_stock_limit);

    if (!formData.product_name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (
      formData.quantity === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (
      formData.price === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError("Please enter a valid price greater than zero.");
      return;
    }

    if (
      formData.low_stock_limit === "" ||
      !Number.isInteger(lowStockLimit) ||
      lowStockLimit < 0
    ) {
      setError("Please enter a valid low stock limit.");
      return;
    }

    const payload = {
      product_name: formData.product_name.trim(),
      category: formData.category.trim(),
      quantity,
      price,
      low_stock_limit: lowStockLimit,
    };

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save product."
        );
      }

      setSuccess(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      resetForm();

      await fetchProducts();

    } catch (err) {
      console.error("Product save error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Search products
  const filteredProducts = products.filter((product) => {
    const name = String(product.product_name || "").toLowerCase();
    const category = String(product.category || "").toLowerCase();
    const searchText = search.toLowerCase();

    return (
      name.includes(searchText) ||
      category.includes(searchText)
    );
  });

  // Statistics
  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      Number(product.quantity) <=
      Number(product.low_stock_limit ?? 5)
  ).length;

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  return (
    <div className="inventory-page">

      {/* PAGE HEADER */}
      <div className="page-heading">

        <div>
          <h1>Inventory Management</h1>

          <p>
            Manage products, monitor stock and update product details.
          </p>
        </div>

        <button
          className="inventory-add-button"
          onClick={handleAddProduct}
        >
          <Plus size={19} />
          Add Product
        </button>

      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="inventory-success">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="inventory-error">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="inventory-summary">

        <div className="stat-card">

          <div className="inventory-stat-icon purple">
            <Package size={25} />
          </div>

          <div>
            <p>Total Products</p>
            <h2>{loading ? "..." : totalProducts}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="inventory-stat-icon blue">
            <Boxes size={25} />
          </div>

          <div>
            <p>Total Stock Quantity</p>
            <h2>{loading ? "..." : totalQuantity}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="inventory-stat-icon orange">
            <AlertTriangle size={25} />
          </div>

          <div>
            <p>Low Stock Products</p>
            <h2>{loading ? "..." : lowStockCount}</h2>
          </div>

        </div>

      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (

        <div className="inventory-form-container">

          <div className="inventory-form-heading">

            <div>
              <h2>
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>

              <p>Enter the product details below.</p>
            </div>

            <button
              type="button"
              className="inventory-close-button"
              onClick={resetForm}
            >
              <X size={22} />
            </button>

          </div>

          <form
            className="inventory-form"
            onSubmit={handleSubmit}
          >

            <div className="inventory-input-group">
              <label>Product Name *</label>

              <input
                type="text"
                name="product_name"
                placeholder="Enter product name"
                value={formData.product_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="inventory-input-group">
              <label>Category</label>

              <input
                type="text"
                name="category"
                placeholder="Example: Grocery"
                value={formData.category}
                onChange={handleChange}
              />
            </div>

            <div className="inventory-input-group">
              <label>Quantity *</label>

              <input
                type="number"
                name="quantity"
                min="0"
                step="1"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="inventory-input-group">
              <label>Price (₹) *</label>

              <input
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="inventory-input-group">
              <label>Low Stock Limit</label>

              <input
                type="number"
                name="low_stock_limit"
                min="0"
                step="1"
                placeholder="Default: 5"
                value={formData.low_stock_limit}
                onChange={handleChange}
              />
            </div>

            <div className="inventory-form-actions">

              <button
                type="button"
                className="inventory-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inventory-save-button"
                disabled={saving}
              >
                <Save size={18} />

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Save Product"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* PRODUCT TABLE SECTION */}
      <div className="inventory-table-section">

        <div className="inventory-toolbar">

          <div>
            <h2>Product Inventory</h2>
            <p>View and manage all your products.</p>
          </div>

          <div className="inventory-toolbar-actions">

            <div className="inventory-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="inventory-refresh-button"
              onClick={fetchProducts}
              disabled={loading}
              title="Refresh inventory"
            >
              <RefreshCw size={19} />
            </button>

          </div>

        </div>

        {/* TABLE */}
        {loading ? (

          <div className="inventory-empty">
            <RefreshCw size={32} />
            <p>Loading inventory...</p>
          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="inventory-empty">

            <Package size={45} />

            <h3>
              {search
                ? "No matching products found"
                : "No Products Available"}
            </h3>

            <p>
              {search
                ? "Try searching with another product name or category."
                : "Your inventory is empty. Add your first product to get started."}
            </p>

            {!search && (
              <button
                className="inventory-add-button"
                onClick={handleAddProduct}
              >
                <Plus size={18} />
                Add Your First Product
              </button>
            )}

          </div>

        ) : (

          <div className="inventory-table-container">

            <table className="inventory-table">

              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.map((product) => {

                  const isLowStock =
                    Number(product.quantity) <=
                    Number(product.low_stock_limit ?? 5);

                  return (

                    <tr key={product.product_id}>

                      <td>#{product.product_id}</td>

                      <td>
                        <strong>{product.product_name}</strong>
                      </td>

                      <td>
                        {product.category || "Uncategorized"}
                      </td>

                      <td>
                        {product.quantity}
                      </td>

                      <td>
                        {formatCurrency(product.price)}
                      </td>

                      <td>
                        <span
                          className={
                            isLowStock
                              ? "stock-low"
                              : "stock-good"
                          }
                        >
                          {isLowStock
                            ? "Low Stock"
                            : "Good Stock"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="inventory-edit-button"
                          onClick={() => handleEditProduct(product)}
                          title="Edit product"
                        >
                          <Edit size={17} />
                          Edit
                        </button>
                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Inventory;