
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./VendorDashboard.css";

const initialForm = {
  category: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  image: "",
};

function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("vendor/products/"),
      api.get("categories/"),
    ])
      .then(([productResponse, categoryResponse]) => {
        if (!isMounted) return;

        const productData = productResponse.data;
        const categoryData = categoryResponse.data;

        setProducts(
          Array.isArray(productData)
            ? productData
            : productData.results || []
        );

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : categoryData.results || []
        );
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to load vendor data. Please try again.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProducts = async () => {
    const response = await api.get("vendor/products/");
    const data = response.data;

    setProducts(
      Array.isArray(data) ? data : data.results || []
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const productData = {
      category: Number(form.category),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image.trim(),
    };

    try {
      if (editingId) {
        await api.patch(
          `vendor/products/${editingId}/`,
          productData
        );
        setMessage("Product updated successfully.");
      } else {
        await api.post("vendor/products/", productData);
        setMessage("Product added successfully.");
      }

      await refreshProducts();
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to save product. Please check the entered details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      category: String(product.category || ""),
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      image: product.image || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`vendor/products/${productId}/`);
      setProducts((previous) =>
        previous.filter((product) => product.id !== productId)
      );
      setMessage("Product deleted successfully.");

      if (editingId === productId) {
        resetForm();
      }
    } catch {
      setError("Unable to delete product. Please try again.");
    }
  };

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  return (
    <main className="vendor-dashboard">
      <header className="vendor-header">
        <div>
          <p className="vendor-eyebrow">QELVORA PARTNER PANEL</p>
          <h1>Vendor Dashboard</h1>
          <p>Manage your products and keep track of your inventory.</p>
        </div>
      </header>

      <section className="vendor-stats">
        <article className="vendor-stat-card">
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </article>

        <article className="vendor-stat-card">
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </article>

        <article className="vendor-stat-card">
          <span>Out of Stock</span>
          <strong>
            {products.filter((product) => Number(product.stock) === 0).length}
          </strong>
        </article>
      </section>

      <section className="vendor-form-section">
        <div className="vendor-section-heading">
          <h2>{editingId ? "Update Product" : "Add New Product"}</h2>
          <p>
            {editingId
              ? "Edit your product details and inventory."
              : "Enter the details of the product you want to list."}
          </p>
        </div>

        <form className="vendor-product-form" onSubmit={handleSubmit}>
          <label>
            Product Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="vendor-full-field">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your product"
              rows="4"
              required
            />
          </label>

          <label>
            Price
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              min="0.01"
              step="0.01"
              required
            />
          </label>

          <label>
            Available Stock
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              min="0"
              step="1"
              required
            />
          </label>

          <label className="vendor-full-field">
            Product Image URL
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/product-image.jpg"
            />
          </label>

          <div className="vendor-form-actions vendor-full-field">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="vendor-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <p className="vendor-error">{error}</p>}
        {message && <p className="vendor-success">{message}</p>}
      </section>

      <section className="vendor-products-section">
        <div className="vendor-section-heading">
          <h2>My Products</h2>
          <p>View and manage your listed products.</p>
        </div>

        {loading && (
          <p className="vendor-message">Loading products...</p>
        )}

        {!loading && products.length === 0 && (
          <p className="vendor-message">
            You haven't added any products yet.
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="vendor-table-wrapper">
            <table className="vendor-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>₹{Number(product.price).toLocaleString("en-IN")}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span
                        className={`vendor-stock-status ${
                          Number(product.stock) > 0
                            ? "in-stock"
                            : "out-of-stock"
                        }`}
                      >
                        {Number(product.stock) > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      <div className="vendor-row-actions">
                        <button
                          type="button"
                          className="vendor-edit-button"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="vendor-delete-button"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default VendorDashboard;
