import { SearchParams } from "@/types/params";
import CategoriesIndex from "./page.client";
import { panginatedCategoriesSchema } from "@/schemas/category.schema";
import { getCategoriesInfinite } from "@/services/categories/actions/category.actions";

type CategoriesPageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async (props: CategoriesPageProps) => {
  const searchParams = await props.searchParams;

  const search = panginatedCategoriesSchema.parse(searchParams);

  const categoriesPromise = getCategoriesInfinite(search);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <CategoriesIndex categoriesPromise={categoriesPromise} />
    </div>
  );
};

export default Page;
