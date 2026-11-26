
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

const PAGE_SIZE = 10;

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  // Fetch products when navigating between pages
  const fetchProducts = async (page = 1) => {
    setPageLoading(true);

    try {
      const response = await api.get("admin/products/", {
        params: {
          page,
          page_size: PAGE_SIZE,
        },
      });

      const data = response.data;

      setProducts(data.results || []);
      setTotalProducts(data.count || 0);
      setTotalStock(data.total_stock || 0);
      setOutOfStock(data.out_of_stock || 0);
      setCurrentPage(page);
    } catch {
      setError("Unable to load products. Please try again.");
    } finally {
      setPageLoading(false);
    }
  };

  // Load initial products, categories and vendors
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productResponse, categoryResponse, userResponse] =
          await Promise.all([
            api.get("admin/products/", {
              params: {
                page: 1,
                page_size: PAGE_SIZE,
              },
            }),
            api.get("categories/"),
            api.get("accounts/admin/users/"),
          ]);

        // Set initial products and pagination details
        const productData = productResponse.data;

        setProducts(productData.results || []);
        setTotalProducts(productData.count || 0);
        setTotalStock(productData.total_stock || 0);
        setOutOfStock(productData.out_of_stock || 0);
        setCurrentPage(1);

        // Set categories
        const categoryData = categoryResponse.data;

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : categoryData.results || []
        );

        // Filter approved vendors
        const userData = userResponse.data;

        const users = Array.isArray(userData)
          ? userData
          : userData.results || [];

        setVendors(
          users.filter(
            (user) =>
              user.role === "vendor" &&
              user.vendor_status === "approved" &&
              !user.is_staff
          )
        );
      } catch {
        setError("Unable to load admin product data.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
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

  // Add or update product
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

        await fetchProducts(currentPage);
      } else {
        await api.post("admin/products/", productData);

        setMessage("Product added successfully.");

        await fetchProducts(1);
      }

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

  // Edit product
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete product
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

      if (editingId === productId) {
        resetForm();
      }

      const remainingOnPage = products.length - 1;

      if (remainingOnPage === 0 && currentPage > 1) {
        await fetchProducts(currentPage - 1);
      } else {
        await fetchProducts(currentPage);
      }

      setMessage("Product deleted successfully.");
    } catch {
      setError("Unable to delete product. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "Unknown";
  };

  // Get vendor name
  const getVendorName = (vendorId) => {
    if (!vendorId) return "Admin";

    const vendor = vendors.find(
      (item) => item.id === vendorId
    );

    return vendor?.username || `User #${vendorId}`;
  };

  // Generate visible page numbers
  const firstPage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4)
  );

  const lastPage = Math.min(totalPages, firstPage + 4);

  const pageNumbers = Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index
  );

  // Calculate displayed product range
  const firstItem =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(
    currentPage * PAGE_SIZE,
    totalProducts
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

      {/* Product Statistics */}
      <section className="admin-products-stats">
        <article>
          <span>Total Products</span>
          <strong>{totalProducts}</strong>
        </article>

        <article>
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </article>

        <article>
          <span>Out of Stock</span>
          <strong>{outOfStock}</strong>
        </article>
      </section>

      {/* Add / Edit Product Form */}
      <section className="admin-product-form-section">
        <div className="admin-products-section-heading">
          <h2>
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

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

        {error && (
          <p className="admin-products-error">{error}</p>
        )}

        {message && (
          <p className="admin-products-success">{message}</p>
        )}
      </section>

      {/* Products Table */}
      <section className="admin-products-list-section">
        <div className="admin-products-section-heading">
          <h2>All Products</h2>
          <p>View and manage active products in the store.</p>
        </div>

        {loading && (
          <p className="admin-products-message">
            Loading products...
          </p>
        )}

        {!loading && products.length === 0 && (
          <p className="admin-products-message">
            No products found.
          </p>
        )}

        {!loading && products.length > 0 && (
          <>
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

                      <td>
                        {getCategoryName(product.category)}
                      </td>

                      <td>
                        ₹
                        {Number(product.price).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>{product.stock}</td>

                      <td>
                        {getVendorName(product.vendor)}
                      </td>

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

            {/* Pagination */}
            <div className="admin-products-pagination">
              <p className="admin-products-pagination-info">
                Showing <strong>{firstItem}-{lastItem}</strong>{" "}
                of <strong>{totalProducts}</strong> products
              </p>

              <div className="admin-products-pagination-controls">
                <button
                  type="button"
                  className="admin-products-page-button"
                  disabled={currentPage === 1 || pageLoading}
                  onClick={() => fetchProducts(currentPage - 1)}
                >
                  Previous
                </button>

                {pageNumbers.map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`admin-products-page-button ${
                      currentPage === page ? "active" : ""
                    }`}
                    disabled={pageLoading}
                    onClick={() => fetchProducts(page)}
                    aria-current={
                      currentPage === page ? "page" : undefined
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="admin-products-page-button"
                  disabled={
                    currentPage >= totalPages || pageLoading
                  }
                  onClick={() => fetchProducts(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default AdminProducts;
