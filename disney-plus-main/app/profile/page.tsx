import Collection from "../../components/sections/collection";
import Cover from "../../components/sections/cover";
import User from "../../components/sections/user";
import Content from "../../components/layouts/content";
import shuffleMedias from "../../helpers/shuffle-medias";
import api from "../../library/api";

const Page = async () => {
  let popularMedias: any[] = [];
  try {
    const popularMovies = await api.get.medias.group({
      name: "popular",
      type: "movies",
      page: 1,
    });
    const popularSeries = await api.get.medias.group({
      name: "popular",
      type: "series",
      page: 1,
    });
    popularMedias = shuffleMedias([...popularMovies, ...popularSeries]);
  } catch (e) {
    // If API fails, show empty collection — profile still renders
    popularMedias = [];
  }

  return (
    <>
      <Cover company="disney-plus" />
      <Content variant="secondary">
        {/* @ts-ignore */}
        <User />
        {popularMedias.length > 0 && (
          <Collection.Landscape
            name="Just for you"
            medias={popularMedias}
            isOnlyGrid
          />
        )}
      </Content>
    </>
  );
};

export default Page;
