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
      <title>Disney Plus</title>
    </>
  );
};

export default Head;
