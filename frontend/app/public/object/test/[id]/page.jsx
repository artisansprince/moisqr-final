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

  
  // Export to PDF with images
  const exportToPDF = () => {
    const element = document.getElementById('export-content');
  
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
      const options = {
        margin: 1,
        filename: 'object-detail.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
  
      if (window.html2pdf) {
        html2pdf().set(options).from(element).save();
      } else {
        console.error('html2pdf library not loaded.');
      }
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
      
      <div id='export-content'>
      {/* Gambar objek berjajar horizontal */}
      {imageUrls.length > 0 ? (
        <div id="image-gallery" className="flex overflow-x-auto space-x-4 py-4 mb-4">
          {imageUrls.map((imageUrl, index) => (
            <img
              key={index}
              src={`${baseURL}${imageUrl}`}
              alt={`Image ${index + 1}`}
              className="w-64 h-48 object-cover rounded-md"
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











// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import axios from 'axios';
// import jsPDF from 'jspdf';

// export default function DetailObjectPageTest() {
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

//   // Fungsi untuk ekspor ke PDF
//   const exportToPDF = () => {
//     const pdf = new jsPDF();
  
//     // Render HTML yang sudah diisi dari API
//     pdf.html(document.querySelector(".desc-wrapper"), {
//       callback: function (pdf) {
//         let yPosition = pdf.internal.pageSize.height - 100; // Posisi awal untuk gambar
//         let columns = 3; // Jumlah kolom gambar
//         let imageWidth = 60;
//         let imageHeight = 60;
  
//         // Render gambar-gambar dalam format grid
//         imageUrls.forEach((imageUrl, index) => {
//           const img = new Image();
//           img.src = `${baseURL}${imageUrl}`;
//           img.onload = () => {
//             // Cek apakah gambar berada di luar halaman
//             if (yPosition + imageHeight > pdf.internal.pageSize.height) {
//               pdf.addPage();
//               yPosition = 10; // Reset posisi y untuk gambar di halaman baru
//             }
  
//             // Posisi gambar dalam grid
//             const xPosition = 10 + (index % columns) * (imageWidth + 10);
//             yPosition = 10 + Math.floor(index / columns) * (imageHeight + 10);
  
//             pdf.addImage(img, 'PNG', xPosition, yPosition, imageWidth, imageHeight);
  
//             // Jika gambar terakhir, simpan PDF setelah render selesai
//             if (index === imageUrls.length - 1) {
//               pdf.save(`${object.name || 'export'}.pdf`);
//             }
//           };
//         });
//       },
//       x: 10,
//       y: 10,
//       width: 180, // lebar konten HTML
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
//           <span className="material-icons">language</span>
//         </button>
//       </div>

//       {/* Popup Modal untuk ganti bahasa */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-5 rounded-lg w-full max-w-sm">
//             <h2 className="text-xl font-bold mb-4">Pilih Bahasa</h2>
//             <div className="flex flex-col gap-4">
//               {['id', 'en', 'fr', 'es', 'nl', 'de', 'ja', 'ko'].map((lang) => (
//                 <button
//                   key={lang}
//                   onClick={() => handleLanguageChange(lang)}
//                   className={`p-2 border rounded ${
//                     language === lang ? 'bg-blue-500 text-white' : 'bg-gray-100'
//                   }`}
//                 >
//                   {lang.toUpperCase()}
//                 </button>
//               ))}
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
//       <div className="object-detail-wrapper mb-4">
//         <h1 className="text-3xl font-bold mb-2">{object.name}</h1>
//         <p className="text-gray-700 mb-2">Kategori: {object.category_name}</p>
//         <p className="text-gray-500 mb-4">{object.location}</p>

//         <div
//           className="desc-wrapper"
//           dangerouslySetInnerHTML={{ __html: object.description }}
//         />
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

