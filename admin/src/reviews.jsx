import { useEffect, useState } from "react";
import { useAuth } from "./main";

export function ReviewsPage() {
  const { authFetch } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const load = () =>
    authFetch(`/admin/reviews?status=${status}`)
      .then((response) => setReviews(response.data))
      .catch((caught) => setError(caught.message || "Unable to load reviews."));
  useEffect(() => {
    load();
  }, [status]);
  const update = async (id, nextStatus) => {
    try {
      await authFetch(`/admin/reviews/${id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      load();
    } catch (caught) {
      setError(caught.message || "Unable to update review.");
    }
  };
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="section-kicker">CUSTOMER VOICE</span>
          <h1>Reviews</h1>
          <p>
            Review customer feedback and publish approved reviews to the
            storefront.
          </p>
        </div>
      </div>
      <div className="toolbar">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="pending">Pending review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!reviews.length && (
              <tr>
                <td colSpan="5" className="empty-state">
                  No reviews in this queue.
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <b>{review.product_name}</b>
                  <small>{review.order_number}</small>
                </td>
                <td>
                  <b>
                    {review.first_name} {review.last_name}
                  </b>
                  <small>{review.email}</small>
                </td>
                <td>
                  <b>{review.title || "Untitled review"}</b>
                  <small>{review.body}</small>
                </td>
                <td>{"★".repeat(review.rating)}</td>
                <td className="table-actions">
                  {review.status === "pending" && (
                    <>
                      <button
                        className="button-small"
                        onClick={() => update(review.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="button-small button-danger"
                        onClick={() => update(review.id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {review.status !== "deleted" && (
                    <button
                      className="button-small button-danger"
                      onClick={() => update(review.id, "deleted")}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
