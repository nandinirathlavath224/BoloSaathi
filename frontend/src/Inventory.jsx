import "./Inventory.css";
import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  RefreshCw,
  AlertTriangle,
  Search,
  Edit,
  X,
} from "lucide-react";

import { API_URL } from "./api";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    product_name: "",
    category: "",
    quantity: "",
    price: "",
    low_stock_limit: 5,
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

     const response = await fetch(`${API_URL}/inventory`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load inventory");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      product_name: "",
      category: "",
      quantity: "",
      price: "",
      low_stock_limit: 5,
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price),
          low_stock_limit: Number(form.low_stock_limit),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save product");
      }

      alert(data.message || "Product saved successfully!");

      resetForm();
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.product_id);

    setForm({
      product_name: product.product_name,
      category: product.category || "",
      quantity: product.quantity,
      price: product.price,
      low_stock_limit: product.low_stock_limit,
    });

    setShowForm(true);
  };

  const filteredProducts = products.filter((product) =>
    product.product_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const lowStockCount = products.filter(
    (product) =>
      Number(product.quantity) <= Number(product.low_stock_limit)
  ).length;

  return (
    <div className="dashboard-content inventory-page">

      <div className="section-heading">
        <div>
          <h2>Inventory Management</h2>
          <p>Manage products and monitor stock levels.</p>
        </div>

        <button className="period-button" onClick={loadProducts}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="inventory-summary">
        <div className="stat-card">
          <Package size={24} />
          <p>Total Products</p>
          <h2>{products.length}</h2>
        </div>

        <div className="stat-card">
          <AlertTriangle size={24} />
          <p>Low Stock Products</p>
          <h2>{lowStockCount}</h2>
        </div>
      </div>

      <div className="inventory-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="period-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {showForm && (
        <form className="inventory-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>{editingId ? "Update Product" : "Add New Product"}</h2>

            <button type="button" onClick={resetForm}>
              <X size={20} />
            </button>
          </div>

          <input
            name="product_name"
            placeholder="Product name"
            value={form.product_name}
            onChange={handleChange}
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />

          <input
            name="quantity"
            type="number"
            min="0"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            name="low_stock_limit"
            type="number"
            min="0"
            placeholder="Low stock limit"
            value={form.low_stock_limit}
            onChange={handleChange}
            required
          />

          <button type="submit" className="period-button">
            {editingId ? "Update Product" : "Save Product"}
          </button>
        </form>
      )}

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Loading inventory...</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found. Add your first product!</p>
      ) : (
        <div className="transactions-card inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const isLow =
                  Number(product.quantity) <=
                  Number(product.low_stock_limit);

                return (
                  <tr key={product.product_id}>
                    <td>{product.product_name}</td>
                    <td>{product.category || "-"}</td>
                    <td>{product.quantity}</td>
                    <td>
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={isLow ? "stock-low" : "stock-good"}>
                        {isLow ? "Low Stock" : "Available"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        aria-label={`Edit ${product.product_name}`}
                      >
                        <Edit size={17} />
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
  );
}

export default Inventory;