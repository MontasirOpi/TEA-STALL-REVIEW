import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopSearch, setShopSearch] = useState('');
  const [ratingSearch, setRatingSearch] = useState('');
  const [modalShop, setModalShop] = useState(null);
  const modalRef = useRef(null);

  // Fetch reviews from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsCollection = collection(db, 'reviews');
      const reviewSnapshot = await getDocs(reviewsCollection);
      const reviewList = reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewList);
    };

    fetchReviews();
  }, []);

  // Group reviews by shop and calculate average ratings
  const groupedReviews = reviews.reduce((acc, review) => {
    if (review.shopName) {
      const shopName = review.shopName.toLowerCase();
      if (!acc[shopName]) {
        acc[shopName] = { reviews: [], totalRating: 0, avgRating: 0 };
      }
      acc[shopName].reviews.push(review);
      acc[shopName].totalRating += Number(review.rating);
      acc[shopName].avgRating = acc[shopName].totalRating / acc[shopName].reviews.length;
    }
    return acc;
  }, {});

  // Filter logic for location, shop name, and rating
  const matchesLocationFilter = (shopData, searchTerm) =>
    searchTerm ? shopData.reviews[0]?.location?.toLowerCase().includes(searchTerm.toLowerCase()) : true;

  const matchesShopNameFilter = (shopData, shopSearch) =>
    shopSearch ? shopData.reviews[0]?.shopName?.toLowerCase().includes(shopSearch.toLowerCase()) : true;

  const matchesRatingFilter = (shopData, ratingSearch) =>
    ratingSearch ? Math.round(shopData.avgRating) === parseInt(ratingSearch, 10) : true;

  const filteredShops = Object.keys(groupedReviews).filter((shop) => {
    const shopData = groupedReviews[shop];
    return (
      matchesLocationFilter(shopData, searchTerm) &&
      matchesShopNameFilter(shopData, shopSearch) &&
      matchesRatingFilter(shopData, ratingSearch)
    );
  });

  // Modal controls
  const openModal = (shopName) => {
    setModalShop(shopName);
  };

  const closeModal = () => {
    setModalShop(null);
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Reviews</h2>

      {/* Search Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <input
          type="text"
          placeholder="Search by location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Search by shop name"
          value={shopSearch}
          onChange={(e) => setShopSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
        <input
          type="number"
          placeholder="Search by rating (1-5)"
          value={ratingSearch}
          onChange={(e) => setRatingSearch(e.target.value)}
          min="1"
          max="5"
          step="1"
          className="p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </div>

      {/* Shop Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <div key={shop} className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-teal-600 capitalize">
              {groupedReviews[shop].reviews[0].shopName}
            </h3>
            <p className="text-gray-700 mt-2">
              Location: {groupedReviews[shop].reviews[0].location}
            </p>
            <p className="text-gray-500 mt-2">
              {groupedReviews[shop].reviews.length} people reviewed this shop
            </p>
            <p className="text-yellow-500 mt-2 font-semibold">
              Average Rating: {groupedReviews[shop].avgRating.toFixed(1)} ★
            </p>
            <button
              onClick={() => openModal(shop)}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 focus:outline-none"
            >
              View Reviews
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg w-11/12 max-w-4xl overflow-y-auto max-h-[80vh] relative shadow-2xl">
            <div className="absolute top-0 left-0 right-0 bg-teal-600 text-white p-4 rounded-t-lg">
              <h2 className="text-2xl font-bold capitalize">
                {groupedReviews[modalShop].reviews[0].shopName} Reviews
              </h2>
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-white hover:text-gray-300"
              >
                X
              </button>
            </div>

            <div className="space-y-4 mt-16">
              {groupedReviews[modalShop].reviews.map((review) => (
                <div key={review.id} className="bg-gray-100 p-4 rounded-lg shadow">
                  <p className="text-gray-700">{review.text}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                    <span className="ml-2 text-gray-500">{review.rating} Stars</span>
                  </div>
                  {review.imageUrl && (
                    <img
                      src={review.imageUrl}
                      alt={review.location}
                      className="mt-2 rounded-lg w-48 h-48 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
