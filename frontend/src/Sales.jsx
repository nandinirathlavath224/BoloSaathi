import React, { useEffect, useState } from "react";

import {
  ShoppingCart,
  Plus,
  Trash2,
  RefreshCw,
  Receipt,
  IndianRupee,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "./api";

import "./Sales.css";



function Sales() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [items, setItems] = useState([
    { product_id: "", quantity: 1 },
  ]);

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load products and previous sales
  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productResponse, salesResponse] =
        await Promise.all([
          fetch(`${API_URL}/inventory`),
          fetch(`${API_URL}/sales`),
        ]);

      const productData = await productResponse.json();
      const salesData = await salesResponse.json();

      if (!productResponse.ok) {
        throw new Error("Unable to load inventory products.");
      }

      if (!salesResponse.ok) {
        throw new Error("Unable to load sales records.");
      }

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData.products || productData.data || []
      );

      setSales(
        Array.isArray(salesData)
          ? salesData
          : salesData.sales || salesData.data || []
      );

    } catch (err) {
      console.error("Sales loading error:", err);
      setError(err.message || "Unable to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, []);

  // Add another product row
  const addItem = () => {
    setItems((previous) => [
      ...previous,
      { product_id: "", quantity: 1 },
    ]);
  };

  // Remove product row
  const removeItem = (index) => {
    if (items.length === 1) {
      setItems([{ product_id: "", quantity: 1 }]);
      return;
    }

    setItems((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Update product selection or quantity
  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Find selected product
  const getProduct = (productId) => {
    return products.find(
      (product) =>
        Number(product.product_id) === Number(productId)
    );
  };

  // Calculate bill total
  const totalAmount = items.reduce((total, item) => {
    const product = getProduct(item.product_id);

    if (!product) return total;

    return (
      total +
      Number(product.price) * Number(item.quantity || 0)
    );
  }, 0);

  // Record sale
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (items.some((item) => !item.product_id)) {
      setError("Please select a product for every row.");
      return;
    }

    const hasInvalidQuantity = items.some((item) => {
      const quantity = Number(item.quantity);
      const product = getProduct(item.product_id);

      return (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !product ||
        quantity > Number(product.quantity)
      );
    });

    if (hasInvalidQuantity) {
      setError(
        "Please check product quantities. Quantity cannot exceed available stock."
      );
      return;
    }

    const payload = {
      customer_id: customerId ? Number(customerId) : null,
      payment_method: paymentMethod,
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    };

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to record sale."
        );
      }

      setSuccess(
        result.message || "Sale recorded successfully!"
      );

      setItems([{ product_id: "", quantity: 1 }]);
      setCustomerId("");
      setPaymentMethod("Cash");

      await loadSalesData();

    } catch (err) {
      console.error("Sale submission error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  return (
    <div className="sales-page">

      {/* HEADER */}
      <div className="sales-header">

        <div>
          <h1>Sales Management</h1>
          <p>Record sales and manage customer purchases.</p>
        </div>

        <button
          className="sales-refresh-button"
          onClick={loadSalesData}
          disabled={loading}
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* MESSAGES */}
      {error && (
        <div className="sales-message sales-error">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {success && (
        <div className="sales-message sales-success">
          <CheckCircle size={19} />
          {success}
        </div>
      )}

      {/* SUMMARY */}
      <div className="sales-summary">

        <div className="sales-summary-card">
          <div className="sales-summary-icon">
            <ShoppingCart size={25} />
          </div>

          <div>
            <p>Total Sales Records</p>
            <h2>{loading ? "..." : sales.length}</h2>
          </div>
        </div>

        <div className="sales-summary-card">
          <div className="sales-summary-icon">
            <IndianRupee size={25} />
          </div>

          <div>
            <p>Total Recorded Revenue</p>
            <h2>
              {loading
                ? "..."
                : formatCurrency(
                    sales.reduce(
                      (sum, sale) =>
                        sum + Number(sale.total_amount || 0),
                      0
                    )
                  )}
            </h2>
          </div>
        </div>

      </div>

      {/* NEW SALE FORM */}
      <div className="sales-form-card">

        <div className="sales-section-heading">
          <div className="sales-heading-icon">
            <Receipt size={24} />
          </div>

          <div>
            <h2>Create New Sale</h2>
            <p>Select products and calculate the bill.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* CUSTOMER AND PAYMENT */}
          <div className="sales-details-grid">

            <div className="sales-input-group">
              <label>Customer ID (Optional)</label>

              <input
                type="number"
                min="1"
                placeholder="Enter customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
            </div>

            <div className="sales-input-group">
              <label>Payment Method</label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

          </div>

          {/* PRODUCT ITEMS */}
          <div className="sales-items-heading">
            <h3>Products</h3>

            <button
              type="button"
              className="sales-add-item-button"
              onClick={addItem}
            >
              <Plus size={17} />
              Add Item
            </button>
          </div>

          {items.map((item, index) => {

            const selectedProduct = getProduct(item.product_id);

            const availableStock = selectedProduct
              ? Number(selectedProduct.quantity)
              : 0;

            const subtotal = selectedProduct
              ? Number(selectedProduct.price) *
                Number(item.quantity || 0)
              : 0;

            return (

              <div className="sales-product-row" key={index}>

                <div className="sales-input-group">
                  <label>Product</label>

                  <select
                    value={item.product_id}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "product_id",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">Select Product</option>

                    {products.map((product) => (
                      <option
                        key={product.product_id}
                        value={product.product_id}
                        disabled={Number(product.quantity) <= 0}
                      >
                        {product.product_name} — Stock: {product.quantity}
                      </option>
                    ))}

                  </select>
                </div>

                <div className="sales-input-group">
                  <label>Quantity</label>

                  <input
                    type="number"
                    min="1"
                    max={availableStock || undefined}
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="sales-input-group">
                  <label>Subtotal</label>

                  <div className="sales-subtotal">
                    {formatCurrency(subtotal)}
                  </div>
                </div>

                <button
                  type="button"
                  className="sales-remove-button"
                  onClick={() => removeItem(index)}
                  title="Remove item"
                >
                  <Trash2 size={19} />
                </button>

              </div>

            );
          })}

          {/* TOTAL */}
          <div className="sales-total-section">

            <div>
              <p>Total Bill Amount</p>
              <h2>{formatCurrency(totalAmount)}</h2>
            </div>

            <button
              type="submit"
              className="sales-submit-button"
              disabled={saving || products.length === 0}
            >
              <ShoppingCart size={19} />

              {saving ? "Recording Sale..." : "Complete Sale"}
            </button>

          </div>

        </form>

      </div>

      {/* SALES HISTORY */}
      <div className="sales-history-card">

        <div className="sales-section-heading">
          <div className="sales-heading-icon">
            <Receipt size={24} />
          </div>

          <div>
            <h2>Recent Sales</h2>
            <p>Your recorded sales transactions.</p>
          </div>
        </div>

        {loading ? (

          <p className="sales-empty">Loading sales...</p>

        ) : sales.length === 0 ? (

          <div className="sales-empty">
            <ShoppingCart size={40} />
            <h3>No Sales Yet</h3>
            <p>Your recorded sales will appear here.</p>
          </div>

        ) : (

          <div className="sales-table-container">

            <table className="sales-table">

              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Customer ID</th>
                  <th>Payment Method</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {sales.map((sale, index) => (

                  <tr key={sale.sale_id || index}>

                    <td>#{sale.sale_id}</td>

                    <td>
                      {sale.customer_id || "Walk-in"}
                    </td>

                    <td>
                      {sale.payment_method || "Cash"}
                    </td>

                    <td className="sales-amount">
                      {formatCurrency(sale.total_amount)}
                    </td>

                    <td>
                      {sale.created_at
                        ? new Date(sale.created_at).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Sales;