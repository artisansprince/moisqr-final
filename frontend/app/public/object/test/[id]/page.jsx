'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function DetailObjectPageTest() {
  const [object, setObject] = useState(null);
  const [language, setLanguage] = useState('en'); // Default bahasa Inggris
  const [isModalOpen, setModalOpen] = useState(false);
  const { id } = useParams();
  const router = useRouter();
  const baseURL = 'http://localhost:9977';

  useEffect(() => {
    if (id) {
      fetchObjectDetail(id);
    }
  }, [id, language]); // Update data saat bahasa berubah

  const fetchObjectDetail = async (objectId) => {
    try {
      const response = await axios.get(`${baseURL}/api/public/objects/get-by-id/${objectId}`);
      const data = response.data;

      // Translate fields melalui backend
      const translatedCategory = await translateText(data.category_name);
      const translatedLocation = await translateText(data.location);
      const translatedDescription = await translateText(data.description);

      // Update state dengan data terjemahan
      setObject({
        ...data,
        category_name: translatedCategory,
        location: translatedLocation,
        description: translatedDescription,
      });
    } catch (error) {
      console.error('Failed to fetch object detail:', error.message);
    }
  };

  // Fungsi translate menggunakan endpoint backend
  const translateText = async (text) => {
    try {
      const response = await axios.post(`${baseURL}/api/public/objects/translate`, {
        text: text,
        targetLang: language,
      });
      return response.data.translatedText || text; // Gunakan teks asli jika translate gagal
    } catch (error) {
      console.error('Translation error:', error.message);
      return text; // Tampilkan teks asli jika gagal translate
    }
  };

  // Fungsi untuk menerjemahkan teks dalam elemen dengan class 'object-detail-wrapper'
  const translateDivContent = async (wrapperClass, targetLang) => {
    const wrapper = document.querySelector(`.${wrapperClass}`);
    if (wrapper) {
      const elements = wrapper.querySelectorAll("*"); // Ambil semua elemen dalam div
      for (const element of elements) {
        if (element.textContent.trim() !== "") { // Skip elemen kosong
          const translatedText = await translateText(element.textContent, targetLang);
          element.textContent = translatedText;
        }
      }
    }
  };

  useEffect(() => {
    // Terjemahkan konten setelah objek selesai dimuat
    if (object) {
      translateDivContent('object-detail-wrapper', language);
    }
  }, [object, language]); // Update saat objek atau bahasa berubah

  if (!object) return <p>Loading...</p>;

  // Parse image_url yang berupa string JSON menjadi array
  const imageUrls = object.image_url ? JSON.parse(object.image_url) : [];

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setModalOpen(false); // Tutup modal setelah memilih bahasa
  };

  return (
    <div className="container mx-auto p-5">
      {/* Navbar */}
      <div className="flex justify-between items-center py-4 border-b">
        <div className="text-2xl font-bold">Logo</div>
        <button
          onClick={() => setModalOpen(true)}
          className="p-2 border rounded-full hover:bg-gray-100"
        >
          <span className="material-icons">language</span>
        </button>
      </div>

      {/* Popup Modal untuk ganti bahasa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Pilih Bahasa</h2>
            <div className="flex flex-col gap-4">
              {['id', 'en', 'fr', 'es', 'nl', 'de', 'ja', 'ko'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`p-2 border rounded ${
                    language === lang ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gambar objek berjajar horizontal */}
      {imageUrls.length > 0 ? (
        <div className="flex overflow-x-auto space-x-4 py-4 mb-4">
          {imageUrls.map((imageUrl, index) => (
            <img
              key={index}
              src={`${baseURL}${imageUrl}`}
              alt={`Image ${index + 1}`}
              className="w-64 h-48 object-cover rounded-md"
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No images available.</p>
      )}

      {/* Detail Objek */}
      <div className="object-detail-wrapper mb-4">
        <h1 className=" text-3xl font-bold mb-2">{object.name}</h1>
        <p className="text-gray-700 mb-2">Kategori: {object.category_name}</p>
        <p className="text-gray-500 mb-4">{object.location}</p>
        {/* <div className="desc-wrapper">
            {object.description}
        </div> */}

        <div
          className="desc-wrapper"
          dangerouslySetInnerHTML={{ __html: object.description }}
        />
      </div>
    </div>
  );
}
