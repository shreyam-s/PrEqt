'use client';

import Pitchdeck from "../overview/pitch-deck-section/pitchdeck";
import styles from "./page.module.css";
import { useDealStore } from "@/store/dealStore";

export default function Documentation({ isPrivateDeal }) {
  const dealDetails = useDealStore((state) => state.dealDetails);

  const isofs = dealDetails?.data?.deal_type === "ofs";
  const isPrivateLike = isPrivateDeal || isofs;

  const toAbsoluteFilePath = (filePath) => {
    if (!filePath) return null;
    const baseUrl = process.env.NEXT_PUBLIC_USER_BASE || 'https://preqty.webninjaz.com';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanFilePath = filePath.replace(/^public\//, '');
    return `${cleanBaseUrl}/admin/${cleanFilePath}`;
  };

  const getDocumentsFromAPI = () => {
    try {
      const dealDocs = dealDetails?.data?.deal_documents;
      if (!dealDocs || typeof dealDocs !== "object") return [];

      const apiDocuments = Object.values(dealDocs);

      return apiDocuments
        .filter((doc) => doc && doc.status === true)
        .map((doc) => {
          const hasFiles = Array.isArray(doc.file) && doc.file.length > 0;
          const firstFile = hasFiles ? doc.file[0] : null;

          return {
            name: doc.label_name || "Document",
            type: doc.type,
            fileUrl: hasFiles ? toAbsoluteFilePath(firstFile.path) : null,
            fileName: hasFiles ? firstFile.fileName : null,
            hasFile: hasFiles,
          };
        });
    } catch (error) {
      console.error("Error processing documents:", error);
      return [];
    }
  };

  // ✅ Get all documents
  const documents = getDocumentsFromAPI();

  // ✅ Extract pitch deck URL
  const pitchDeckDoc = documents.find((doc) => doc.type === "pitch-deck");
  const pitchDeckFileUrl = pitchDeckDoc?.fileUrl || null;

  // ✅ Exclude pitch deck from the document list
  const filteredDocuments = documents.filter((doc) => doc.type !== "pitch-deck");

  return (
    <div className={styles.docWrapper}>
      {/* ✅ Show Pitch Deck separately */}
      <Pitchdeck isPrivateDeal={isPrivateLike} pdfUrl={pitchDeckFileUrl} />

      <div className={isPrivateLike ? styles.privateContainer : styles.container}>
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc, idx) => (
            <div key={idx} className={styles.item}>
              <span>{doc.name}</span>
              {doc.hasFile ? (
                <a
                  href={doc.fileUrl}
                  download={doc.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                  >
                    <path
                      d="M4 22.75H18C18.5304 22.75 19.0391 22.5393 19.4142 22.1642C19.7893 21.7891 20 21.2804 20 20.75V7.75L15 2.75H6C5.46957 2.75 4.96086 2.96071 4.58579 3.33579C4.21071 3.71086 4 4.21957 4 4.75V8.75"
                      stroke="#B59131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2.75V6.75C14 7.28043 14.2107 7.78914 14.5858 8.16421C14.9609 8.53929 15.4696 8.75 16 8.75H20"
                      stroke="#B59131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 15.75L5 17.75L9 13.75"
                      stroke="#B59131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ) : (
                <span style={{ opacity: 0.5 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                  >
                    <path
                      d="M4 22.75H18..."
                      stroke="#B59131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          ))
        ) : (
          <div className={styles.item}>
            <span>No documents available</span>
          </div>
        )}
      </div>
    </div>
  );
}
