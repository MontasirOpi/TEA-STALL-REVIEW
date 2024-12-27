import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AdminPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({
    location: '',
    shopName: '',
    text: '',
    rating: 1,
    imageUrl: '',
  });
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      const querySnapshot = await getDocs(collection(db, 'reviews'));
      const reviewsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
    };
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews(reviews.filter((review) => review.id !== id));
      setFilteredReviews(filteredReviews.filter((review) => review.id !== id));
      alert('Review deleted successfully.');
    } catch (error) {
      console.error('Error deleting review: ', error);
    }
  };

  const handleEdit = (review) => {
    setEditReviewId(review.id);
    setEditReviewData({
      location: review.location,
      shopName: review.shopName,
      text: review.text,
      rating: review.rating,
      imageUrl: review.imageUrl || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { location, shopName, text, rating, imageUrl } = editReviewData;

    try {
      const reviewRef = doc(db, 'reviews', editReviewId);
      await updateDoc(reviewRef, { location, shopName, text, rating, imageUrl });

      const updatedReviews = reviews.map((review) =>
        review.id === editReviewId
          ? { ...review, location, shopName, text, rating, imageUrl }
          : review
      );
      setReviews(updatedReviews);
      setFilteredReviews(updatedReviews);
      setEditReviewId(null);
      alert('Review updated successfully.');
    } catch (error) {
      console.error('Error updating review: ', error);
    }
  };

  const handleCancel = () => {
    setEditReviewId(null);
    setEditReviewData({
      location: '',
      shopName: '',
      text: '',
      rating: 1,
      imageUrl: '',
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchLocation(query);

    const filtered = reviews.filter((review) =>
      review.location.toLowerCase().includes(query)
    );
    setFilteredReviews(filtered);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Admin Panel - Manage Reviews</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchLocation}
          onChange={handleSearch}
          placeholder="Search by location"
          className="w-full md:w-1/3 p-3 border border-gray-300 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-4 transition-transform hover:scale-105">
              {editReviewId === review.id ? (
                <form onSubmit={handleUpdate}>
                  <input
                    type="text"
                    value={editReviewData.location}
                    onChange={(e) =>
                      setEditReviewData({ ...editReviewData, location: e.target.value })
                    }
                    placeholder="Location"
                    className="w-full p-3 mb-3 border border-gray-300 rounded"
                    required
                  />
                  <input
                    type="text"
                    value={editReviewData.shopName}
                    onChange={(e) =>
                      setEditReviewData({ ...editReviewData, shopName: e.target.value })
                    }
                    placeholder="Shop Name"
                    className="w-full p-3 mb-3 border border-gray-300 rounded"
                    required
                  />
                  <textarea
                    value={editReviewData.text}
                    onChange={(e) =>
                      setEditReviewData({ ...editReviewData, text: e.target.value })
                    }
                    placeholder="Write your review..."
                    className="w-full p-3 mb-3 border border-gray-300 rounded"
                    required
                  />
                  <select
                    value={editReviewData.rating}
                    onChange={(e) =>
                      setEditReviewData({ ...editReviewData, rating: parseInt(e.target.value) })
                    }
                    className="w-full p-3 mb-3 border border-gray-300 rounded"
                    required
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                  <input
                    type="text"
                    value={editReviewData.imageUrl}
                    onChange={(e) =>
                      setEditReviewData({ ...editReviewData, imageUrl: e.target.value })
                    }
                    placeholder="Image URL (optional)"
                    className="w-full p-3 mb-3 border border-gray-300 rounded"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2">{review.shopName}</h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Location:</strong> {review.location}
                  </p>
                  <p className="text-gray-600 mb-1">{review.text}</p>
                  <p className="text-gray-600 mb-1">
                    <strong>Rating:</strong> {review.rating} Stars
                  </p>
                  {review.imageUrl && (
                    <img
                      src={review.imageUrl}
                      alt="Review"
                      className="w-full h-40 object-cover rounded mt-3"
                    />
                  )}
                  <div className="mt-4">
                    <button
                      onClick={() => handleEdit(review)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No reviews found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
//dev by opi