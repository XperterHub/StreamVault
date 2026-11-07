export const DefaultHeadTags = () => {
  return (
    <>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <link rel="icon" href="/disney-plus-icon.ico" />
      <meta
        name="description"
        content="StreamVault - Next-Gen Cinema & Private Video Streaming Platform"
      />
      <meta property="og:image" content="/disney-plus-og.png" />
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
