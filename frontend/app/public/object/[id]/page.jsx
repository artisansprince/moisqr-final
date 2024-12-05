'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function DetailObjectPage() {
  const [object, setObject] = useState(null);
  const [language, setLanguage] = useState('id'); // Default bahasa Indonesia
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
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">{object.name}</h1>
        <p className="text-gray-700 mb-2">Kategori: {object.category_name}</p>
        <p className="text-gray-500 mb-4">{object.location}</p>
        <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: object.description }}></p>
      </div>
    </div>
  );
}












// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import axios from 'axios';

// export default function DetailObjectPage() {
//   const [object, setObject] = useState(null);
//   const [language, setLanguage] = useState('id'); // default bahasa Indonesia
//   const [isModalOpen, setModalOpen] = useState(false);
//   const { id } = useParams();
//   const router = useRouter();
//   const baseURL = 'http://localhost:9977';

//   useEffect(() => {
//     if (id) {
//       fetchObjectDetail(id);
//     }
//   }, [id, language]); // language dependency untuk update saat bahasa diubah

//   const fetchObjectDetail = async (objectId) => {
//     try {
//       const response = await axios.get(`${baseURL}/api/public/objects/get-by-id/${objectId}`);
//       console.log(response.data);
//       const data = response.data;

//       // Translate fields
//       const translatedCategory = await translateText(data.category_name, language);
//       const translatedLocation = await translateText(data.location, language);
//       const translatedDescription = await translateText(data.description, language);

//       // Set object dengan data terjemahan
//       setObject({
//         ...data,
//         category_name: translatedCategory,
//         location: translatedLocation,
//         description: translatedDescription,
//       });
//     } catch (error) {
//       console.error('Failed to fetch object detail', error);
//     }
//   };

//   // Fungsi translate menggunakan Google Translate API
//   const translateText = async (text, targetLang) => {
//     try {
//       const response = await axios.post(`https://translate.googleapis.com/translate_a/single`, null, {
//         params: {
//           client: 'gtx',
//           sl: 'auto',
//           tl: targetLang,
//           dt: 't',
//           q: text,
//         },
//       });
//       return response.data[0][0][0];
//     } catch (error) {
//       console.error('Translation error:', error);
//       return text; // Tampilkan teks asli jika gagal translate
//     }
//   };

//   if (!object) return <p>Loading...</p>;

//   // Parse image_url yang berupa string JSON menjadi array
//   const imageUrls = object.image_url ? JSON.parse(object.image_url) : [];

//   const handleLanguageChange = (newLanguage) => {
//     setLanguage(newLanguage);
//     setModalOpen(false); // Tutup modal setelah memilih bahasa
//   };

//   return (
//     <div className="container mx-auto p-5">
//       {/* Navbar */}
//       <div className="flex justify-between items-center py-4 border-b">
//         <div className="text-2xl font-bold">Logo</div>
//         <button
//           onClick={() => setModalOpen(true)}
//           className="p-2 border rounded-full hover:bg-gray-100"
//         >
//           <span className="material-icons">language</span>
//         </button>
//       </div>

//       {/* Popup Modal untuk ganti bahasa */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-5 rounded-lg w-full max-w-sm">
//             <h2 className="text-xl font-bold mb-4">Pilih Bahasa</h2>
//             <div className="flex flex-col gap-4">
//               <button
//                 onClick={() => handleLanguageChange('id')}
//                 className={`p-2 border rounded ${language === 'id' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 Indonesia
//               </button>
//               <button
//                 onClick={() => handleLanguageChange('en')}
//                 className={`p-2 border rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 English
//               </button>
//               <button
//                 onClick={() => handleLanguageChange('fr')}
//                 className={`p-2 border rounded ${language === 'fr' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 French
//               </button>
//               <button
//                 onClick={() => handleLanguageChange('es')}
//                 className={`p-2 border rounded ${language === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 Spanish
//               </button>
//               <button
//                 onClick={() => handleLanguageChange('nl')}
//                 className={`p-2 border rounded ${language === 'nl' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 Dutch
//               </button>
//               <button
//                 onClick={() => handleLanguageChange('de')}
//                 className={`p-2 border rounded ${language === 'de' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 German
//               </button>
//               <button
//                 onClick={() => handleLanguageChange('ja')}
//                 className={`p-2 border rounded ${language === 'ja' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 Japanese
//               </button>
//               <button
//                 onClick={() => handleLanguageChange('ko')}
//                 className={`p-2 border rounded ${language === 'ko' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//               >
//                 Korean
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Gambar objek berjajar horizontal */}
//       {imageUrls.length > 0 ? (
//         <div className="flex overflow-x-auto space-x-4 py-4 mb-4">
//           {imageUrls.map((imageUrl, index) => (
//             <img
//               key={index}
//               src={`${baseURL}${imageUrl}`}
//               alt={`Image ${index + 1}`}
//               className="w-64 h-48 object-cover rounded-md"
//             />
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500">No images available.</p>
//       )}

