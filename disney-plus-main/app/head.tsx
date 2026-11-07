export const DefaultHeadTags = () => {
  return (
    <>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <link rel="icon" href="/disney-plus-icon.ico" />
      <meta
        name="description"
        content="StreamVault - Stream high quality videos directly with Google Drive integration."
      />
      <meta property="og:image" content="/disney-plus-og.png" />
      <style>{`
        html, body {
          background-color: #0b0f19 !important;
          color: #f1f5f9 !important;
          margin: 0;
          padding: 0;
        }
      `}</style>
      <script
        async
        src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"
      />
    </>
  );
};

const Head = () => {
  return (
    <>
      <DefaultHeadTags />
      <title>StreamVault - Next-Gen Cinema</title>
    </>
  );
};

export default Head;
