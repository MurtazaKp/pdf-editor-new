import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";

function AdobePDFViewer({
  pdfUrl = "/mypdf.pdf",
  clientId = "03f213c054df4ea3a738b20fc21c9fa8",
  divId = "adobe-dc-view",
  height = "600px",
  width = "100%",
}) {
  const [adobeDCView, setAdobeDCView] = useState(null);
  const [pdfContent, setPdfContent] = useState(null); // For base64 content
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    // Dynamically load Adobe View SDK
    const script = document.createElement("script");
    script.src = "https://acrobatservices.adobe.com/view-sdk/viewer.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      document.addEventListener("adobe_dc_view_sdk.ready", () => {
        if (window.AdobeDC && window.AdobeDC.View) {
          const dcView = new window.AdobeDC.View({
            clientId: clientId,
            divId: divId,
          });

          // Register save callback
          dcView.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.SAVE_API,
            async (metaData, content) => {
              console.log("Save triggered", { metaData, content });
              setPdfContent(content);
              setLastSaved(new Date().toISOString());

              return {
                code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
                data: { metaData },
              };
            },
            {
              showSaveButton: true,
            }
          );

          // Register event listener for zoom
          dcView.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
            (event) => {
              if (event.type === "PAGE_ZOOM") {
                console.log("Zoom level:", event.data.zoom);
              }
            },
            {
              enablePDFAnalytics: true,
            }
          );

          dcView.previewFile(
            {
              content: { location: { url: pdfUrl } },
              metaData: { fileName: pdfUrl, id:"sjisifjij" },
            },
            {
              showAnnotationTools: false,
              dockPageControls: false,
              defaultViewMode: "FIT_PAGE",
              showDownloadPDF: false,
              showLeftHandPanel: false,
              enableFormFilling: true,
              showSaveButton: true,
              enableAnnotationAPIs: true,
              showPageControls: false,
              showZoomControl: true,
              disableTextSelection: true,
            }
          );

          setAdobeDCView(dcView);
        }
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [pdfUrl, clientId, divId]);

console.log(pdfContent,'here-----------');
  
 const handleSave = () => {
   if (pdfContent) {
     try {
       // Decode base64 content to a Blob
       const byteCharacters = atob(pdfContent);
       const byteNumbers = new Array(byteCharacters.length).map((_, i) =>
         byteCharacters.charCodeAt(i)
       );
       const byteArray = new Uint8Array(byteNumbers);
       const blob = new Blob([byteArray], { type: "application/pdf" });

       // Use saveAs to trigger file download
       saveAs(blob, "document.pdf");
     } catch (error) {
       console.error("Error saving PDF:", error);
       alert("Error saving PDF. Please try again.");
     }
   } else {
     alert("No PDF content available yet. Please make changes first.");
   }
 };

  return (
    <div>
      <div
        id={divId}
        style={{
          width: width,
          height: height,
        }}
      />
      <button
        onClick={handleSave}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Save PDF
      </button>
      {lastSaved && (
        <div style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          Last saved: {new Date(lastSaved).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default AdobePDFViewer;
