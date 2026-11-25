
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminProducts.css";

const initialForm = {
  category: "",
  vendor: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  image: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("admin/products/"),
      api.get("categories/"),
      api.get("accounts/admin/users/"),
    ])
      .then(([productResponse, categoryResponse, userResponse]) => {
        if (!isMounted) return;

        const productData = productResponse.data;
        const categoryData = categoryResponse.data;
        const userData = userResponse.data;

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

        const approvedVendors = (
          Array.isArray(userData) ? userData : userData.results || []
        ).filter(
          (user) =>
            user.role === "vendor" &&
            user.vendor_status === "approved" &&
            !user.is_staff
        );

        setVendors(approvedVendors);
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to load admin product data.");
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
      vendor: form.vendor ? Number(form.vendor) : null,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image.trim(),
    };

    try {
      if (editingId) {
        await api.patch(
          `admin/products/${editingId}/`,
          productData
        );
        setMessage("Product updated successfully.");
      } else {
        await api.post("admin/products/", productData);
        setMessage("Product added successfully.");
      }

      const response = await api.get("admin/products/");
      const data = response.data;

      setProducts(
        Array.isArray(data) ? data : data.results || []
      );

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
      vendor: product.vendor ? String(product.vendor) : "",
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

    setUpdatingId(productId);
    setError("");
    setMessage("");

    try {
      await api.delete(`admin/products/${productId}/`);

      setProducts((previous) =>
        previous.filter((product) => product.id !== productId)
      );

      if (editingId === productId) {
        resetForm();
      }

      setMessage("Product deleted successfully.");
    } catch {
      setError("Unable to delete product. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "Unknown";
  };

  const getVendorName = (vendorId) => {
    if (!vendorId) return "Admin";

    const vendor = vendors.find(
      (item) => item.id === vendorId
    );

    return vendor?.username || `User #${vendorId}`;
  };

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  return (
    <main className="admin-products-page">
      <header className="admin-products-header">
        <div>
          <p className="admin-products-eyebrow">
            QELVORA MANAGEMENT
          </p>
          <h1>Product Management</h1>
          <p>Manage the products available in your store.</p>
        </div>
      </header>

      <section className="admin-products-stats">
        <article>
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </article>

        <article>
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </article>

        <article>
          <span>Out of Stock</span>
          <strong>
            {products.filter(
              (product) => Number(product.stock) === 0
            ).length}
          </strong>
        </article>
      </section>

      <section className="admin-product-form-section">
        <div className="admin-products-section-heading">
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
          <p>
            {editingId
              ? "Update the selected product details."
              : "Add a product to the QELVORA catalogue."}
          </p>
        </div>

        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >
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

          <label>
            Vendor
            <select
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
            >
              <option value="">Admin-owned product</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.username}
                </option>
              ))}
            </select>
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
              placeholder="Enter stock"
              min="0"
              step="1"
              required
            />
          </label>

          <label className="admin-product-full-field">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
              required
            />
          </label>

          <label className="admin-product-full-field">
            Product Image URL
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
            />
          </label>

          <div className="admin-product-form-actions admin-product-full-field">
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
                className="admin-product-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && <p className="admin-products-error">{error}</p>}
        {message && (
          <p className="admin-products-success">{message}</p>
        )}
      </section>

      <section className="admin-products-list-section">
        <div className="admin-products-section-heading">
          <h2>All Products</h2>
          <p>View and manage active products in the store.</p>
        </div>

        {loading && (
          <p className="admin-products-message">Loading products...</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="admin-products-message">No products found.</p>
        )}

        {!loading && products.length > 0 && (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>{product.name}</td>
                    <td>{getCategoryName(product.category)}</td>
                    <td>
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </td>
                    <td>{product.stock}</td>
                    <td>{getVendorName(product.vendor)}</td>
                    <td>
                      <div className="admin-products-actions">
                        <button
                          type="button"
                          className="admin-products-edit"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-products-delete"
                          disabled={updatingId === product.id}
                          onClick={() => handleDelete(product.id)}
                        >
                          {updatingId === product.id
                            ? "Deleting..."
                            : "Delete"}
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

export default AdminProducts;
