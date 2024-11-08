import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

const UploadFile = () => {
  const [selectedDocs, setSelectedDocs] = useState<File[]>([]);

  let excelFiles = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];
  let wordFiles = [
    "Application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<[]>([]);
  const [nonExcel, setNonExcel] = useState<[]>([]);
  const onDrop = useCallback((acceptedFile: any) => {
    if (acceptedFile?.length) {
      setFile(acceptedFile[0]);
      console.log(" acceptedFile: " + acceptedFile[0]);

      // File is EXCEL //
      if (acceptedFile && excelFiles.includes(acceptedFile[0].type)) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(acceptedFile[0]);
        reader.onload = (e: any) => {
          setFile(e?.target?.result);

          debugger;
          console.log(" e?.target?.result : " + e?.target?.result);
          if (e?.target?.result !== null) {
            const workbook = XLSX.read(e?.target?.result, { type: "buffer" });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const data: any = XLSX.utils.sheet_to_json(worksheet);
            console.log(" data : " + data);

            setFileContent(data);
          }
        };
      }
      // All other Types //
      if (acceptedFile && !excelFiles.includes(acceptedFile[0].type)) {
        setFile(acceptedFile[0]);

        const docs: any = [
          {
            uri: window.URL.createObjectURL(acceptedFile[0]),
            fileName: acceptedFile[0].name,
          }, // Remote file
        ];
        setNonExcel(docs);
      }
    }
  }, []);

  console.log(" selectedDocs : " + selectedDocs[0]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // "image/*": [],
    },
    maxFiles: 1,
    noClick: true,
  });

  // const handleUpload = (acceptedFiles: any) => {
  //   console.log("logging drop/selected file", acceptedFiles);
  // };
  // console.log("fileContent : ", fileContent);

  return (
    <>
      <div className="main-container">
        <h2>Drop your file Below : </h2>
        <div className="dropzone" {...getRootProps({})}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here</p>
          ) : (
            <p>Drag and Drop the file here</p>
          )}
        </div>
        {file && <p>File Uploaded Successfully</p>}
        {/* view data */}
        <div className="viewer">
          {fileContent?.length ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(fileContent[0])?.map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {fileContent?.map(
                    (individualExcelData: any, index: number) => (
                      <tr key={index}>
                        {Object.keys(individualExcelData).map((key) => (
                          <td key={key}>{individualExcelData[key]}</td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // <div>No File is uploaded yet!</div>
            <DocViewer
              documents={nonExcel}
              pluginRenderers={DocViewerRenderers}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default UploadFile;
