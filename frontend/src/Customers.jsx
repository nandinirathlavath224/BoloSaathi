import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  Edit,
  Trash2,
  X,
  Save
} from "lucide-react";

import "./Customers.css";

const API_URL = "http://localhost:5000/api/customers";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: ""
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load customers");
      }

      setCustomers(
        Array.isArray(data) ? data : data.customers || data.data || []
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      customer_name: "",
      phone: "",
      address: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.customer_name.trim()) {
      setMessage("Please enter the customer name.");
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save customer");
      }

      setMessage(
        editingId
          ? "Customer updated successfully!"
          : "Customer added successfully!"
      );

      resetForm();
      await fetchCustomers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.customer_id);

    setForm({
      customer_name: customer.customer_name || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete customer");
      }

      setMessage("Customer deleted successfully!");
      await fetchCustomers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();

    return (
      (customer.customer_name || "").toLowerCase().includes(query) ||
      (customer.phone || "").toLowerCase().includes(query) ||
      (customer.address || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="customers-page">

      <div className="customers-header">
        <div>
          <h1>Customer Management</h1>
          <p>Manage your business customers in one place.</p>
        </div>

        <button
          className="customer-refresh"
          onClick={fetchCustomers}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="customer-summary">
        <div className="customer-summary-icon">
          <Users size={25} />
        </div>

        <div>
          <p>Total Customers</p>
          <h2>{customers.length}</h2>
        </div>
      </div>

      {message && (
        <div className="customer-message">
          {message}
        </div>
      )}

      <div className="customer-layout">

        {/* CUSTOMER FORM */}

        <div className="customer-form-card">

          <h2>
            {editingId ? <Edit size={20} /> : <UserPlus size={20} />}
            {editingId ? "Edit Customer" : "Add New Customer"}
          </h2>

          <form onSubmit={handleSubmit}>

            <label>Customer Name</label>
            <input
              type="text"
              name="customer_name"
              placeholder="Enter customer name"
              value={form.customer_name}
              onChange={handleChange}
              required
            />

            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
            />

            <label>Address</label>
            <textarea
              name="address"
              placeholder="Enter customer address"
              rows="4"
              value={form.address}
              onChange={handleChange}
            />

            <button type="submit" className="customer-submit">
              {editingId ? <Save size={17} /> : <UserPlus size={17} />}
              {editingId ? "Update Customer" : "Add Customer"}
            </button>

            {editingId && (
              <button
                type="button"
                className="customer-cancel"
                onClick={resetForm}
              >
                <X size={17} />
                Cancel Editing
              </button>
            )}

          </form>
        </div>

        {/* CUSTOMER LIST */}

        <div className="customer-list-card">

          <div className="customer-list-header">
            <div>
              <h2>Customer Directory</h2>
              <p>{filteredCustomers.length} customers found</p>
            </div>
          </div>

          <div className="customer-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by name, phone or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="customer-empty">
              Loading customers...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="customer-empty">
              <Users size={42} />
              <h3>No Customers Found</h3>
              <p>Add a customer or try another search.</p>
            </div>
          ) : (

            <div className="customer-table-wrapper">
              <table className="customer-table">

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.customer_id}>

                      <td>
                        <div className="customer-name-cell">
                          <div className="customer-avatar">
                            {(customer.customer_name || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>{customer.customer_name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="customer-contact">
                          <Phone size={14} />
                          {customer.phone || "Not provided"}
                        </span>
                      </td>

                      <td>
                        <span className="customer-contact">
                          <MapPin size={14} />
                          {customer.address || "Not provided"}
                        </span>
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            className="customer-edit"
                            title="Edit customer"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className="customer-delete"
                            title="Delete customer"
                            onClick={() => handleDelete(customer.customer_id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Customers;