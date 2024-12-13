'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import jsPDF from 'jspdf';



export default function DetailObjectPageTry() {
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
  }, [id, language]);

  const fetchObjectDetail = async (objectId) => {
    try {
      const response = await axios.get(`${baseURL}/api/public/objects/get-by-id/${objectId}`);
      const data = response.data;
      console.log(response.data);

      // Translate fields melalui backend
      const translatedName = await translateText(data.name);
      const translatedCategory = await translateText(data.category_name);
      const translatedLocation = await translateText(data.location);
      const translatedDescription = await translateText(data.description);

      // Update state dengan data terjemahan
      setObject({
        ...data,
        name:translatedName,
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
      console.log(response.data.translatedText);
      return response.data.translatedText || text; // Gunakan teks asli jika translate gagal
    } catch (error) {
      console.error('Translation error:', error.message);
      return text; // Tampilkan teks asli jika gagal translate
    }
  };

  useEffect(() => {
    if (object) {
      // Terjemahkan konten setelah objek selesai dimuat
    }
  }, [object, language]);

  if (!object) return <p>Loading...</p>;

  // Parse image_url yang berupa string JSON menjadi array
  const imageUrls = object.image_url ? JSON.parse(object.image_url) : [];

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setModalOpen(false); // Tutup modal setelah memilih bahasa
  };

  // Mapping list bahasa
  const languageMap = {
    en: 'English',
    id: 'Bahasa Indonesia',
    fr: 'Français',
    es: 'Español',
    nl: 'Nederlands',
    de: 'Deutsch',
    ja: '日本語',
    ko: '한국어',
    zh: '中文 (简体)', // Simplified Chinese
    'zh-TW': '中文 (繁體)', // Traditional Chinese
  };

  
  // Export to PDF with images
  const exportToPDF = () => {
    const element = document.getElementById('export-content'); // Elemen HTML yang mau di-export
    
    // Tunggu semua gambar selesai dimuat
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve; // Tetap resolve meskipun gagal load
          }
        })
    );

    Promise.all(imagePromises).then(() => {
      const pdf = new jsPDF({
        unit: 'px', // Satuan untuk ukuran
        format: 'a4', // Format kertas
      });

      pdf.html(element, {
        callback: (doc) => {
          doc.save(object.name);
        },
        x: 20, // Margin kiri
        y: 20, // Margin atas
        html2canvas: {
          scale: 0.9 / window.devicePixelRatio, // Sesuaikan dengan rasio pixel
          useCORS: true,
        },
      });
    });
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
          <span className="material-icons">icons-tsl</span>
        </button>
      </div>

      {/* Popup Modal untuk ganti bahasa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Pilih Bahasa</h2>
            <div className="flex flex-col gap-4">
              {Object.keys(languageMap).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`p-2 border rounded ${
                    language === lang ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  {languageMap[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div id='export-content'>
      {/* Gambar objek berjajar horizontal */}
      {imageUrls.length > 0 ? (
        <div id="image-gallery" className="flex overflow-x-auto space-x-4 py-4 mb-4">
          {imageUrls.map((imageUrl, index) => (
            <img
              key={index}
              src={`${baseURL}${imageUrl}`}
              alt={`Image ${index + 1}`}
              className="h-48 rounded-md"
              crossOrigin="anonymous"
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No images available.</p>
      )}

      {/* Detail Objek */}
      <div className="object-detail-wrapper mb-4">
        <h1 className="text-3xl font-bold mb-2">{object.name}</h1>
        <p className="text-gray-700 mb-2">Kategori: {object.category_name}</p>
        <p className="text-gray-500 mb-4">{object.location}</p>

        <div
          id='object-description'
          className="desc-wrapper"
          dangerouslySetInnerHTML={{ __html: object.description }}
        />
      </div>
      </div>

      {/* Tombol untuk export PDF */}
      <button
        onClick={exportToPDF}
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export to PDF
      </button>
    </div>
  );
}














// ===================================================
// Semua lancar tapi text di pdf tidak bisa di copy
// ===================================================

// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import axios from 'axios';
// import jsPDF from 'jspdf';



// export default function DetailObjectPageTry() {
//   const [object, setObject] = useState(null);
//   const [language, setLanguage] = useState('en'); // Default bahasa Inggris
//   const [isModalOpen, setModalOpen] = useState(false);
//   const { id } = useParams();
//   const router = useRouter();
//   const baseURL = 'http://localhost:9977';

//   useEffect(() => {
//     if (id) {
//       fetchObjectDetail(id);
//     }
//   }, [id, language]);

//   const fetchObjectDetail = async (objectId) => {
//     try {
//       const response = await axios.get(`${baseURL}/api/public/objects/get-by-id/${objectId}`);
//       const data = response.data;
//       console.log(response.data);

//       // Translate fields melalui backend
//       const translatedName = await translateText(data.name);
//       const translatedCategory = await translateText(data.category_name);
//       const translatedLocation = await translateText(data.location);
//       const translatedDescription = await translateText(data.description);

//       // Update state dengan data terjemahan
//       setObject({
//         ...data,
//         name:translatedName,
//         category_name: translatedCategory,
//         location: translatedLocation,
//         description: translatedDescription,
//       });
//     } catch (error) {
//       console.error('Failed to fetch object detail:', error.message);
//     }
//   };

//   // Fungsi translate menggunakan endpoint backend
//   const translateText = async (text) => {
//     try {
//       const response = await axios.post(`${baseURL}/api/public/objects/translate`, {
//         text: text,
//         targetLang: language,
//       });
//       console.log(response.data.translatedText);
//       return response.data.translatedText || text; // Gunakan teks asli jika translate gagal
//     } catch (error) {
//       console.error('Translation error:', error.message);
//       return text; // Tampilkan teks asli jika gagal translate
//     }
//   };

//   useEffect(() => {
//     if (object) {
//       // Terjemahkan konten setelah objek selesai dimuat
//     }
//   }, [object, language]);

//   if (!object) return <p>Loading...</p>;

//   // Parse image_url yang berupa string JSON menjadi array
//   const imageUrls = object.image_url ? JSON.parse(object.image_url) : [];

//   const handleLanguageChange = (newLanguage) => {
//     setLanguage(newLanguage);
//     setModalOpen(false); // Tutup modal setelah memilih bahasa
//   };

//   // Mapping list bahasa
//   const languageMap = {
//     en: 'English',
//     id: 'Bahasa Indonesia',
//     fr: 'Français',
//     es: 'Español',
//     nl: 'Nederlands',
//     de: 'Deutsch',
//     ja: '日本語',
//     ko: '한국어',
//     zh: '中文 (简体)', // Simplified Chinese
//     'zh-TW': '中文 (繁體)', // Traditional Chinese
//   };

  
//   // Export to PDF with images
//   const exportToPDF = () => {
//     const element = document.getElementById('export-content'); // Elemen HTML yang mau di-export
    
//     // Tunggu semua gambar selesai dimuat
//     const images = element.querySelectorAll('img');
//     const imagePromises = Array.from(images).map(
//       (img) =>
//         new Promise((resolve) => {
//           if (img.complete) {
//             resolve();
//           } else {
//             img.onload = resolve;
//             img.onerror = resolve; // Tetap resolve meskipun gagal load
//           }
//         })
//     );

//     Promise.all(imagePromises).then(() => {
//       const pdf = new jsPDF({
//         unit: 'px', // Satuan untuk ukuran
//         format: 'a4', // Format kertas
//       });

//       pdf.html(element, {
//         callback: (doc) => {
//           doc.save(object.name);
//         },
//         x: 20, // Margin kiri
//         y: 20, // Margin atas
//         html2canvas: {
//           scale: 0.9 / window.devicePixelRatio, // Sesuaikan dengan rasio pixel
//           useCORS: true,
//         },
//       });
//     });
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
//           <span className="material-icons">icons-tsl</span>
//         </button>
//       </div>

//       {/* Popup Modal untuk ganti bahasa */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-5 rounded-lg w-full max-w-sm">
//             <h2 className="text-xl font-bold mb-4">Pilih Bahasa</h2>
//             <div className="flex flex-col gap-4">
//               {Object.keys(languageMap).map((lang) => (
//                 <button
//                   key={lang}
//                   onClick={() => handleLanguageChange(lang)}
//                   className={`p-2 border rounded ${
//                     language === lang ? 'bg-blue-500 text-white' : 'bg-gray-100'
//                   }`}
//                 >
//                   {languageMap[lang]}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
      
//       <div id='export-content'>
//       {/* Gambar objek berjajar horizontal */}
//       {imageUrls.length > 0 ? (
//         <div id="image-gallery" className="flex overflow-x-auto space-x-4 py-4 mb-4">
//           {imageUrls.map((imageUrl, index) => (
//             <img
//               key={index}
//               src={`${baseURL}${imageUrl}`}
//               alt={`Image ${index + 1}`}
//               className="h-48 rounded-md"
//               crossOrigin="anonymous"
//             />
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500">No images available.</p>
//       )}

//       {/* Detail Objek */}
//       <div className="object-detail-wrapper mb-4">
//         <h1 className="text-3xl font-bold mb-2">{object.name}</h1>
//         <p className="text-gray-700 mb-2">Kategori: {object.category_name}</p>
//         <p className="text-gray-500 mb-4">{object.location}</p>

//         <div
//           id='object-description'
//           className="desc-wrapper"
//           dangerouslySetInnerHTML={{ __html: object.description }}
//         />
//       </div>
//       </div>

//       {/* Tombol untuk export PDF */}
//       <button
//         onClick={exportToPDF}
//         className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//       >
//         Export to PDF
//       </button>
//     </div>
//   );
// }