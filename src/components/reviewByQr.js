import React, { useState, useEffect } from 'react';
import { db, storage, signOut } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const Qr = () => {
  const [searchParams] = useSearchParams(); // Hook to read URL parameters
  const initialShopName = searchParams.get('shopName') || ''; // Get shopName from URL
  const initialLocation = searchParams.get('location') || ''; // Get location from URL

  const [location, setLocation] = useState(initialLocation);
  const [shopName, setShopName] = useState(initialShopName);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(1);
  const [file, setFile] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [reviewQrUrl, setReviewQrUrl] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
    }
    // Update QR URL dynamically if shopName or location changes
    if (shopName && location) {
      setReviewQrUrl(
        `https://teastallbd.netlify.app//Qr?shopName=${encodeURIComponent(shopName)}&location=${encodeURIComponent(location)}`
      );
    }
  }, [user, loading, navigate, shopName, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imageUrl = file ? await uploadImage(file) : null;

    const reviewData = {
      location,
      shopName,
      text,
      rating,
      imageUrl,
      timestamp: new Date(),
      userId: user?.uid,
    };

    submitReview(reviewData);
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image: ', error);
      return null;
    }
  };

  const submitReview = async (reviewData) => {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      console.log('Review written with ID: ', docRef.id);
      setShowSnackbar(true);
      setLocation('');
      setShopName('');
      setText('');
      setRating(1);
      setFile(null);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (e) {
      console.error('Error adding review: ', e);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  return (
    <div className="bg-gray-100 p-6 sm:p-8 rounded-lg shadow-md max-w-lg mx-auto mt-10 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Share Your Tea Stall Experience</h2>
      {user && (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Shop name"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your review..."
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
            >
              Submit Review
            </button>
          </form>

          {reviewQrUrl && (
            <div className="mt-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Scan to Access the Review Form</h3>
              <div className="flex justify-center">
                <QRCodeCanvas value={reviewQrUrl} size={200} />
              </div>
              <p className="text-gray-600 mt-4">
                Use your phone to scan this QR code and open the review form directly with pre-loaded information (shop name and location).
              </p>
            </div>
          )}

          {showSnackbar && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-4 rounded shadow-lg">
              Review submitted successfully!
            </div>
          )}
        </>
      )}

      {!user && !loading && (
        <div className="text-center">
          <p>Please log in to access the review form.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Go to Login
          </button>
        </div>
      )}

      {user && (
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded mt-4 hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Qr;