//       {/* Detail Objek */}
//       <div className="mb-4">
//         <h1 className="text-3xl font-bold mb-2">{object.name}</h1>
//         <p className="text-gray-700 mb-2">Kategori: {object.category_name}</p>
//         <p className="text-gray-500 mb-4">{object.location}</p>
//         {/* Menampilkan deskripsi dengan dangerouslySetInnerHTML */}
//         <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: object.description }}></p>
//         {/* <p className="text-gray-500 mb-4">{object.description}</p> */}
//       </div>
//     </div>
//   );
// }
















// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import axios from 'axios';

// export default function DetailObjectPage() {
//   const [object, setObject] = useState(null);
//   const [language, setLanguage] = useState('id'); // default bahasa Indonesia
//   const { id } = useParams();
//   const router = useRouter();
//   const baseURL = 'http://localhost:9977';

//   useEffect(() => {
//     if (id) {
//       fetchObjectDetail(id);
//     }
//   }, [id, language]); // language dependency untuk update saat bahasa diubah

//   const fetchObjectDetail = async (objectId) => {
//     try {
//       const response = await axios.get(`${baseURL}/api/public/objects/get-by-id/${objectId}`);
//       console.log(response.data);
//       const data = response.data;

//       // Translate fields
//       const translatedCategory = await translateText(data.category_name, language);
//       const translatedLocation = await translateText(data.location, language);
//       const translatedDescription = await translateText(data.description, language);

//       // Set object dengan data terjemahan
//       setObject({
//         ...data,
//         category_name: translatedCategory,
//         location: translatedLocation,
//         description: translatedDescription,
//       });
//     } catch (error) {
//       console.error('Failed to fetch object detail', error);
//     }
//   };

//   // Fungsi translate menggunakan Google Translate API
//   const translateText = async (text, targetLang) => {
//     try {
//       const response = await axios.post(`https://translate.googleapis.com/translate_a/single`, null, {
//         params: {
//           client: 'gtx',
//           sl: 'auto',
//           tl: targetLang,
//           dt: 't',
//           q: text,
//         },
//       });
//       return response.data[0][0][0];
//     } catch (error) {
//       console.error('Translation error:', error);
//       return text; // Tampilkan teks asli jika gagal translate
//     }
//   };

//   if (!object) return <p>Loading...</p>;
//   // Parse image_url yang berupa string JSON menjadi array
//   const imageUrls = object.image_url ? JSON.parse(object.image_url) : [];

//   return (
//     <div className="container mx-auto p-5">
//       <div className="mb-4">
//         <label htmlFor="language" className="mr-2">Pilih Bahasa:</label>
//         <select
//           id="language"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//           className="p-2 border rounded"
//         >
//           <option value="id">Indonesia</option>
//           <option value="en">English</option>
//           <option value="fr">French</option>
//           <option value="es">Spanish</option>
//           <option value="nl">Dutch</option>
//           <option value="de">German</option>
//           <option value="ja">Japanese</option>
//           <option value="ko">Korean</option>
//           <option value="zh-CN">Chinese (Simplified)</option>
//           <option value="zh-TW">Chinese (Traditional)</option>
//           <option value="pt">Portuguese</option>
//           <option value="ru">Russian</option>
//           <option value="ar">Arabic</option>
//           {/* Tambahkan bahasa lain sesuai kebutuhan */}
//         </select>
//       </div>
      
//       <h1 className="text-3xl font-bold mb-4">{object.name}</h1>
//       <p className="text-gray-700 mb-2">Kategori: {object.category_name}</p>
//       <p className="text-gray-500 mb-4">{object.location}</p>
//       {/* Render gambar-gambar dari imageUrls */}
//       {imageUrls.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//             {imageUrls.map((imageUrl, index) => (
//               <img
//                 key={index}
//                 src={`${baseURL}${imageUrl}`}
//                 alt={`Image ${index + 1}`}
//                 className="w-full h-64 object-cover rounded"
//               />
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500">No images available.</p>
//         )}
//       <p className="text-gray-700">{object.description}</p>
//     </div>
//   );
// }





