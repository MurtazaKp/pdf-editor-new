import React, { useEffect, useState } from "react";

function AdobePDFViewer({
  pdfUrl = "/mypdf.pdf",
  clientId = "03f213c054df4ea3a738b20fc21c9fa8",
  divId = "adobe-dc-view",
  height = "600px",
  width = "100%",
}) {
  const [adobeDCView, setAdobeDCView] = useState(null);
  const [fileRef, setFileRef] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
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

          // Register save callback to handle blob
          dcView.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.SAVE_API,
            function (metaData, content, options, blob) {
              console.log("Save triggered", { metaData, content });

              // Store the blob
              setPdfBlob(blob);
              setLastSaved(new Date().toISOString());

              return new Promise((resolve) => {
                resolve({
                  code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
                  data: {
                    metaData: metaData,
                  },
                });
              });
            },
            {
              autoSaveFrequency: 0.25, // Check every 250ms
              enableFocusPolling: true,
              showSaveButton: true,
            }
          );

          // Register zoom callback
          dcView.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.SAVE_API,
            function (event) {
              if (event.type === "PAGE_ZOOM") {
                console.log("Zoom level:", event.data.zoom);
              }
            },
            {
              enablePDFAnalytics: true,
            }
          );

          const fileReference = dcView.previewFile(
            {
              content: { location: { url: pdfUrl } },
              metaData: { fileName: pdfUrl, id: "test" },
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
          setFileRef(fileReference);
        }
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [pdfUrl, clientId, divId]);

  const handleSave = async () => {
    if (pdfBlob) {
      try {
        // Create download link for blob
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error saving PDF:", error);
        alert("Error saving PDF. Please try again.");
      }
    } else {
      alert("No PDF content available yet. Please make changes first.");
    }
  };

  // Function to get the current blob (can be exposed through props if needed)
  const getCurrentBlob = () => pdfBlob;

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
