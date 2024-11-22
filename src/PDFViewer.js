

import React, { useEffect, useState } from 'react';

function AdobePDFViewer({ 
  pdfUrl="/mypdf.pdf", 
  clientId="e45ea6964465450fbc12e9a8329542d4", 
  divId = 'adobe-dc-view',
  height = '600px',
  width = '100%'
}) {
  const [adobeDCView, setAdobeDCView] = useState(null);
  const [fileRef, setFileRef] = useState(null);

  useEffect(() => {
    // Dynamically load Adobe View SDK
    const script = document.createElement('script');
    script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Wait for Adobe SDK to be ready
      document.addEventListener('adobe_dc_view_sdk.ready', () => {
        if (window.AdobeDC && window.AdobeDC.View) {
          const dcView = new window.AdobeDC.View({
            clientId: clientId,
            divId: divId
          });
          
          dcView.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.SAVE_API,
            function (event) {
              console.log("event triggered",event,event.data)
              if (event.type === "PAGE_ZOOM") {
                window.alert("zoom triggered")
                console.log("Zoom event triggered!");
                console.log("Zoom level:", event.data.zoom);
              }
            },
            {
              enablePDFAnalytics: true, // Enables events like PAGE_ZOOM
            }
          );
          const fileReference = dcView.previewFile({
            content: { location: { url: pdfUrl } },
            metaData: { fileName: pdfUrl }
          }, {
            // Additional configuration options can be added here
            showAnnotationTools: false,
            dockPageControls: false,
            
            // embedMode: "FULL_WINDOW",
            defaultViewMode: "FIT_PAGE",
            // enableLinearization: true,
            showDownloadPDF: false,
            // showPrintPDF: true,
            showLeftHandPanel: false,
            // showAnnotationTools: false,
            enableFormFilling: true, // Ensure form filling is enabled
            showSaveButton: true, // Enable Save button
            enableAnnotationAPIs: true,
            // includePDFAnnotations: true,
            showPageControls: false,
            showZoomControl: true,
            // showRotateControl: false,
            disableTextSelection: true,
            // annotationManagerEditMode: "READ",
            // showBookmarks:false,
            // showThumbnails:false,
          });
        
          // Store the Adobe DC View and file reference
          setAdobeDCView(dcView);
          setFileRef(fileReference);
        }
      });
 
    };

    // Cleanup function
    return () => {
      document.body.removeChild(script);
    };
  }, [pdfUrl, clientId, divId]);


  return (
    <div>
      <div 
        id={divId}
        style={{
          width: width,
          height: height
        }}
      />
      <button 
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Save PDF
      </button>
    </div>
  );
}

export default AdobePDFViewer;